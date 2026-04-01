import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStoreDto {
  @ApiProperty() @IsString() @MaxLength(100) name: string;
  @ApiProperty() @IsString() @MaxLength(20) code: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() address?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() @MaxLength(20) phone?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() @MaxLength(100) instagram?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() @MaxLength(100) tiktok?: string;
}

export class UpdateStoreDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() @MaxLength(100) name?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() @MaxLength(20) code?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() address?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() @MaxLength(20) phone?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() @MaxLength(100) instagram?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() @MaxLength(100) tiktok?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() is_active?: boolean;
}
