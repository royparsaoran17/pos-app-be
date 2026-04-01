import {
  Controller, Get, Post, Body, Query, Req, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { QualityService } from './quality.service';
import { SaveQualityCheckDto } from './quality.dto';
import { AuthGuard } from '../../guards/auth.guard';
import { RoleGuard, Roles } from '../../guards/role.guard';
import { StoreGuard, StoreId } from '../../guards/store.guard';

@ApiTags('Staff - Quality Check')
@ApiBearerAuth()
@UseGuards(AuthGuard, StoreGuard)
@Controller('quality')
export class QualityController {
  constructor(private service: QualityService) {}

  @Get('check')
  @ApiOperation({ summary: 'Ambil quality check untuk tanggal tertentu' })
  @ApiQuery({ name: 'date', required: false })
  async getCheck(@Req() req: any, @Query('date') date?: string) {
    const checkDate = date || new Date().toISOString().slice(0, 10);
    return this.service.getCheckByDate(req.user.sub, checkDate);
  }

  @Post('check')
  @ApiOperation({ summary: 'Simpan quality check' })
  async saveCheck(@Req() req: any, @StoreId() storeId: number, @Body() dto: SaveQualityCheckDto) {
    return this.service.saveCheck(req.user.sub, dto, storeId);
  }

  @Get('admin')
  @UseGuards(RoleGuard)
  @Roles('SUPERADMIN')
  @ApiOperation({ summary: 'Lihat quality check semua staff (admin)' })
  @ApiQuery({ name: 'date', required: false })
  async getChecksByDate(@StoreId() storeId: number | null, @Query('date') date?: string) {
    const checkDate = date || new Date().toISOString().slice(0, 10);
    return this.service.getChecksByDate(checkDate, storeId);
  }

  @Get('admin/history')
  @UseGuards(RoleGuard)
  @Roles('SUPERADMIN')
  @ApiOperation({ summary: 'Riwayat quality check (admin)' })
  async getHistory(
    @StoreId() storeId: number | null,
    @Query('date_from') dateFrom?: string,
    @Query('date_to') dateTo?: string,
    @Query('staff_id') staffId?: number,
  ) {
    return this.service.getHistory({ date_from: dateFrom, date_to: dateTo, staff_id: staffId }, storeId);
  }
}
