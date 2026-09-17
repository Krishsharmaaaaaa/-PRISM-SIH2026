import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Parcel, ParcelSchema } from './schemas/parcel.schema';
import { Building, BuildingSchema } from './schemas/building.schema';
import { Road, RoadSchema } from './schemas/road.schema';
import { ParcelsService } from './parcels.service';
import { BuildingsService } from './buildings.service';
import { RoadsService } from './roads.service';
import { GisController } from './gis.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Parcel.name, schema: ParcelSchema },
      { name: Building.name, schema: BuildingSchema },
      { name: Road.name, schema: RoadSchema },
    ]),
  ],
  controllers: [GisController],
  providers: [ParcelsService, BuildingsService, RoadsService],
  exports: [ParcelsService, BuildingsService, RoadsService],
})
export class GisModule {}
