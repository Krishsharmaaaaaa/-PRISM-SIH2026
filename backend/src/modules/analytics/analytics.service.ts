import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Parcel, ParcelDocument } from '../gis/schemas/parcel.schema';
import { Building, BuildingDocument } from '../gis/schemas/building.schema';
import { Road, RoadDocument } from '../gis/schemas/road.schema';
import { ProcessingJob, ProcessingJobDocument } from '../processing-jobs/schemas/processing-job.schema';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(Parcel.name) private readonly parcelModel: Model<ParcelDocument>,
    @InjectModel(Building.name) private readonly buildingModel: Model<BuildingDocument>,
    @InjectModel(Road.name) private readonly roadModel: Model<RoadDocument>,
    @InjectModel(ProcessingJob.name) private readonly jobModel: Model<ProcessingJobDocument>,
  ) {}

  async projectOverview(projectId: string) {
    const pid = new Types.ObjectId(projectId);
    const matchProject = { $or: [{ project: pid }, { project: projectId }] };

    const [landUseDistribution, statusDistribution, buildingCategoryDensity, roadCoverage, confidenceStats, jobPerformance] =
      await Promise.all([
        this.parcelModel.aggregate([
          { $match: matchProject },
          { $group: { _id: '$landUse', count: { $sum: 1 }, totalAreaSqm: { $sum: '$areaSqm' } } },
        ]),
        this.parcelModel.aggregate([
          { $match: matchProject },
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ]),
        this.buildingModel.aggregate([
          { $match: matchProject },
          { $group: { _id: '$category', count: { $sum: 1 }, totalFootprintSqm: { $sum: '$footprintAreaSqm' } } },
        ]),
        this.roadModel.aggregate([
          { $match: matchProject },
          { $group: { _id: '$category', count: { $sum: 1 }, totalLengthM: { $sum: '$lengthM' } } },
        ]),
        this.parcelModel.aggregate([
          { $match: { ...matchProject, aiConfidence: { $ne: null } } },
          {
            $group: {
              _id: null,
              avgConfidence: { $avg: '$aiConfidence' },
              minConfidence: { $min: '$aiConfidence' },
              maxConfidence: { $max: '$aiConfidence' },
            },
          },
        ]),
        this.jobModel.aggregate([
          { $match: { project: pid, status: 'completed' } },
          { $group: { _id: '$type', avgDurationMs: { $avg: '$durationMs' }, count: { $sum: 1 } } },
        ]),
      ]);

    return {
      landUseDistribution,
      statusDistribution,
      buildingCategoryDensity,
      roadCoverage,
      confidenceStats: confidenceStats[0] ?? { avgConfidence: null, minConfidence: null, maxConfidence: null },
      jobPerformance,
    };
  }
}
