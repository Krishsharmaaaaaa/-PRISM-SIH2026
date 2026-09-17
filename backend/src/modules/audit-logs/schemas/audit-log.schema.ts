import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AuditLogDocument = AuditLog & Document;

@Schema({ timestamps: true })
export class AuditLog {
  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  user: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: 'Organization', default: null })
  organization: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: 'Project', default: null })
  project: Types.ObjectId | null;

  @Prop({ required: true })
  action: string; // e.g. "parcel.status_changed", "imagery.uploaded"

  @Prop({ required: true })
  entityType: string;

  @Prop({ type: String, default: null })
  entityId: string | null;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, unknown>;

  @Prop({ type: String, default: null })
  ipAddress: string | null;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);
AuditLogSchema.index({ project: 1, createdAt: -1 });
