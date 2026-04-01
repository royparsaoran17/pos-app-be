import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsBoolean, IsEmail } from 'class-validator';

export class CreateSupplierDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'Nama supplier wajib diisi' })
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail({}, { message: 'Format email tidak valid' })
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  contact_person?: string;

  @ApiPropertyOptional()
  @IsOptional()
  notes?: string;
}

export class UpdateSupplierDto {
  @ApiPropertyOptional()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail({}, { message: 'Format email tidak valid' })
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  contact_person?: string;

  @ApiPropertyOptional()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
