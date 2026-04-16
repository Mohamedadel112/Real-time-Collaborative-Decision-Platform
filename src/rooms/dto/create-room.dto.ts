import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  MinLength,
  Min,
  Max,
} from 'class-validator';

export class CreateRoomDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  topic?: string;

  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean;

  @IsOptional()
  @IsInt()
  @Min(2)
  @Max(500)
  maxMembers?: number;
}
