import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProcessingJob, ProcessingJobSchema } from './schemas/processing-job.schema';
import { ProcessingJobsService } from './processing-jobs.service';
import { ProcessingJobsController } from './processing-jobs.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: ProcessingJob.name, schema: ProcessingJobSchema }])],
  controllers: [ProcessingJobsController],
  providers: [ProcessingJobsService],
  exports: [ProcessingJobsService],
})
export class ProcessingJobsModule {}
