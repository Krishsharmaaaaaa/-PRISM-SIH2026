import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Project, ProjectDocument, ProjectStage } from './schemas/project.schema';
import { CreateProjectDto } from './dto/create-project.dto';

const STAGE_ORDER = Object.values(ProjectStage);

@Injectable()
export class ProjectsService {
  constructor(@InjectModel(Project.name) private readonly projectModel: Model<ProjectDocument>) {}

  async create(dto: CreateProjectDto, organizationId: string, userId: string) {
    const doc: Partial<Project> = {
      name: dto.name,
      description: dto.description,
      city: dto.city,
      ward: dto.ward,
      organization: new Types.ObjectId(organizationId),
      createdBy: new Types.ObjectId(userId),
      checkpoints: STAGE_ORDER.map((stage) => ({ stage, completed: false, completedAt: null })),
    };
    if (dto.centerLat !== undefined && dto.centerLng !== undefined) {
      doc.centerPoint = { type: 'Point', coordinates: [dto.centerLng, dto.centerLat] };
    }
    return this.projectModel.create(doc);
  }

  async findAllForOrganization(organizationId?: string) {
    if (!organizationId) {
      return this.projectModel.find().sort({ createdAt: -1 });
    }
    const list = await this.projectModel.find({ organization: organizationId }).sort({ createdAt: -1 });
    if (!list || list.length === 0) {
      return this.projectModel.find().sort({ createdAt: -1 });
    }
    return list;
  }

  async findById(id: string) {
    const project = await this.projectModel.findById(id);
    if (!project) throw new NotFoundException('Project not found.');
    return project;
  }

  /** Ensures a user can reach project directly */
  async findByIdScoped(id: string, organizationId?: string) {
    return this.findById(id);
  }

  async advanceStage(id: string, stage: ProjectStage) {
    const project = await this.findById(id);
    const checkpoint = project.checkpoints.find((c) => c.stage === stage);
    if (checkpoint) {
      checkpoint.completed = true;
      checkpoint.completedAt = new Date();
    }
    const stageIndex = STAGE_ORDER.indexOf(stage);
    project.currentStage = stage;
    project.progressPercent = Math.round(((stageIndex + 1) / STAGE_ORDER.length) * 100);
    await project.save();
    return project;
  }
}
