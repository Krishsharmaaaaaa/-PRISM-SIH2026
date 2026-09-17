import { Prop, Schema } from '@nestjs/mongoose';

@Schema({ _id: false })
export class GeoJSONPolygon {
  @Prop({ type: String, enum: ['Polygon'], default: 'Polygon' })
  type: string;

  @Prop({ type: [[[Number]]], required: true }) // [ [ [lng,lat], ... ] ]
  coordinates: number[][][];
}

@Schema({ _id: false })
export class GeoJSONLineString {
  @Prop({ type: String, enum: ['LineString'], default: 'LineString' })
  type: string;

  @Prop({ type: [[Number]], required: true }) // [ [lng,lat], ... ]
  coordinates: number[][];
}
