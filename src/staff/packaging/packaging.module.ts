import { Module } from '@nestjs/common';
import { PackagingController } from './packaging.controller';
import { PackagingService } from './packaging.service';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [PackagingController],
  providers: [PackagingService, PrismaService],
})
export class PackagingModule {}
