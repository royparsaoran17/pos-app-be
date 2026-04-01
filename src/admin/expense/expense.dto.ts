import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsNumber, IsBoolean, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

// Expense Category DTOs
export class CreateExpenseCategoryDto {
  @ApiProperty({ example: 'Sewa Tempat' })
  @IsString()
  @IsNotEmpty({ message: 'Nama kategori wajib diisi' })
  name: string;
}

export class UpdateExpenseCategoryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

// Expense DTOs
export class CreateExpenseDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty({ message: 'Kategori wajib dipilih' })
  category_id: number;

  @ApiProperty({ example: 'Bayar listrik bulan Maret' })
  @IsString()
  @IsNotEmpty({ message: 'Deskripsi wajib diisi' })
  description: string;

  @ApiProperty({ example: 500000 })
  @Type(() => Number)
  @IsNumber({}, { message: 'Jumlah wajib diisi' })
  amount: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  expense_date?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateExpenseDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  category_id?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  amount?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  expense_date?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
