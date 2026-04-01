import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsDateString, IsArray, ValidateNested, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class ToggleCheckItemDto {
  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  task_id: number;

  @ApiProperty()
  @IsBoolean()
  is_checked: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class SaveChecklistDto {
  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  shift_date: string;

  @ApiProperty({ type: [ToggleCheckItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ToggleCheckItemDto)
  items: ToggleCheckItemDto[];
}
