import { Module } from '@nestjs/common';
import { BumbuController } from './bumbu.controller';
import { BumbuService } from './bumbu.service';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [BumbuController],
  providers: [BumbuService, PrismaService],
})
export class AdminBumbuModule {}
