import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLog, AuditLogDocument } from './schemas/audit-log.schema';

@Injectable()
export class AuditLogsService {
  constructor(@InjectModel(AuditLog.name) private readonly logModel: Model<AuditLogDocument>) {}

  async record(entry: Partial<AuditLog>) {
    return this.logModel.create(entry);
  }

  async findByProject(projectId: string) {
    return this.logModel.find({ project: projectId }).sort({ createdAt: -1 }).limit(200);
  }
}
