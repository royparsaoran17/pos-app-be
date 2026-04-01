import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsNumber, IsEnum, Min } from 'class-validator';

export class CreateFinanceDto {
  @ApiProperty({ enum: ['INCOME', 'EXPENSE'] })
  @IsEnum(['INCOME', 'EXPENSE'], { message: 'Tipe harus INCOME atau EXPENSE' })
  type: string;

  @ApiProperty({ enum: ['CASH', 'BANK', 'QRIS'] })
  @IsEnum(['CASH', 'BANK', 'QRIS'], { message: 'Wallet harus CASH, BANK, atau QRIS' })
  wallet: string;

  @ApiProperty({ example: 50000 })
  @IsNumber()
  @Min(1, { message: 'Jumlah harus lebih dari 0' })
  amount: number;

  @ApiProperty({ example: 'Beli gula 5kg' })
  @IsString()
  @IsNotEmpty({ message: 'Deskripsi wajib diisi' })
  description: string;

  @ApiPropertyOptional({ example: 'Belanja Bahan' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: '2026-03-28' })
  @IsOptional()
  @IsString()
  transaction_date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateFinanceDto {
  @ApiPropertyOptional({ enum: ['INCOME', 'EXPENSE'] })
  @IsOptional()
  @IsEnum(['INCOME', 'EXPENSE'])
  type?: string;

  @ApiPropertyOptional({ enum: ['CASH', 'BANK', 'QRIS'] })
  @IsOptional()
  @IsEnum(['CASH', 'BANK', 'QRIS'])
  wallet?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  amount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  transaction_date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
