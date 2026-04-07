import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsNumber, IsBoolean } from 'class-validator';

export class CreateAdditionalDto {
  @ApiProperty({ example: 'Keju' })
  @IsString()
  @IsNotEmpty({ message: 'Nama wajib diisi' })
  name: string;

  @ApiProperty({ example: 3000 })
  @IsNumber()
  price: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  sort_order?: number;
}

export class UpdateAdditionalDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  sort_order?: number;
}
