import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty, IsString, IsOptional, IsBoolean,
  IsNumber, IsEnum, IsDateString,
} from 'class-validator';

export class CreatePromoDto {
  @ApiProperty({ example: 'DISKON20' })
  @IsString()
  @IsNotEmpty({ message: 'Kode promo wajib diisi' })
  code: string;

  @ApiProperty({ example: 'Diskon 20%' })
  @IsString()
  @IsNotEmpty({ message: 'Nama promo wajib diisi' })
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: ['PERCENTAGE', 'FIXED'] })
  @IsEnum(['PERCENTAGE', 'FIXED'], { message: 'Tipe diskon harus PERCENTAGE atau FIXED' })
  discount_type: string;

  @ApiProperty({ example: 20 })
  @IsNumber({}, { message: 'Nilai diskon harus berupa angka' })
  discount_value: number;

  @ApiProperty({ required: false, example: 10000 })
  @IsOptional()
  @IsNumber()
  min_purchase?: number;

  @ApiProperty({ required: false, example: 5000 })
  @IsOptional()
  @IsNumber()
  max_discount?: number;

  @ApiProperty({ required: false, example: 100 })
  @IsOptional()
  @IsNumber()
  max_usage?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  start_date?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  end_date?: string;
}

export class UpdatePromoDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(['PERCENTAGE', 'FIXED'])
  discount_type?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  discount_value?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  min_purchase?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  max_discount?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  max_usage?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  start_date?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  end_date?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
