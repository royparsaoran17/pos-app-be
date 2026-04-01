import { Module } from '@nestjs/common';
import { QualityController } from './quality.controller';
import { QualityService } from './quality.service';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [QualityController],
  providers: [QualityService, PrismaService],
})
export class QualityModule {}
