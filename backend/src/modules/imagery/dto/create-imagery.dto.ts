import { IsEnum, IsLatitude, IsLongitude, IsMongoId, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ImageryType } from '../schemas/imagery-dataset.schema';

export class CreateImageryDto {
  @ApiProperty()
  @IsMongoId()
  projectId: string;

  @ApiProperty({ enum: ImageryType })
  @IsEnum(ImageryType)
  type: ImageryType;

  // Corner coordinates let us georeference the raster without running full
  // photogrammetry - the surveyor supplies the four-corner (or NE/SW) footprint
  // captured from the drone flight-planning software or GNSS/CORS survey.
  @ApiPropertyOptional({ example: 28.671 })
  @IsOptional()
  @IsLatitude()
  neLat?: number;

  @ApiPropertyOptional({ example: 77.456 })
  @IsOptional()
  @IsLongitude()
  neLng?: number;

  @ApiPropertyOptional({ example: 28.667 })
  @IsOptional()
  @IsLatitude()
  swLat?: number;

  @ApiPropertyOptional({ example: 77.451 })
  @IsOptional()
  @IsLongitude()
  swLng?: number;

  @ApiPropertyOptional({ description: 'Ground sample distance in cm/pixel' })
  @IsOptional()
  @IsNumber()
  groundResolutionCm?: number;
}
