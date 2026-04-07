import { Module } from '@nestjs/common';
import { AdditionalController } from './additional.controller';
import { AdditionalService } from './additional.service';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [AdditionalController],
  providers: [AdditionalService, PrismaService],
})
export class AdminAdditionalModule {}
