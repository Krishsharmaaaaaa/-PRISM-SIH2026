import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ParcelsService } from './parcels.service';
import { BuildingsService } from './buildings.service';
import { RoadsService } from './roads.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/roles.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ParcelStatus } from './schemas/parcel.schema';

@ApiTags('GIS - Parcels, Buildings & Roads')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('gis')
export class GisController {
  constructor(
    private readonly parcelsService: ParcelsService,
    private readonly buildingsService: BuildingsService,
    private readonly roadsService: RoadsService,
  ) {}

  @Get('projects/:projectId/parcels')
  async parcels(@Param('projectId') projectId: string, @Query('status') status?: ParcelStatus) {
    return this.parcelsService.asFeatureCollection(projectId);
  }

  @Get('projects/:projectId/buildings')
  async buildings(@Param('projectId') projectId: string) {
    return this.buildingsService.asFeatureCollection(projectId);
  }

  @Get('projects/:projectId/roads')
  async roads(@Param('projectId') projectId: string) {
    return this.roadsService.asFeatureCollection(projectId);
  }

  @Get('parcels/:id')
  async parcel(@Param('id') id: string) {
    return this.parcelsService.findById(id);
  }

  @Patch('parcels/:id/boundary')
  @Roles(Role.ADMIN, Role.GIS_ANALYST, Role.SURVEYOR)
  async editBoundary(@Param('id') id: string, @Body('boundary') boundary: any) {
    return this.parcelsService.updateBoundary(id, boundary);
  }

  @Patch('parcels/:id/status')
  @Roles(Role.ADMIN, Role.GIS_ANALYST, Role.PROJECT_MANAGER, Role.SURVEYOR)
  async setStatus(
    @Param('id') id: string,
    @Body('status') status: ParcelStatus,
    @CurrentUser('sub') userId: string,
  ) {
    return this.parcelsService.setStatus(id, status, userId);
  }
}
