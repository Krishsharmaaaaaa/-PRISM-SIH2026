import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as turf from '@turf/turf';
import { Road, RoadDocument } from './schemas/road.schema';

@Injectable()
export class RoadsService {
  constructor(@InjectModel(Road.name) private readonly roadModel: Model<RoadDocument>) {}

  async bulkCreate(roads: Partial<Road>[]) {
    const withLength = roads.map((r) => ({
      ...r,
      lengthM: r.centerline ? this.computeLengthM(r.centerline as any) : null,
    }));
    return this.roadModel.insertMany(withLength);
  }

  computeLengthM(centerline: { type: string; coordinates: number[][] }): number {
    try {
      return Math.round(turf.length(turf.lineString(centerline.coordinates), { units: 'meters' }) * 100) / 100;
    } catch {
      return 0;
    }
  }

  async findByProject(projectId: string) {
    const pid = Types.ObjectId.isValid(projectId) ? new Types.ObjectId(projectId) : projectId;
    return this.roadModel.find({
      $or: [{ project: pid }, { project: projectId }],
    });
  }

  async totalLength(projectId: string) {
    const roads = await this.findByProject(projectId);
    return roads.reduce((sum, r) => sum + (r.lengthM ?? 0), 0);
  }

  async asFeatureCollection(projectId: string) {
    const roads = await this.findByProject(projectId);
    return turf.featureCollection(
      roads.map((r) =>
        turf.feature(r.centerline as any, {
          id: r._id,
          category: r.category,
          lengthM: r.lengthM,
          estimatedWidthM: r.estimatedWidthM,
          aiConfidence: r.aiConfidence,
        }),
      ),
    );
  }
}
