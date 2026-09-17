import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { GeoJSONPolygon } from './geojson.types';

export type ParcelDocument = Parcel & Document;

export enum LandUseType {
  RESIDENTIAL = 'residential',
  COMMERCIAL = 'commercial',
  INDUSTRIAL = 'industrial',
  MIXED_USE = 'mixed_use',
  VACANT = 'vacant',
  PUBLIC_UTILITY = 'public_utility',
  OPEN_SPACE = 'open_space',
}

export enum ParcelStatus {
  AI_GENERATED = 'ai_generated',
  UNDER_REVIEW = 'under_review',
  FIELD_VERIFIED = 'field_verified',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum ParcelSource {
  AI_EXTRACTION = 'ai_extraction',
  MANUAL_EDIT = 'manual_edit',
  GT_SURVEY = 'gt_survey',
  GNSS_CORS = 'gnss_cors',
}

@Schema({ timestamps: true })
export class Parcel {
  @Prop({ type: Types.ObjectId, ref: 'Project', required: true, index: true })
  project: Types.ObjectId;

  @Prop({ required: true, unique: false })
  parcelCode: string; // human-readable cadastral code, e.g. "GZB-W12-0042"

  @Prop({ type: GeoJSONPolygon, required: true, index: '2dsphere' })
  boundary: GeoJSONPolygon;

  @Prop({ type: String, enum: LandUseType, default: null })
  landUse: LandUseType | null;

  @Prop({ type: String, enum: ParcelStatus, default: ParcelStatus.AI_GENERATED })
  status: ParcelStatus;

  @Prop({ type: String, enum: ParcelSource, default: ParcelSource.AI_EXTRACTION })
  source: ParcelSource;

  @Prop({ type: Number, min: 0, max: 1, default: null })
  aiConfidence: number | null;

  @Prop({ type: Number, default: null })
  areaSqm: number | null;

  @Prop({ type: [Types.ObjectId], ref: 'Building', default: [] })
  buildings: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'ImageryDataset', default: null })
  sourceImagery: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  verifiedBy: Types.ObjectId | null;

  @Prop({ type: Date, default: null })
  verifiedAt: Date | null;

  @Prop({ trim: true, default: '' })
  notes: string;
}

export const ParcelSchema = SchemaFactory.createForClass(Parcel);
ParcelSchema.index({ project: 1, status: 1 });
