import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ImageryDatasetDocument = ImageryDataset & Document;

export enum ImageryType {
  DRONE_RGB = 'drone_rgb',
  ORTHOMOSAIC = 'orthomosaic', // ORI - orthorectified imagery
  DSM = 'dsm',
  DTM = 'dtm',
}

export enum ImageryStatus {
  UPLOADED = 'uploaded',
  VALIDATED = 'validated',
  PROCESSING = 'processing',
  PROCESSED = 'processed',
  FAILED = 'failed',
}

@Schema({ _id: false })
class BoundingBox {
  // Geographic bounds of the image footprint, WGS84 [lng, lat]
  @Prop({ type: [Number], required: true }) northEast: number[];
  @Prop({ type: [Number], required: true }) southWest: number[];
}

@Schema({ timestamps: true })
export class ImageryDataset {
  @Prop({ type: Types.ObjectId, ref: 'Project', required: true, index: true })
  project: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  uploadedBy: Types.ObjectId;

  @Prop({ required: true })
  originalFileName: string;

  @Prop({ required: true })
  storagePath: string;

  @Prop({ required: true })
  mimeType: string;

  @Prop({ required: true })
  sizeBytes: number;

  @Prop({ type: String, enum: ImageryType, required: true })
  type: ImageryType;

  @Prop({ type: String, enum: ImageryStatus, default: ImageryStatus.UPLOADED })
  status: ImageryStatus;

  @Prop({ type: BoundingBox, required: false })
  boundingBox?: BoundingBox;

  @Prop({ type: Number, default: null })
  groundResolutionCm: number | null; // GSD - ground sample distance

  @Prop({ type: Date, default: null })
  captureDate: Date | null;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, unknown>;

  @Prop({ type: Number, default: null })
  widthPx: number | null;

  @Prop({ type: Number, default: null })
  heightPx: number | null;

  @Prop({ type: Object, default: null })
  aiDetections?: {
    buildings: any[];
    roads: any[];
    landUseZones: any[];
    notes: string;
  };
}

export const ImageryDatasetSchema = SchemaFactory.createForClass(ImageryDataset);
ImageryDatasetSchema.index({ project: 1, type: 1 });
