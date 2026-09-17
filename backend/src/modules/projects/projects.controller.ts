import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/roles.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Projects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.PROJECT_MANAGER)
  async create(
    @Body() dto: CreateProjectDto,
    @CurrentUser('organization') organizationId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.projectsService.create(dto, organizationId, userId);
  }

  @Get()
  async findAll(@CurrentUser('organization') organizationId: string) {
    return this.projectsService.findAllForOrganization(organizationId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser('organization') organizationId: string) {
    return this.projectsService.findByIdScoped(id, organizationId);
  }
}
