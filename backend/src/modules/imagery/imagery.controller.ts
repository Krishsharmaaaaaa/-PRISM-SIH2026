import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Body,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { ImageryService } from './imagery.service';
import { CreateImageryDto } from './dto/create-imagery.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Role } from '../../common/enums/roles.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Imagery')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('imagery')
export class ImageryController {
  constructor(private readonly imageryService: ImageryService) {}

  @Post('upload')
  @Roles(Role.ADMIN, Role.SURVEYOR, Role.GIS_ANALYST, Role.PROJECT_MANAGER)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateImageryDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.imageryService.ingest(file, dto, userId);
  }

  @Get('project/:projectId')
  async findByProject(@Param('projectId') projectId: string) {
    return this.imageryService.findByProject(projectId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.imageryService.findById(id);
  }

  @Public()
  @Get(':id/file')
  async getFile(@Param('id') id: string, @Res() res: any) {
    const { buffer, mimeType } = await this.imageryService.readFileBuffer(id);
    res.setHeader('Content-Type', mimeType || 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.send(buffer);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.SURVEYOR, Role.GIS_ANALYST, Role.PROJECT_MANAGER)
  async delete(@Param('id') id: string) {
    return this.imageryService.delete(id);
  }
}
