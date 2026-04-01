import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateBumbuDto {
  @ApiProperty({ example: 'Sambal Matah' })
  @IsString()
  @IsNotEmpty({ message: 'Nama bumbu wajib diisi' })
  name: string;
}

export class UpdateBumbuDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
