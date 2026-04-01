import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsBoolean, IsNumber, MinLength } from 'class-validator';

export class CreateStaffDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'Nama wajib diisi' })
  name: string;

  @ApiProperty()
  @IsEmail({}, { message: 'Format email tidak valid' })
  email: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Password wajib diisi' })
  @MinLength(6, { message: 'Password minimal 6 karakter' })
  password: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  store_id?: number;
}

export class UpdateStaffDto {
  @ApiPropertyOptional()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail({}, { message: 'Format email tidak valid' })
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @MinLength(6, { message: 'Password minimal 6 karakter' })
  password?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  store_id?: number;
}
