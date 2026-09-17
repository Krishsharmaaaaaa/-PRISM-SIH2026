import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Role } from '../../../common/enums/roles.enum';

export type UserDocument = User & Document;

@Schema({ _id: false })
class ProjectMembership {
  @Prop({ type: Types.ObjectId, ref: 'Project', required: true })
  project: Types.ObjectId;

  @Prop({ type: String, enum: Role, required: true })
  role: Role;
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, trim: true })
  fullName: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true, index: true })
  email: string;

  @Prop({ required: true, select: false })
  passwordHash: string;

  @Prop({ type: String, enum: Role, default: Role.VIEWER })
  role: Role;

  @Prop({ type: Types.ObjectId, ref: 'Organization', required: true, index: true })
  organization: Types.ObjectId;

  @Prop({ type: [ProjectMembership], default: [] })
  projectMemberships: ProjectMembership[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Date, default: null })
  lastLoginAt: Date | null;

  @Prop({ type: String, default: null, select: false })
  refreshTokenHash: string | null;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ organization: 1, email: 1 }, { unique: true });
