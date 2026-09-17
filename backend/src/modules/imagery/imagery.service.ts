import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';
import {
  ImageryDataset,
  ImageryDatasetDocument,
  ImageryStatus,
} from './schemas/imagery-dataset.schema';
import { CreateImageryDto } from './dto/create-imagery.dto';

@Injectable()
export class ImageryService {
  constructor(
    @InjectModel(ImageryDataset.name)
    private readonly imageryModel: Model<ImageryDatasetDocument>,
    private readonly configService: ConfigService,
  ) {}

  async ingest(file: Express.Multer.File, dto: CreateImageryDto, userId: string) {
    if (!file) {
      throw new BadRequestException('An image file is required.');
    }

    const uploadDir = this.configService.get<string>('upload.dir') ?? './uploads';
    fs.mkdirSync(uploadDir, { recursive: true });

    const safeName = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`;
    const storagePath = path.join(uploadDir, safeName);
    fs.writeFileSync(storagePath, file.buffer);

    let width: number | null = null;
    let height: number | null = null;
    try {
      const meta = await sharp(file.buffer).metadata();
      width = meta.width ?? null;
      height = meta.height ?? null;
    } catch {
      // Non-raster or unreadable image metadata - still store the file, just without dimensions.
    }

    const doc: Partial<ImageryDataset> = {
      project: new Types.ObjectId(dto.projectId),
      uploadedBy: new Types.ObjectId(userId),
      originalFileName: file.originalname,
      storagePath,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      type: dto.type,
      status: ImageryStatus.UPLOADED,
      widthPx: width,
      heightPx: height,
      groundResolutionCm: dto.groundResolutionCm ?? null,
    };

    if (dto.neLat && dto.neLng && dto.swLat && dto.swLng) {
      doc.boundingBox = {
        northEast: [dto.neLng, dto.neLat],
        southWest: [dto.swLng, dto.swLat],
      };
      doc.status = ImageryStatus.VALIDATED;
    }

    return this.imageryModel.create(doc);
  }

  async findByProject(projectId: string) {
    const pid = Types.ObjectId.isValid(projectId) ? new Types.ObjectId(projectId) : null;
    const filter = pid ? { $or: [{ project: pid }, { project: projectId }] } : { project: projectId };
    return this.imageryModel.find(filter).sort({ createdAt: -1 });
  }

  async findById(id: string) {
    const dataset = await this.imageryModel.findById(id);
    if (!dataset) throw new NotFoundException('Imagery dataset not found.');
    return dataset;
  }

  async readFileBuffer(id: string): Promise<{ buffer: Buffer; mimeType: string; dataset: ImageryDatasetDocument }> {
    const dataset = await this.findById(id);
    const buffer = fs.readFileSync(dataset.storagePath);
    return { buffer, mimeType: dataset.mimeType, dataset };
  }

  async markStatus(id: string, status: ImageryStatus) {
    return this.imageryModel.findByIdAndUpdate(id, { status }, { new: true });
  }

  async setBoundingBox(id: string, boundingBox: { northEast: number[]; southWest: number[] }) {
    return this.imageryModel.findByIdAndUpdate(
      id,
      { boundingBox, status: ImageryStatus.VALIDATED },
      { new: true },
    );
  }

  async setAiDetections(id: string, aiDetections: any) {
    return this.imageryModel.findByIdAndUpdate(id, { aiDetections }, { new: true });
  }

  async delete(id: string) {
    const dataset = await this.findById(id);
    try {
      if (dataset.storagePath && fs.existsSync(dataset.storagePath)) {
        fs.unlinkSync(dataset.storagePath);
      }
    } catch {
      // Ignore file unlink failure
    }
    await this.imageryModel.findByIdAndDelete(id);
    return { success: true, message: 'Imagery dataset and associated analysis deleted.' };
  }
}
