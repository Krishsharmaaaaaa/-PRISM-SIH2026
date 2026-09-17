import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Parcel, ParcelSchema } from '../gis/schemas/parcel.schema';
import { Building, BuildingSchema } from '../gis/schemas/building.schema';
import { Road, RoadSchema } from '../gis/schemas/road.schema';
import { ProcessingJob, ProcessingJobSchema } from '../processing-jobs/schemas/processing-job.schema';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Parcel.name, schema: ParcelSchema },
      { name: Building.name, schema: BuildingSchema },
      { name: Road.name, schema: RoadSchema },
      { name: ProcessingJob.name, schema: ProcessingJobSchema },
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
