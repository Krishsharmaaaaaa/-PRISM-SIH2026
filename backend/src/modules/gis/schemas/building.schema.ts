import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { GeoJSONPolygon } from './geojson.types';

export type BuildingDocument = Building & Document;

export enum BuildingCategory {
  RESIDENTIAL = 'residential',
  COMMERCIAL = 'commercial',
  INDUSTRIAL = 'industrial',
  INSTITUTIONAL = 'institutional',
  MIXED_USE = 'mixed_use',
  OTHER = 'other',
  UNKNOWN = 'unknown',
}

@Schema({ timestamps: true })
export class Building {
  @Prop({ type: Types.ObjectId, ref: 'Project', required: true, index: true })
  project: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Parcel', default: null })
  parcel: Types.ObjectId | null;

  @Prop({ type: GeoJSONPolygon, required: true, index: '2dsphere' })
  footprint: GeoJSONPolygon;

  @Prop({ type: String, enum: BuildingCategory, default: BuildingCategory.UNKNOWN })
  category: BuildingCategory;

  @Prop({ type: Number, default: null })
  footprintAreaSqm: number | null;

  @Prop({ type: Number, default: null })
  estimatedHeightM: number | null; // derived from DSM - DTM at the footprint

  @Prop({ type: Number, min: 0, max: 1, default: null })
  aiConfidence: number | null;

  @Prop({ default: false })
  isEncroachment: boolean;

  @Prop({ type: Types.ObjectId, ref: 'ImageryDataset', default: null })
  sourceImagery: Types.ObjectId | null;
}

export const BuildingSchema = SchemaFactory.createForClass(Building);
