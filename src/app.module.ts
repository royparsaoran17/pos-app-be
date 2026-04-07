import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaService } from './prisma.service';
import { AuthModule } from './auth/auth.module';
import { OrderModule } from './order/order.module';
import { MasterModule } from './master/master.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AdminToppingModule } from './admin/topping/topping.module';
import { AdminBumbuModule } from './admin/bumbu/bumbu.module';
import { AdminMenuSizeModule } from './admin/menu-size/menu-size.module';
import { MemberModule } from './admin/member/member.module';
import { PromoModule } from './admin/promo/promo.module';
import { AdminStockModule } from './admin/stock/stock.module';
import { AdminExpenseModule } from './admin/expense/expense.module';
import { SopModule } from './staff/sop/sop.module';
import { QualityModule } from './staff/quality/quality.module';
import { StaffExpenseModule } from './staff/expense/staff-expense.module';
import { OpnameModule } from './staff/opname/opname.module';
import { AdminStaffModule } from './admin/staff/staff.module';
import { SupplierModule } from './admin/supplier/supplier.module';
import { ShiftModule } from './staff/shift/shift.module';
import { PackagingModule } from './staff/packaging/packaging.module';
import { FinanceModule } from './admin/finance/finance.module';
import { StoreModule } from './admin/store/store.module';
import { PhotoboothModule } from './staff/photobooth/photobooth.module';
import { AdminAdditionalModule } from './admin/additional/additional.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    AuthModule,
    OrderModule,
    MasterModule,
    DashboardModule,
    AdminToppingModule,
    AdminBumbuModule,
    AdminMenuSizeModule,
    MemberModule,
    PromoModule,
    AdminStockModule,
    AdminExpenseModule,
    SopModule,
    QualityModule,
    StaffExpenseModule,
    OpnameModule,
    AdminStaffModule,
    SupplierModule,
    ShiftModule,
    PackagingModule,
    FinanceModule,
    StoreModule,
    PhotoboothModule,
    AdminAdditionalModule,
  ],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
