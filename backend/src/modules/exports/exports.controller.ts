import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ExportsService } from './exports.service';
import { ProjectsService } from '../projects/projects.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Exports')
@Controller('exports')
export class ExportsController {
  constructor(
    private readonly exportsService: ExportsService,
    private readonly projectsService: ProjectsService,
  ) {}

  @Get('projects/:projectId/parcels.geojson')
  async parcelsGeoJSON(@Param('projectId') projectId: string, @Res() res: Response) {
    const fc = await this.exportsService.parcelsGeoJSON(projectId);
    res.setHeader('Content-Disposition', `attachment; filename="parcels-${projectId}.geojson"`);
    res.json(fc);
  }

  @Get('projects/:projectId/buildings.geojson')
  async buildingsGeoJSON(@Param('projectId') projectId: string, @Res() res: Response) {
    const fc = await this.exportsService.buildingsGeoJSON(projectId);
    res.setHeader('Content-Disposition', `attachment; filename="buildings-${projectId}.geojson"`);
    res.json(fc);
  }

  @Get('projects/:projectId/roads.geojson')
  async roadsGeoJSON(@Param('projectId') projectId: string, @Res() res: Response) {
    const fc = await this.exportsService.roadsGeoJSON(projectId);
    res.setHeader('Content-Disposition', `attachment; filename="roads-${projectId}.geojson"`);
    res.json(fc);
  }

  @Get('projects/:projectId/parcels.zip')
  async parcelsShapefile(@Param('projectId') projectId: string, @Res() res: Response) {
    const zip = await this.exportsService.parcelsShapefileZip(projectId);
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="parcels-${projectId}-shapefile.zip"`);
    res.send(zip);
  }

  @Get('projects/:projectId/parcels.csv')
  async parcelsCSV(@Param('projectId') projectId: string, @Res() res: Response) {
    const csv = await this.exportsService.parcelsCSV(projectId);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="parcels-${projectId}.csv"`);
    res.send(csv);
  }

  @Get('projects/:projectId/report.pdf')
  async pdfReport(@Param('projectId') projectId: string, @Res() res: Response) {
    const project = await this.projectsService.findById(projectId);
    const pdf = await this.exportsService.projectPdfReport(projectId, project?.name || 'Master Project');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="prism-report-${projectId}.pdf"`);
    res.send(pdf);
  }

  @Get('imagery/:imageryId/report.pdf')
  async imageryPdfReport(@Param('imageryId') imageryId: string, @Res() res: Response) {
    const pdf = await this.exportsService.imageryDatasetPdfReport(imageryId);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="prism-cadastral-analysis-${imageryId}.pdf"`);
    res.send(pdf);
  }
}
