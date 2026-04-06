import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class UploadPhotoStripDto {
  @ApiProperty({ description: 'Base64 data URL of the photo strip image' })
  @IsString()
  @IsNotEmpty()
  image: string;
}
