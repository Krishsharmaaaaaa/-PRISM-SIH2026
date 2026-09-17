import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TopologyReport, TopologyReportSchema } from './schemas/topology-report.schema';
import { Parcel, ParcelSchema } from '../gis/schemas/parcel.schema';
import { TopologyService } from './topology.service';
import { TopologyController } from './topology.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TopologyReport.name, schema: TopologyReportSchema },
      { name: Parcel.name, schema: ParcelSchema },
    ]),
  ],
  controllers: [TopologyController],
  providers: [TopologyService],
  exports: [TopologyService],
})
export class TopologyModule {}
