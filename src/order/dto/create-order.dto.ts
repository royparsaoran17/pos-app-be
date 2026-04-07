import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray, IsNotEmpty, IsNumber, IsOptional, IsString,
  ValidateNested, Min, Max, ArrayMinSize, IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemAdditionalDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  additional_id: number;

  @ApiProperty({ example: 1 })
  @IsOptional()
  @IsNumber()
  qty?: number;
}

export class OrderItemDto {
  @ApiProperty({ example: 'SMALL' })
  @IsString({ message: 'Ukuran harus berupa string' })
  @IsNotEmpty({ message: 'Ukuran wajib dipilih' })
  size: string;

  @ApiProperty({ type: [Number], example: [1, 2] })
  @IsOptional()
  @IsArray({ message: 'Topping harus berupa array' })
  topping_ids: number[];

  @ApiProperty({ type: [String], example: ['Minyak Bawang', 'Daun Jeruk'] })
  @IsOptional()
  @IsArray({ message: 'Bumbu harus berupa array' })
  @IsString({ each: true })
  bumbu: string[];

  @ApiProperty({ example: 2.5 })
  @IsOptional()
  @IsNumber({}, { message: 'Level pedas harus berupa angka' })
  @Min(0, { message: 'Level pedas minimal 0' })
  @Max(5, { message: 'Level pedas maksimal 5' })
  spicy_level: number;

  @ApiProperty({ type: [OrderItemAdditionalDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemAdditionalDto)
  additionals?: OrderItemAdditionalDto[];
}

export class CreateOrderDto {
  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ArrayMinSize(1, { message: 'Minimal 1 item pesanan' })
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiProperty({ example: 'CASH' })
  @IsString()
  @IsNotEmpty({ message: 'Metode pembayaran wajib dipilih' })
  payment_method: string;

  @ApiProperty({ required: false, example: 'Budi' })
  @IsOptional()
  @IsString()
  customer_name?: string;

  @ApiProperty({ required: false, example: 'Pembeli Lama' })
  @IsOptional()
  @IsString()
  acquisition_channel?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ required: false, example: '08123456789' })
  @IsOptional()
  @IsString()
  member_phone?: string;

  @ApiProperty({ required: false, example: 'Budi' })
  @IsOptional()
  @IsString()
  member_name?: string;

  @ApiProperty({ required: false, example: 'GRAND10' })
  @IsOptional()
  @IsString()
  promo_code?: string;
}
