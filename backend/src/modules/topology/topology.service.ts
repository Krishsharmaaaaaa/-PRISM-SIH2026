import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as turf from '@turf/turf';
import { TopologyReport, TopologyReportDocument, TopologyIssueType } from './schemas/topology-report.schema';
import { Parcel, ParcelDocument } from '../gis/schemas/parcel.schema';

interface RawIssue {
  type: TopologyIssueType;
  parcelIds: string[];
  description: string;
  location: any;
  severity: 'low' | 'medium' | 'high';
}

@Injectable()
export class TopologyService {
  constructor(
    @InjectModel(TopologyReport.name) private readonly reportModel: Model<TopologyReportDocument>,
    @InjectModel(Parcel.name) private readonly parcelModel: Model<ParcelDocument>,
  ) {}

  async validateProject(projectId: string): Promise<TopologyReportDocument> {
    const pid = Types.ObjectId.isValid(projectId) ? new Types.ObjectId(projectId) : null;
    const filter = pid ? { $or: [{ project: pid }, { project: projectId }] } : { project: projectId };
    const parcels = await this.parcelModel.find(filter);
    const issues: RawIssue[] = [];

    const validParcels: { id: string; feature: any }[] = [];

    // 1. Invalid geometry & self-intersection checks
    for (const parcel of parcels) {
      try {
        const feature = turf.polygon(parcel.boundary.coordinates as any);
        const ring = parcel.boundary.coordinates[0];
        const isClosed =
          ring.length >= 4 &&
          ring[0][0] === ring[ring.length - 1][0] &&
          ring[0][1] === ring[ring.length - 1][1];

        if (!isClosed || ring.length < 4) {
          issues.push({
            type: TopologyIssueType.INVALID_GEOMETRY,
            parcelIds: [parcel.id],
            description: `Parcel ${parcel.parcelCode} boundary is not a closed ring with at least 4 points.`,
            location: feature.geometry,
            severity: 'high',
          });
          continue;
        }

        const kinks = turf.kinks(feature);
        if (kinks.features.length > 0) {
          issues.push({
            type: TopologyIssueType.SELF_INTERSECTION,
            parcelIds: [parcel.id],
            description: `Parcel ${parcel.parcelCode} boundary crosses itself at ${kinks.features.length} point(s).`,
            location: kinks,
            severity: 'high',
          });
          continue;
        }

        validParcels.push({ id: parcel.id, feature });
      } catch (err) {
        issues.push({
          type: TopologyIssueType.INVALID_GEOMETRY,
          parcelIds: [parcel.id],
          description: `Parcel ${parcel.parcelCode} boundary could not be parsed as a valid polygon.`,
          location: null,
          severity: 'high',
        });
      }
    }

    // 2. Pairwise overlap & duplicate checks (O(n^2), fine for per-project batches)
    for (let i = 0; i < validParcels.length; i++) {
      for (let j = i + 1; j < validParcels.length; j++) {
        const a = validParcels[i];
        const b = validParcels[j];
        let intersection;
        try {
          intersection = turf.intersect(turf.featureCollection([a.feature, b.feature]));
        } catch {
          continue;
        }
        if (!intersection) continue;

        const overlapArea = turf.area(intersection);
        if (overlapArea < 1) continue; // ignore sub-1-sqm sliver overlaps from floating point noise

        const areaA = turf.area(a.feature);
        const areaB = turf.area(b.feature);
        const overlapRatio = overlapArea / Math.min(areaA, areaB);

        if (overlapRatio > 0.9) {
          issues.push({
            type: TopologyIssueType.DUPLICATE_BOUNDARY,
            parcelIds: [a.id, b.id],
            description: `Parcels overlap by ${(overlapRatio * 100).toFixed(0)}% and are likely duplicate boundaries.`,
            location: intersection.geometry,
            severity: 'high',
          });
        } else {
          issues.push({
            type: TopologyIssueType.OVERLAP,
            parcelIds: [a.id, b.id],
            description: `Parcels overlap over an area of ${overlapArea.toFixed(1)} sqm.`,
            location: intersection.geometry,
            severity: overlapArea > 20 ? 'high' : 'medium',
          });
        }
      }
    }

    // 3. Gap detection: union all valid parcels and compare against their combined convex hull.
    // A large gap between the union and hull suggests un-mapped land between parcels.
    if (validParcels.length > 2) {
      try {
        const collection = turf.featureCollection(validParcels.map((p) => p.feature));
        const union = validParcels
          .map((p) => p.feature)
          .reduce((acc: any, f: any) => (acc ? turf.union(turf.featureCollection([acc, f])) : f));
        const hull = turf.convex(collection);
        if (union && hull) {
          const gapAreas = turf.difference(turf.featureCollection([hull, union]));
          if (gapAreas) {
            const gapSize = turf.area(gapAreas);
            const hullArea = turf.area(hull);
            if (gapSize / hullArea > 0.03) {
              issues.push({
                type: TopologyIssueType.GAP,
                parcelIds: [],
                description: `Un-mapped gaps cover roughly ${((gapSize / hullArea) * 100).toFixed(1)}% of the surveyed area - some land between parcels may not be captured.`,
                location: gapAreas.geometry,
                severity: 'medium',
              });
            }
          }
        }
      } catch {
        // Union/difference can fail on complex or disjoint geometries - skip gap detection for this batch.
      }
    }

    const report = await this.reportModel.create({
      project: projectId,
      parcelsChecked: parcels.length,
      issues,
      overlapCount: issues.filter((i) => i.type === TopologyIssueType.OVERLAP).length,
      gapCount: issues.filter((i) => i.type === TopologyIssueType.GAP).length,
      invalidGeometryCount: issues.filter(
        (i) => i.type === TopologyIssueType.INVALID_GEOMETRY || i.type === TopologyIssueType.SELF_INTERSECTION,
      ).length,
      duplicateCount: issues.filter((i) => i.type === TopologyIssueType.DUPLICATE_BOUNDARY).length,
      passed: issues.length === 0,
    });

    return report;
  }

  async latestReport(projectId: string) {
    const pid = Types.ObjectId.isValid(projectId) ? new Types.ObjectId(projectId) : null;
    const filter = pid ? { $or: [{ project: pid }, { project: projectId }] } : { project: projectId };
    return this.reportModel.findOne(filter).sort({ createdAt: -1 });
  }

  async history(projectId: string) {
    const pid = Types.ObjectId.isValid(projectId) ? new Types.ObjectId(projectId) : null;
    const filter = pid ? { $or: [{ project: pid }, { project: projectId }] } : { project: projectId };
    return this.reportModel.find(filter).sort({ createdAt: -1 }).limit(20);
  }
}
