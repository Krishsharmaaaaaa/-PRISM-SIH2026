import { Module } from '@nestjs/common';
import { ExportsService } from './exports.service';
import { ExportsController } from './exports.controller';
import { GisModule } from '../gis/gis.module';
import { TopologyModule } from '../topology/topology.module';
import { ProjectsModule } from '../projects/projects.module';
import { AiModule } from '../ai/ai.module';
import { ImageryModule } from '../imagery/imagery.module';

@Module({
  imports: [GisModule, TopologyModule, ProjectsModule, AiModule, ImageryModule],
  controllers: [ExportsController],
  providers: [ExportsService],
})
export class ExportsModule {}
