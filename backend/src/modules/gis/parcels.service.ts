import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as turf from '@turf/turf';
import { Parcel, ParcelDocument, ParcelStatus } from './schemas/parcel.schema';

@Injectable()
export class ParcelsService {
  constructor(@InjectModel(Parcel.name) private readonly parcelModel: Model<ParcelDocument>) {}

  async bulkCreate(parcels: Partial<Parcel>[]) {
    const withArea = parcels.map((p) => ({
      ...p,
      areaSqm: p.boundary ? this.computeAreaSqm(p.boundary as any) : null,
    }));
    return this.parcelModel.insertMany(withArea);
  }

  computeAreaSqm(boundary: { type: string; coordinates: number[][][] }): number {
    try {
      const polygon = turf.polygon(boundary.coordinates);
      return Math.round(turf.area(polygon) * 100) / 100;
    } catch {
      return 0;
    }
  }

  async findByProject(projectId: string, status?: ParcelStatus) {
    const pid = Types.ObjectId.isValid(projectId) ? new Types.ObjectId(projectId) : projectId;
    const query: Record<string, unknown> = {
      $or: [{ project: pid }, { project: projectId }],
    };
    if (status) query.status = status;
    return this.parcelModel.find(query);
  }

  async findById(id: string) {
    const parcel = await this.parcelModel.findById(id);
    if (!parcel) throw new NotFoundException('Parcel not found.');
    return parcel;
  }

  async updateBoundary(id: string, boundary: any) {
    const areaSqm = this.computeAreaSqm(boundary);
    const parcel = await this.parcelModel.findByIdAndUpdate(
      id,
      { boundary, areaSqm, source: 'manual_edit' },
      { new: true },
    );
    if (!parcel) throw new NotFoundException('Parcel not found.');
    return parcel;
  }

  async setStatus(id: string, status: ParcelStatus, verifiedBy?: string) {
    const update: Record<string, unknown> = { status };
    if (status === ParcelStatus.APPROVED || status === ParcelStatus.FIELD_VERIFIED) {
      update.verifiedBy = verifiedBy;
      update.verifiedAt = new Date();
    }
    const parcel = await this.parcelModel.findByIdAndUpdate(id, update, { new: true });
    if (!parcel) throw new NotFoundException('Parcel not found.');
    return parcel;
  }

  async asFeatureCollection(projectId: string) {
    const parcels = await this.findByProject(projectId);
    return turf.featureCollection(
      parcels.map((p) =>
        turf.feature(p.boundary as any, {
          id: p._id,
          parcelCode: p.parcelCode,
          landUse: p.landUse,
          status: p.status,
          aiConfidence: p.aiConfidence,
          areaSqm: p.areaSqm,
        }),
      ),
    );
  }
}
