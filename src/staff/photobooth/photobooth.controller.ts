import {
  Controller, Post, Get, Body, Param, Res, UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { PhotoboothService } from './photobooth.service';
import { UploadPhotoStripDto } from './photobooth.dto';
import { AuthGuard } from '../../guards/auth.guard';
import { StoreGuard, StoreId } from '../../guards/store.guard';

@ApiTags('Photobooth')
@Controller('photobooth')
export class PhotoboothController {
  constructor(private service: PhotoboothService) {}

  @Post('upload')
  @ApiBearerAuth()
  @UseGuards(AuthGuard, StoreGuard)
  @ApiOperation({ summary: 'Upload photo strip (staff only)' })
  async upload(@Body() dto: UploadPhotoStripDto, @StoreId() storeId: number) {
    return this.service.upload(dto.image, storeId);
  }

  @Get('download/:token')
  @ApiOperation({ summary: 'Download photo strip (public, no auth)' })
  async download(@Param('token') token: string, @Res() res: Response) {
    const filePath = await this.service.download(token);
    if (!filePath) {
      throw new NotFoundException('Link sudah kadaluarsa atau tidak ditemukan');
    }

    const ext = filePath.endsWith('.png') ? 'png' : 'jpeg';
    res.setHeader('Content-Type', `image/${ext}`);
    res.setHeader('Content-Disposition', `inline; filename="oh-my-tongue-photo.${ext === 'png' ? 'png' : 'jpg'}"`);
    res.sendFile(filePath);
  }
}
