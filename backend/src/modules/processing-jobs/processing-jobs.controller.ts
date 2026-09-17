import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ProcessingJobsService } from './processing-jobs.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Processing Jobs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('jobs')
export class ProcessingJobsController {
  constructor(private readonly jobsService: ProcessingJobsService) {}

  @Get('project/:projectId')
  async findByProject(@Param('projectId') projectId: string) {
    return this.jobsService.findByProject(projectId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.jobsService.findById(id);
  }
}
