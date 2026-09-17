import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { RegisterDto } from './dto/register.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from '../../common/enums/roles.enum';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

  async create(dto: RegisterDto, passwordHash: string): Promise<UserDocument> {
    const existing = await this.userModel.findOne({ email: dto.email.toLowerCase() });
    if (existing) {
      throw new ConflictException('An account with this email already exists.');
    }
    const orgUserCount = await this.userModel.countDocuments({ organization: dto.organizationId });
    const assignedRole = dto.role ?? (orgUserCount === 0 ? Role.ADMIN : Role.VIEWER);

    return this.userModel.create({
      fullName: dto.fullName,
      email: dto.email.toLowerCase(),
      passwordHash,
      role: assignedRole,
      organization: new Types.ObjectId(dto.organizationId),
    });
  }

  async findByEmailWithPassword(email: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ email: email.toLowerCase() })
      .select('+passwordHash +refreshTokenHash');
  }

  async findById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('User not found.');
    return user;
  }

  async findAllInOrganization(organizationId: string) {
    return this.userModel.find({ organization: organizationId }).select('-passwordHash');
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.userModel.findByIdAndUpdate(id, dto, { new: true });
    if (!user) throw new NotFoundException('User not found.');
    return user;
  }

  async setRefreshTokenHash(id: string, refreshTokenHash: string | null) {
    await this.userModel.findByIdAndUpdate(id, { refreshTokenHash });
  }

  async touchLastLogin(id: string) {
    await this.userModel.findByIdAndUpdate(id, { lastLoginAt: new Date() });
  }

  async grantProjectRole(userId: string, projectId: string, role: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found.');
    const projectObjectId = new Types.ObjectId(projectId);
    const membership = user.projectMemberships.find((m) => m.project.equals(projectObjectId));
    if (membership) {
      membership.role = role as any;
    } else {
      user.projectMemberships.push({ project: projectObjectId, role: role as any });
    }
    await user.save();
    return user;
  }
}
