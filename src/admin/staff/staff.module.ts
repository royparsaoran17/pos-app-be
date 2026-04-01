import { Module } from '@nestjs/common';
import { AdminStaffController } from './staff.controller';
import { AdminStaffService } from './staff.service';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [AdminStaffController],
  providers: [AdminStaffService, PrismaService],
})
export class AdminStaffModule {}
