import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GeocodingService } from './geocoding.service';
import { GeocodingController } from './geocoding.controller';

@Module({
  imports: [HttpModule.register({ timeout: 8000 })],
  controllers: [GeocodingController],
  providers: [GeocodingService],
  exports: [GeocodingService],
})
export class GeocodingModule {}
