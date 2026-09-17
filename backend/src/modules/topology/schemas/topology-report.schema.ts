import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TopologyReportDocument = TopologyReport & Document;

export enum TopologyIssueType {
  OVERLAP = 'overlap',
  GAP = 'gap',
  SELF_INTERSECTION = 'self_intersection',
  INVALID_GEOMETRY = 'invalid_geometry',
  DUPLICATE_BOUNDARY = 'duplicate_boundary',
}

@Schema({ _id: false })
class TopologyIssue {
  @Prop({ type: String, enum: TopologyIssueType, required: true })
  type: TopologyIssueType;

  @Prop({ type: [Types.ObjectId], ref: 'Parcel', default: [] })
  parcelIds: Types.ObjectId[];

  @Prop({ required: true })
  description: string;

  @Prop({ type: Object, default: null })
  location: Record<string, unknown> | null; // GeoJSON point/polygon marking the problem area

  @Prop({ default: 'medium' })
  severity: 'low' | 'medium' | 'high';
}

@Schema({ timestamps: true })
export class TopologyReport {
  @Prop({ type: Types.ObjectId, ref: 'Project', required: true, index: true })
  project: Types.ObjectId;

  @Prop({ required: true })
  parcelsChecked: number;

  @Prop({ type: [TopologyIssue], default: [] })
  issues: TopologyIssue[];

  @Prop({ default: 0 })
  overlapCount: number;

  @Prop({ default: 0 })
  gapCount: number;

  @Prop({ default: 0 })
  invalidGeometryCount: number;

  @Prop({ default: 0 })
  duplicateCount: number;

  @Prop({ default: true })
  passed: boolean;
}

export const TopologyReportSchema = SchemaFactory.createForClass(TopologyReport);
