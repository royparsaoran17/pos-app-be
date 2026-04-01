import { Module } from '@nestjs/common';
import { SopController } from './sop.controller';
import { SopService } from './sop.service';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [SopController],
  providers: [SopService, PrismaService],
})
export class SopModule {}
