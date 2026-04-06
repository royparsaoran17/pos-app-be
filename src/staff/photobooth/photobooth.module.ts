import { Module } from '@nestjs/common';
import { PhotoboothController } from './photobooth.controller';
import { PhotoboothService } from './photobooth.service';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [PhotoboothController],
  providers: [PhotoboothService, PrismaService],
})
export class PhotoboothModule {}
