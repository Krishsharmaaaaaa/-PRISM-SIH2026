import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { GeminiService } from './gemini.service';
import { AiController } from './ai.controller';
import { ImageryModule } from '../imagery/imagery.module';
import { GisModule } from '../gis/gis.module';
import { ProcessingJobsModule } from '../processing-jobs/processing-jobs.module';
import { TopologyModule } from '../topology/topology.module';

@Module({
  imports: [ImageryModule, GisModule, ProcessingJobsModule, TopologyModule],
  controllers: [AiController],
  providers: [AiService, GeminiService],
  exports: [GeminiService, AiService],
})
export class AiModule {}
