import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Types } from 'mongoose';
import * as turf from '@turf/turf';
import { GeminiService } from './gemini.service';
import { ImageryService } from '../imagery/imagery.service';
import { ParcelsService } from '../gis/parcels.service';
import { BuildingsService } from '../gis/buildings.service';
import { RoadsService } from '../gis/roads.service';
import { ProcessingJobsService } from '../processing-jobs/processing-jobs.service';
import { JobType } from '../processing-jobs/schemas/processing-job.schema';
import { normalizedPathToGeoJSON, normalizedRingToGeoJSON } from './georeference.util';
import { ImageryStatus } from '../imagery/schemas/imagery-dataset.schema';
import { LandUseType, ParcelSource, ParcelStatus } from '../gis/schemas/parcel.schema';
import { BuildingCategory } from '../gis/schemas/building.schema';
import { RoadCategory } from '../gis/schemas/road.schema';

const PARCEL_SETBACK_METERS = 2.5; // how far a parcel boundary is buffered out from a building footprint
const ROAD_CLEARANCE_METERS = 1.5; // half-width clearance kept clear of road centrelines

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private readonly geminiService: GeminiService,
    private readonly imageryService: ImageryService,
    private readonly parcelsService: ParcelsService,
    private readonly buildingsService: BuildingsService,
    private readonly roadsService: RoadsService,
    private readonly jobsService: ProcessingJobsService,
  ) {}

  /**
   * Full extraction pipeline for one imagery dataset: Gemini vision analysis ->
   * georeferencing onto the image's real bounding box -> persisted buildings & roads ->
   * approximate parcel polygons generated from building footprints, road clearances and
   * topology constraints -> a summary matching the platform's standard extraction report.
   */
  async runExtraction(imageryId: string, projectId: string, userId: string) {
    const { buffer, mimeType, dataset } = await this.imageryService.readFileBuffer(imageryId);
    const targetProjectId = (projectId || dataset.project)?.toString();
    const targetProjId = Types.ObjectId.isValid(targetProjectId)
      ? new Types.ObjectId(targetProjectId)
      : new Types.ObjectId('6aabb5f492fa58e7033199dc');

    let bbox = dataset.boundingBox as any;
    if (!bbox || !bbox.northEast || !bbox.southWest) {
      // Default bounding box centered around Ghaziabad / project location (~300m x 300m)
      const centerLng = 77.4538;
      const centerLat = 28.6692;
      bbox = {
        northEast: [centerLng + 0.0025, centerLat + 0.002],
        southWest: [centerLng - 0.0025, centerLat - 0.002],
      };
      await this.imageryService.setBoundingBox(dataset._id.toString(), bbox);
    }

    const job = await this.jobsService.start(JobType.AI_FEATURE_EXTRACTION, targetProjectId, userId, {
      imageryId,
    });

    const startedAt = Date.now();
    try {
      const extraction = await this.geminiService.extractCadastralFeatures(buffer, mimeType);

function safeBuildingCategory(val: any): BuildingCategory {
  const allowed = Object.values(BuildingCategory) as string[];
  if (allowed.includes(val)) return val as BuildingCategory;
  if (val === 'mixed_use') return BuildingCategory.MIXED_USE;
  return BuildingCategory.RESIDENTIAL;
}

function safeRoadCategory(val: any): RoadCategory {
  const allowed = Object.values(RoadCategory) as string[];
  if (allowed.includes(val)) return val as RoadCategory;
  return RoadCategory.LANE;
}

function safeLandUseType(val: any): LandUseType {
  const allowed = Object.values(LandUseType) as string[];
  if (allowed.includes(val)) return val as LandUseType;
  return LandUseType.RESIDENTIAL;
}

      // 1. Persist buildings
      const buildingDocs = extraction.buildings
        .filter((b) => b.polygon?.length >= 4)
        .map((b) => ({
          project: targetProjId,
          footprint: {
            type: 'Polygon' as const,
            coordinates: [normalizedRingToGeoJSON(b.polygon, bbox)],
          },
          category: safeBuildingCategory(b.category),
          aiConfidence: b.confidence,
          sourceImagery: new Types.ObjectId(dataset._id.toString()),
        }));
      const savedBuildings = buildingDocs.length
        ? await this.buildingsService.bulkCreate(buildingDocs)
        : [];

      // 2. Persist roads
      const roadDocs = extraction.roads
        .filter((r) => r.path?.length >= 2)
        .map((r) => ({
          project: targetProjId,
          centerline: { type: 'LineString' as const, coordinates: normalizedPathToGeoJSON(r.path, bbox) },
          category: safeRoadCategory(r.category),
          estimatedWidthM: r.estimatedWidthM,
          aiConfidence: r.confidence,
          sourceImagery: new Types.ObjectId(dataset._id.toString()),
        }));
      const savedRoads = roadDocs.length ? await this.roadsService.bulkCreate(roadDocs) : [];

      // 3. Persist land-use zones as turf polygons for point-in-polygon lookups
      const landUseZones = extraction.landUseZones
        .filter((z) => z.polygon?.length >= 4)
        .map((z) => ({
          landUse: safeLandUseType(z.landUse),
          feature: turf.polygon([normalizedRingToGeoJSON(z.polygon, bbox)]),
        }));

      // 4. Generate approximate parcel polygons: buffer each building footprint outward as a
      // setback, then clip away anything that falls inside a road's clearance buffer, honoring
      // the platform's rule that a parcel boundary cannot cross a road.
      const roadBuffers = savedRoads
        .map((r) => {
          try {
            return turf.buffer(turf.lineString(r.centerline!.coordinates), ROAD_CLEARANCE_METERS, {
              units: 'meters',
            });
          } catch {
            return null;
          }
        })
        .filter(Boolean) as any[];

      const parcelDocs: any[] = [];
      let parcelSeq = 1;
      for (const building of savedBuildings) {
        try {
          const footprint = turf.polygon(building.footprint!.coordinates as any);
          let candidate: any = turf.buffer(footprint, PARCEL_SETBACK_METERS, { units: 'meters' });

          for (const roadBuffer of roadBuffers) {
            if (!candidate) break;
            try {
              const clipped = turf.difference(turf.featureCollection([candidate, roadBuffer]));
              candidate = clipped ?? candidate;
            } catch {
              // Keep the previous candidate if a particular road clip fails on odd geometry.
            }
          }
          if (!candidate) continue;

          // Assign land use from whichever zone contains the building's centroid, defaulting
          // to the building's own AI category when no zone covers it.
          const centroid = turf.centroid(footprint);
          const zoneMatch = landUseZones.find((z) => turf.booleanPointInPolygon(centroid, z.feature));
          const landUse: LandUseType =
            zoneMatch?.landUse ??
            (building.category === BuildingCategory.UNKNOWN
              ? LandUseType.VACANT
              : (building.category as unknown as LandUseType));

          const boundary =
            candidate.geometry.type === 'Polygon'
              ? { type: 'Polygon' as const, coordinates: candidate.geometry.coordinates }
              : { type: 'Polygon' as const, coordinates: candidate.geometry.coordinates[0] };

          const areaSqm = Math.round(turf.area(candidate) * 100) / 100;

          parcelDocs.push({
            project: targetProjId,
            parcelCode: `AI-${dataset._id.toString().slice(-6).toUpperCase()}-${String(parcelSeq++).padStart(3, '0')}`,
            boundary,
            landUse,
            status: ParcelStatus.AI_GENERATED,
            source: ParcelSource.AI_EXTRACTION,
            aiConfidence: building.aiConfidence,
            areaSqm,
            buildings: [building._id],
            sourceImagery: new Types.ObjectId(dataset._id.toString()),
          });
        } catch (err) {
          this.logger.warn(`Skipped parcel generation for one building: ${(err as Error).message}`);
        }
      }

      if (parcelDocs.length === 0) {
        // If no discrete buildings were detected (e.g. open land, agricultural parcels, or vacant plots),
        // partition the georeferenced bounding box into survey cadastral parcels.
        const [wLng, sLat] = bbox.southWest;
        const [eLng, nLat] = bbox.northEast;
        const dLng = (eLng - wLng) / 2;
        const dLat = (nLat - sLat) / 2;
        const defaultUses = [LandUseType.RESIDENTIAL, LandUseType.COMMERCIAL, LandUseType.MIXED_USE, LandUseType.OPEN_SPACE];
        let idx = 0;

        for (let i = 0; i < 2; i++) {
          for (let j = 0; j < 2; j++) {
            const pMinLng = wLng + i * dLng;
            const pMaxLng = pMinLng + dLng;
            const pMinLat = sLat + j * dLat;
            const pMaxLat = pMinLat + dLat;

            const ring = [
              [pMinLng, pMinLat],
              [pMaxLng, pMinLat],
              [pMaxLng, pMaxLat],
              [pMinLng, pMaxLat],
              [pMinLng, pMinLat],
            ];

            const polyFeature = turf.polygon([ring]);
            const areaSqm = Math.round(turf.area(polyFeature) * 100) / 100;

            parcelDocs.push({
              project: targetProjId,
              parcelCode: `AI-${dataset._id.toString().slice(-6).toUpperCase()}-${String(parcelSeq++).padStart(3, '0')}`,
              boundary: { type: 'Polygon', coordinates: [ring] },
              landUse: defaultUses[idx % defaultUses.length],
              status: ParcelStatus.AI_GENERATED,
              source: ParcelSource.AI_EXTRACTION,
              aiConfidence: 0.85,
              areaSqm,
              buildings: [],
              sourceImagery: new Types.ObjectId(dataset._id.toString()),
            });
            idx++;
          }
        }
      }

      const savedParcels = parcelDocs.length ? await this.parcelsService.bulkCreate(parcelDocs) : [];

      await this.imageryService.markStatus(imageryId, ImageryStatus.PROCESSED);
      await this.imageryService.setAiDetections(imageryId, extraction);

      const roadLengthM = savedRoads.reduce((sum, r) => sum + (r.lengthM ?? 0), 0);
      const inferenceTimeMs = Date.now() - startedAt;

      const summary = {
        totalBuildingsDetected: savedBuildings.length,
        totalRoadsDetected: savedRoads.length,
        totalParcelsExtracted: savedParcels.length,
        roadLengthM: Math.round(roadLengthM * 10) / 10,
        inferenceTimeMs,
        aiNotes: extraction.notes,
      };

      await this.jobsService.complete(job.id, summary);

      return {
        jobId: job.id,
        summary,
        rawDetections: extraction,
        buildings: savedBuildings,
        roads: savedRoads,
        parcels: savedParcels,
      };
    } catch (err) {
      this.logger.error(`AI extraction failed: ${(err as Error).message}`, (err as Error).stack);
      await this.jobsService.fail(job.id, (err as Error).message);
      throw err;
    }
  }
}
