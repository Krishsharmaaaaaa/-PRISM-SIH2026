import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  ProcessingJob,
  ProcessingJobDocument,
  JobStatus,
  JobType,
} from './schemas/processing-job.schema';

@Injectable()
export class ProcessingJobsService {
  constructor(
    @InjectModel(ProcessingJob.name) private readonly jobModel: Model<ProcessingJobDocument>,
  ) {}

  async start(
    type: JobType,
    projectId: string,
    userId: string,
    input: Record<string, unknown>,
  ): Promise<ProcessingJobDocument> {
    const projId = Types.ObjectId.isValid(projectId)
      ? new Types.ObjectId(projectId)
      : new Types.ObjectId('6aabb5f492fa58e7033199dc');
    const uId = Types.ObjectId.isValid(userId)
      ? new Types.ObjectId(userId)
      : new Types.ObjectId('6aabb0000000000000000001');

    return this.jobModel.create({
      project: projId,
      triggeredBy: uId,
      type,
      status: JobStatus.PROCESSING,
      startedAt: new Date(),
      input,
      attempts: 1,
    });
  }

  async complete(jobId: string, result: Record<string, unknown>) {
    const job = await this.jobModel.findById(jobId);
    if (!job) throw new NotFoundException('Job not found.');
    const finishedAt = new Date();
    job.status = JobStatus.COMPLETED;
    job.progressPercent = 100;
    job.result = result;
    job.finishedAt = finishedAt;
    job.durationMs = job.startedAt ? finishedAt.getTime() - job.startedAt.getTime() : null;
    await job.save();
    return job;
  }

  async fail(jobId: string, errorMessage: string) {
    const job = await this.jobModel.findById(jobId);
    if (!job) throw new NotFoundException('Job not found.');
    job.status = JobStatus.FAILED;
    job.errorMessage = errorMessage;
    job.finishedAt = new Date();
    await job.save();
    return job;
  }

  async findByProject(projectId: string) {
    return this.jobModel.find({ project: projectId }).sort({ createdAt: -1 }).limit(50);
  }

  async findById(id: string) {
    const job = await this.jobModel.findById(id);
    if (!job) throw new NotFoundException('Job not found.');
    return job;
  }
}
