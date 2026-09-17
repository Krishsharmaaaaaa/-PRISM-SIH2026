import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as turf from '@turf/turf';
import { Building, BuildingDocument } from './schemas/building.schema';

@Injectable()
export class BuildingsService {
  constructor(
    @InjectModel(Building.name) private readonly buildingModel: Model<BuildingDocument>,
  ) {}

  async bulkCreate(buildings: Partial<Building>[]) {
    const withArea = buildings.map((b) => ({
      ...b,
      footprintAreaSqm: b.footprint ? this.computeAreaSqm(b.footprint as any) : null,
    }));
    return this.buildingModel.insertMany(withArea);
  }

  computeAreaSqm(footprint: { type: string; coordinates: number[][][] }): number {
    try {
      return Math.round(turf.area(turf.polygon(footprint.coordinates)) * 100) / 100;
    } catch {
      return 0;
    }
  }

  async findByProject(projectId: string) {
    const pid = Types.ObjectId.isValid(projectId) ? new Types.ObjectId(projectId) : projectId;
    return this.buildingModel.find({
      $or: [{ project: pid }, { project: projectId }],
    });
  }

  async findById(id: string) {
    const building = await this.buildingModel.findById(id);
    if (!building) throw new NotFoundException('Building not found.');
    return building;
  }

  async asFeatureCollection(projectId: string) {
    const buildings = await this.findByProject(projectId);
    return turf.featureCollection(
      buildings.map((b) =>
        turf.feature(b.footprint as any, {
          id: b._id,
          category: b.category,
          aiConfidence: b.aiConfidence,
          footprintAreaSqm: b.footprintAreaSqm,
          estimatedHeightM: b.estimatedHeightM,
          isEncroachment: b.isEncroachment,
        }),
      ),
    );
  }
}
