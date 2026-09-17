import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProcessingJobDocument = ProcessingJob & Document;

export enum JobType {
  AI_FEATURE_EXTRACTION = 'ai_feature_extraction',
  TOPOLOGY_VALIDATION = 'topology_validation',
  EXPORT_GENERATION = 'export_generation',
  REPORT_GENERATION = 'report_generation',
}

export enum JobStatus {
  QUEUED = 'queued',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Schema({ timestamps: true })
export class ProcessingJob {
  @Prop({ type: Types.ObjectId, ref: 'Project', required: true, index: true })
  project: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  triggeredBy: Types.ObjectId;

  @Prop({ type: String, enum: JobType, required: true })
  type: JobType;

  @Prop({ type: String, enum: JobStatus, default: JobStatus.QUEUED })
  status: JobStatus;

  @Prop({ default: 0, min: 0, max: 100 })
  progressPercent: number;

  @Prop({ type: Object, default: {} })
  input: Record<string, unknown>;

  @Prop({ type: Object, default: null })
  result: Record<string, unknown> | null;

  @Prop({ type: String, default: null })
  errorMessage: string | null;

  @Prop({ default: 0 })
  attempts: number;

  @Prop({ type: Date, default: null })
  startedAt: Date | null;

  @Prop({ type: Date, default: null })
  finishedAt: Date | null;

  @Prop({ type: Number, default: null })
  durationMs: number | null;
}

export const ProcessingJobSchema = SchemaFactory.createForClass(ProcessingJob);
ProcessingJobSchema.index({ project: 1, type: 1, createdAt: -1 });
