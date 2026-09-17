import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Organization, OrganizationDocument } from './schemas/organization.schema';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectModel(Organization.name) private readonly orgModel: Model<OrganizationDocument>,
  ) {}

  async create(data: Partial<Organization>) {
    return this.orgModel.create(data);
  }

  async findAll() {
    return this.orgModel.find();
  }

  async findById(id: string) {
    const org = await this.orgModel.findById(id);
    if (!org) throw new NotFoundException('Organization not found.');
    return org;
  }
}
