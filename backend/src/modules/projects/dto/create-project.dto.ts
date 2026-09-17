import { IsLatitude, IsLongitude, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty({ example: 'Vasundhara Sector 10 - Cadastral Resurvey' })
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'Ghaziabad' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'Ward 12' })
  @IsOptional()
  @IsString()
  ward?: string;

  @ApiPropertyOptional({ example: 28.6692 })
  @IsOptional()
  @IsLatitude()
  centerLat?: number;

  @ApiPropertyOptional({ example: 77.4538 })
  @IsOptional()
  @IsLongitude()
  centerLng?: number;
}
