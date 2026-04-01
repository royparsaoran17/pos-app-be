import { Module } from '@nestjs/common';
import { StaffExpenseController } from './staff-expense.controller';
import { StaffExpenseService } from './staff-expense.service';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [StaffExpenseController],
  providers: [StaffExpenseService, PrismaService],
})
export class StaffExpenseModule {}
