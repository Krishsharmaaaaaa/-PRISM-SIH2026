import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProjectDocument = Project & Document;

export enum ProjectStage {
  CREATED = 'created',
  IMAGERY_UPLOADED = 'imagery_uploaded',
  ORTHO_GENERATED = 'ortho_generated',
  AI_EXTRACTION = 'ai_extraction',
  TOPOLOGY_VALIDATION = 'topology_validation',
  FIELD_VERIFICATION = 'field_verification',
  APPROVED = 'approved',
}

@Schema({ _id: false })
class GeoPoint {
  @Prop({ type: String, enum: ['Point'], default: 'Point' })
  type: string;

  @Prop({ type: [Number], required: true }) // [lng, lat]
  coordinates: number[];
}

@Schema({ _id: false })
class StageCheckpoint {
  @Prop({ type: String, enum: ProjectStage, required: true })
  stage: ProjectStage;

  @Prop({ default: false })
  completed: boolean;

  @Prop({ type: Date, default: null })
  completedAt: Date | null;
}

@Schema({ timestamps: true })
export class Project {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ trim: true })
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'Organization', required: true, index: true })
  organization: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ trim: true })
  city: string;

  @Prop({ trim: true })
  ward: string;

  @Prop({ type: GeoPoint, index: '2dsphere' })
  centerPoint: GeoPoint;

  @Prop({ type: String, enum: ProjectStage, default: ProjectStage.CREATED })
  currentStage: ProjectStage;

  @Prop({ type: [StageCheckpoint], default: [] })
  checkpoints: StageCheckpoint[];

  @Prop({ default: 0, min: 0, max: 100 })
  progressPercent: number;

  @Prop({ default: true })
  isActive: boolean;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
ProjectSchema.index({ organization: 1, name: 1 }, { unique: true });
