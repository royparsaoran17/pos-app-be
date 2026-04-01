import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsNumber, IsEnum, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateStockEntryDto {
  @ApiProperty({ enum: ['TOPPING', 'BUMBU', 'OTHER'] })
  @IsEnum(['TOPPING', 'BUMBU', 'OTHER'], { message: 'Tipe item harus TOPPING, BUMBU, atau OTHER' })
  @IsNotEmpty()
  item_type: 'TOPPING' | 'BUMBU' | 'OTHER';

  @ApiProperty({ example: 'Kerupuk Pedas' })
  @IsString()
  @IsNotEmpty({ message: 'Nama item wajib diisi' })
  item_name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  topping_id?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  bumbu_id?: number;

  @ApiProperty({ example: 10 })
  @Type(() => Number)
  @IsNumber({}, { message: 'Jumlah wajib diisi' })
  quantity: number;

  @ApiProperty({ example: 'kg' })
  @IsString()
  @IsNotEmpty({ message: 'Satuan wajib diisi' })
  unit: string;

  @ApiProperty({ example: 25000 })
  @Type(() => Number)
  @IsNumber({}, { message: 'Harga beli wajib diisi' })
  purchase_price: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  supplier?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  entry_date?: string;
}

export class UpdateStockEntryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(['TOPPING', 'BUMBU', 'OTHER'])
  item_type?: 'TOPPING' | 'BUMBU' | 'OTHER';

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  item_name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  topping_id?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  bumbu_id?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  quantity?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  purchase_price?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  supplier?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  entry_date?: string;
}
