import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateMemberDto {
  @ApiProperty({ example: '08123456789' })
  @IsString()
  @IsNotEmpty({ message: 'Nomor HP wajib diisi' })
  phone: string;

  @ApiProperty({ required: false, example: 'Budi' })
  @IsOptional()
  @IsString()
  name?: string;
}

export class UpdateMemberDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
