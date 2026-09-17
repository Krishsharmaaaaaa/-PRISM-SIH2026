import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { ImageryDataset, ImageryDatasetSchema } from './schemas/imagery-dataset.schema';
import { ImageryService } from './imagery.service';
import { ImageryController } from './imagery.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ImageryDataset.name, schema: ImageryDatasetSchema }]),
    MulterModule.register({ storage: undefined }), // memory storage; ImageryService persists to disk
  ],
  controllers: [ImageryController],
  providers: [ImageryService],
  exports: [ImageryService],
})
export class ImageryModule {}
