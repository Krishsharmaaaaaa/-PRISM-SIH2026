import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationDocument } from './schemas/notification.schema';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name) private readonly notificationModel: Model<NotificationDocument>,
  ) {}

  async create(entry: Partial<Notification>) {
    return this.notificationModel.create(entry);
  }

  async findForUser(userId: string) {
    return this.notificationModel.find({ user: userId }).sort({ createdAt: -1 }).limit(100);
  }

  async markRead(id: string) {
    return this.notificationModel.findByIdAndUpdate(id, { isRead: true }, { new: true });
  }
}
