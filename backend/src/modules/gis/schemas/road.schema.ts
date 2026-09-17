import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { GeoJSONLineString } from './geojson.types';

export type RoadDocument = Road & Document;

export enum RoadCategory {
  MAIN_ROAD = 'main_road',
  LANE = 'lane',
  PATHWAY = 'pathway',
  ACCESS_CORRIDOR = 'access_corridor',
}

@Schema({ timestamps: true })
export class Road {
  @Prop({ type: Types.ObjectId, ref: 'Project', required: true, index: true })
  project: Types.ObjectId;

  @Prop({ type: GeoJSONLineString, required: true, index: '2dsphere' })
  centerline: GeoJSONLineString;

  @Prop({ type: String, enum: RoadCategory, default: RoadCategory.LANE })
  category: RoadCategory;

  @Prop({ type: Number, default: null })
  estimatedWidthM: number | null;

  @Prop({ type: Number, default: null })
  lengthM: number | null;

  @Prop({ type: Number, min: 0, max: 1, default: null })
  aiConfidence: number | null;

  @Prop({ type: Types.ObjectId, ref: 'ImageryDataset', default: null })
  sourceImagery: Types.ObjectId | null;
}

export const RoadSchema = SchemaFactory.createForClass(Road);
