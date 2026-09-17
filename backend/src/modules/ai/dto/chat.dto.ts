import { IsArray, IsMongoId, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ChatDto {
  @ApiProperty()
  @IsMongoId()
  projectId: string;

  @ApiProperty()
  @IsString()
  message: string;

  @ApiPropertyOptional({ description: 'Prior turns in this chat, oldest first' })
  @IsOptional()
  @IsArray()
  history?: { role: 'user' | 'model'; text: string }[];
}
