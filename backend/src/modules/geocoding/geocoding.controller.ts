import { Controller, Get, ParseFloatPipe, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GeocodingService } from './geocoding.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Geocoding (OpenStreetMap / Nominatim)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('geocoding')
export class GeocodingController {
  constructor(private readonly geocodingService: GeocodingService) {}

  @Get('search')
  async search(@Query('q') q: string) {
    return this.geocodingService.search(q);
  }

  @Get('reverse')
  async reverse(
    @Query('lat', ParseFloatPipe) lat: number,
    @Query('lng', ParseFloatPipe) lng: number,
  ) {
    return this.geocodingService.reverse(lat, lng);
  }
}
