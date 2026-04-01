import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';

export class CreatePackagingDto {
  @ApiProperty({ example: 'MEDIUM' })
  @IsNotEmpty({ message: 'Menu size wajib dipilih' })
  menu_size_key: string;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(1, { message: 'Jumlah minimal 1' })
  quantity: number;

  @ApiPropertyOptional()
  @IsOptional()
  notes?: string;
}
