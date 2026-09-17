import { IsEmail, IsEnum, IsMongoId, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '../../../common/enums/roles.enum';

export class RegisterDto {
  @ApiProperty({ example: 'Anita Sharma' })
  @IsString()
  fullName: string;

  @ApiProperty({ example: '[email protected]' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'A strong password, at least 8 characters' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ description: 'Organization this user belongs to' })
  @IsMongoId()
  organizationId: string;

  @ApiPropertyOptional({ enum: Role, default: Role.VIEWER })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
