import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TopologyService } from './topology.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/roles.enum';

@ApiTags('Topology Validation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('topology')
export class TopologyController {
  constructor(private readonly topologyService: TopologyService) {}

  @Post('projects/:projectId/validate')
  @Roles(Role.ADMIN, Role.GIS_ANALYST, Role.PROJECT_MANAGER)
  async validate(@Param('projectId') projectId: string) {
    return this.topologyService.validateProject(projectId);
  }

  @Get('projects/:projectId/latest')
  async latest(@Param('projectId') projectId: string) {
    return this.topologyService.latestReport(projectId);
  }

  @Get('projects/:projectId/history')
  async history(@Param('projectId') projectId: string) {
    return this.topologyService.history(projectId);
  }
}
