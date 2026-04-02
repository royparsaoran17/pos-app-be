import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsNumber, IsInt, IsEnum } from 'class-validator';

export class CreateMenuSizeDto {
  @ApiProperty({ example: 'JUMBO' })
  @IsString()
  @IsNotEmpty({ message: 'Key wajib diisi' })
  key: string;

  @ApiProperty({ example: 'Jumbo' })
  @IsString()
  @IsNotEmpty({ message: 'Label wajib diisi' })
  label: string;

  @ApiProperty({ required: false, enum: ['FOOD', 'DRINK'], default: 'FOOD' })
  @IsOptional()
  @IsEnum(['FOOD', 'DRINK'], { message: 'Kategori harus FOOD atau DRINK' })
  category?: string;

  @ApiProperty({ example: 20000 })
  @IsNumber({}, { message: 'Harga harus berupa angka' })
  @IsNotEmpty({ message: 'Harga wajib diisi' })
  price: number;

  @ApiProperty({ required: false, example: 0 })
  @IsOptional()
  @IsInt()
  hpp?: number;

  @ApiProperty({ required: false, example: 6 })
  @IsOptional()
  @IsInt()
  max_toppings?: number;

  @ApiProperty({ required: false, example: 150 })
  @IsOptional()
  @IsInt()
  total_topping_gram?: number;

  @ApiProperty({ required: false, example: 5 })
  @IsOptional()
  @IsInt()
  sort_order?: number;
}

export class UpdateMenuSizeDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  label?: string;

  @ApiProperty({ required: false, enum: ['FOOD', 'DRINK'] })
  @IsOptional()
  @IsEnum(['FOOD', 'DRINK'], { message: 'Kategori harus FOOD atau DRINK' })
  category?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  hpp?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  max_toppings?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  total_topping_gram?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  sort_order?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
