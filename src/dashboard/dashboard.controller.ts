import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { AuthGuard } from '../guards/auth.guard';
import { RoleGuard, Roles } from '../guards/role.guard';
import { StoreGuard, StoreId } from '../guards/store.guard';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(AuthGuard, RoleGuard, StoreGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('statistics')
  @Roles('SUPERADMIN')
  @ApiOperation({ summary: 'Statistik dashboard (Superadmin)' })
  @ApiQuery({ name: 'date_from', required: false })
  @ApiQuery({ name: 'date_to', required: false })
  async getStatistics(
    @Query('date_from') dateFrom?: string,
    @Query('date_to') dateTo?: string,
    @StoreId() storeId?: number,
  ) {
    return this.dashboardService.getStatistics(dateFrom, dateTo, storeId);
  }

  @Get('staff-list')
  @Roles('SUPERADMIN')
  @ApiOperation({ summary: 'Daftar staff' })
  async getStaffList(@StoreId() storeId?: number) {
    return this.dashboardService.getStaffList(storeId);
  }

  @Get('reports')
  @Roles('SUPERADMIN')
  @ApiOperation({ summary: 'Laporan penjualan detail' })
  @ApiQuery({ name: 'period', required: false, enum: ['today', 'yesterday', 'this_week', 'this_month', 'last_month', 'custom'] })
  @ApiQuery({ name: 'date_from', required: false })
  @ApiQuery({ name: 'date_to', required: false })
  async getReports(
    @Query('period') period?: string,
    @Query('date_from') dateFrom?: string,
    @Query('date_to') dateTo?: string,
    @StoreId() storeId?: number,
  ) {
    return this.dashboardService.getReports(period || 'this_month', dateFrom, dateTo, storeId);
  }

  @Get('daily-recap')
  @Roles('SUPERADMIN')
  @ApiOperation({ summary: 'Rekap harian (Superadmin)' })
  @ApiQuery({ name: 'date', required: false, description: 'Tanggal rekap (YYYY-MM-DD)' })
  async getDailyRecap(@Query('date') date?: string, @StoreId() storeId?: number) {
    const targetDate = date || new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
    return this.dashboardService.getDailyRecap(targetDate, storeId);
  }

  @Get('topping-stock')
  @Roles('SUPERADMIN')
  @ApiOperation({ summary: 'Stok & pemakaian topping' })
  @ApiQuery({ name: 'date', required: false, description: 'Tanggal (YYYY-MM-DD), default hari ini' })
  async getToppingStock(@Query('date') date?: string, @StoreId() storeId?: number) {
    return this.dashboardService.getToppingStock(date, storeId);
  }

  @Get('analytics')
  @Roles('SUPERADMIN')
  @ApiOperation({ summary: 'Business analytics (trends, channels, peak hours, etc)' })
  @ApiQuery({ name: 'date_from', required: false })
  @ApiQuery({ name: 'date_to', required: false })
  async getAnalytics(
    @Query('date_from') dateFrom?: string,
    @Query('date_to') dateTo?: string,
    @StoreId() storeId?: number,
  ) {
    return this.dashboardService.getAnalytics(dateFrom, dateTo, storeId);
  }

  @Get('attendance')
  @Roles('SUPERADMIN')
  @ApiOperation({ summary: 'Riwayat absensi staff' })
  @ApiQuery({ name: 'date_from', required: false })
  @ApiQuery({ name: 'date_to', required: false })
  @ApiQuery({ name: 'staff_id', required: false })
  async getAttendance(
    @Query('date_from') dateFrom?: string,
    @Query('date_to') dateTo?: string,
    @Query('staff_id') staffId?: string,
    @StoreId() storeId?: number,
  ) {
    return this.dashboardService.getAttendance(dateFrom, dateTo, staffId ? Number(staffId) : undefined, storeId);
  }
}
