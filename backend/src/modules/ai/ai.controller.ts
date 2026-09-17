import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { GeminiService } from './gemini.service';
import { ChatDto } from './dto/chat.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/roles.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ParcelsService } from '../gis/parcels.service';
import { BuildingsService } from '../gis/buildings.service';
import { RoadsService } from '../gis/roads.service';
import { TopologyService } from '../topology/topology.service';

@ApiTags('AI - Gemini Cadastral Intelligence')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('ai')
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly geminiService: GeminiService,
    private readonly parcelsService: ParcelsService,
    private readonly buildingsService: BuildingsService,
    private readonly roadsService: RoadsService,
    private readonly topologyService: TopologyService,
  ) {}

  @Post('imagery/:imageryId/extract')
  @Roles(Role.ADMIN, Role.GIS_ANALYST, Role.SURVEYOR, Role.PROJECT_MANAGER)
  async extract(
    @Param('imageryId') imageryId: string,
    @Body('projectId') projectId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.aiService.runExtraction(imageryId, projectId, userId);
  }

  @Post('chat')
  async chat(@Body() dto: ChatDto) {
    const [parcels, buildings, roads, topology] = await Promise.all([
      this.parcelsService.findByProject(dto.projectId),
      this.buildingsService.findByProject(dto.projectId),
      this.roadsService.findByProject(dto.projectId),
      this.topologyService.latestReport(dto.projectId),
    ]);

    const landUseCounts = parcels.reduce<Record<string, number>>((acc, p) => {
      const key = p.landUse ?? 'unclassified';
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});

    const contextSummary = [
      `Total parcels: ${parcels.length}`,
      `Total buildings: ${buildings.length}`,
      `Total roads/lanes: ${roads.length}`,
      `Land use breakdown: ${JSON.stringify(landUseCounts)}`,
      topology
        ? `Latest topology validation: ${topology.issues.length} issue(s) found (${topology.overlapCount} overlaps, ${topology.gapCount} gaps, ${topology.invalidGeometryCount} invalid geometries, ${topology.duplicateCount} duplicates).`
        : 'No topology validation has been run yet.',
    ].join('\n');

    const reply = await this.geminiService.chat(dto.message, contextSummary, dto.history ?? []);
    return { reply };
  }

  @Post('projects/:projectId/report')
  @Roles(Role.ADMIN, Role.GIS_ANALYST, Role.PROJECT_MANAGER)
  async report(@Param('projectId') projectId: string) {
    const [parcels, buildings, roads, topology] = await Promise.all([
      this.parcelsService.findByProject(projectId),
      this.buildingsService.findByProject(projectId),
      this.roadsService.findByProject(projectId),
      this.topologyService.latestReport(projectId),
    ]);
    const approved = parcels.filter((p) => p.status === 'approved').length;
    const statsSummary = [
      `Total parcels: ${parcels.length} (${approved} approved)`,
      `Total buildings: ${buildings.length}`,
      `Total road length: ${roads.reduce((s, r) => s + (r.lengthM ?? 0), 0).toFixed(1)} meters`,
      topology ? `Open topology issues: ${topology.issues.length}` : 'No topology validation run yet',
    ].join('\n');

    const narrative = await this.geminiService.generateProjectReport(statsSummary);
    return { narrative, stats: { totalParcels: parcels.length, approved, totalBuildings: buildings.length } };
  }

  @Post('topology/:projectId/explain')
  @Roles(Role.ADMIN, Role.GIS_ANALYST, Role.PROJECT_MANAGER, Role.SURVEYOR)
  async explainTopology(@Param('projectId') projectId: string) {
    const report = await this.topologyService.latestReport(projectId);
    if (!report || report.issues.length === 0) {
      return { explanation: 'No outstanding topology issues were found in the latest validation run.' };
    }
    const issuesSummary = report.issues
      .map((i, idx) => `${idx + 1}. [${i.type}] ${i.description}`)
      .join('\n');
    const explanation = await this.geminiService.explainTopologyIssues(issuesSummary);
    return { explanation };
  }
}
