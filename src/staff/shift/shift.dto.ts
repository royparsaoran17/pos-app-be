import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsNumber, Min } from 'class-validator';

export class OpenShiftDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'Kas awal wajib diisi' })
  @IsNumber()
  @Min(0)
  opening_cash: number;

  @ApiPropertyOptional()
  @IsOptional()
  notes?: string;
}

export class CloseShiftDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'Kas akhir wajib diisi' })
  @IsNumber()
  @Min(0)
  closing_cash: number;

  @ApiPropertyOptional()
  @IsOptional()
  notes?: string;
}
