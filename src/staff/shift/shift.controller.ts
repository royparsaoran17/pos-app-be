import { Controller, Get, Post, Body, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ShiftService } from './shift.service';
import { OpenShiftDto, CloseShiftDto } from './shift.dto';
import { AuthGuard } from '../../guards/auth.guard';
import { RoleGuard, Roles } from '../../guards/role.guard';
import { StoreGuard, StoreId } from '../../guards/store.guard';

@ApiTags('Shift Management')
@ApiBearerAuth()
@UseGuards(AuthGuard, StoreGuard)
@Controller('shifts')
export class ShiftController {
  constructor(private service: ShiftService) {}

  @Get('active')
  @ApiOperation({ summary: 'Cek shift aktif (staff)' })
  async getActiveShift(@Req() req) {
    return this.service.getActiveShift(req.user.sub);
  }

  @Post('open')
  @ApiOperation({ summary: 'Buka shift baru' })
  async openShift(@Req() req, @Body() dto: OpenShiftDto, @StoreId() storeId: number) {
    return this.service.openShift(req.user.sub, dto, storeId);
  }

  @Post('close')
  @ApiOperation({ summary: 'Tutup shift' })
  async closeShift(@Req() req, @Body() dto: CloseShiftDto) {
    return this.service.closeShift(req.user.sub, dto);
  }

  @Get('history')
  @ApiOperation({ summary: 'Riwayat shift staff' })
  async getHistory(@Req() req, @Query('page') page?: number, @Query('per_page') perPage?: number) {
    return this.service.getShiftHistory(req.user.sub, { page, per_page: perPage });
  }

  @Get('admin')
  @UseGuards(RoleGuard)
  @Roles('SUPERADMIN')
  @ApiOperation({ summary: 'Riwayat shift semua staff (admin)' })
  @ApiQuery({ name: 'staff_id', required: false })
  @ApiQuery({ name: 'date_from', required: false })
  @ApiQuery({ name: 'date_to', required: false })
  async getHistoryAdmin(
    @StoreId() storeId: number | null,
    @Query('page') page?: number,
    @Query('per_page') perPage?: number,
    @Query('staff_id') staffId?: number,
    @Query('date_from') dateFrom?: string,
    @Query('date_to') dateTo?: string,
  ) {
    return this.service.getShiftHistoryAdmin({ page, per_page: perPage, staff_id: staffId, date_from: dateFrom, date_to: dateTo }, storeId);
  }
}
