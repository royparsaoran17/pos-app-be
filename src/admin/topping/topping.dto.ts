import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsNumber, Min } from 'class-validator';

export class CreateToppingDto {
  @ApiProperty({ example: 'Kerupuk Pedas' })
  @IsString()
  @IsNotEmpty({ message: 'Nama topping wajib diisi' })
  name: string;

  @ApiPropertyOptional({ example: 25, description: 'Gram per 1 porsi topping' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  gram_per_portion?: number;
}

export class UpdateToppingDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 25, description: 'Gram per 1 porsi topping' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  gram_per_portion?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
