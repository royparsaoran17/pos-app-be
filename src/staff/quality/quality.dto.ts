import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsDateString, IsArray, ValidateNested, IsInt, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class QualityCheckItemDto {
  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  topping_id: number;

  @ApiProperty({ enum: ['GOOD', 'WARNING', 'BAD'] })
  @IsEnum(['GOOD', 'WARNING', 'BAD'])
  status: 'GOOD' | 'WARNING' | 'BAD';

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class SaveQualityCheckDto {
  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  check_date: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ type: [QualityCheckItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QualityCheckItemDto)
  items: QualityCheckItemDto[];
}
