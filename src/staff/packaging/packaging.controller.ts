import { Controller, Get, Post, Delete, Body, Param, Query, Req, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { PackagingService } from './packaging.service';
import { CreatePackagingDto } from './packaging.dto';
import { AuthGuard } from '../../guards/auth.guard';
import { RoleGuard, Roles } from '../../guards/role.guard';
import { StoreGuard, StoreId } from '../../guards/store.guard';

@ApiTags('Stock Packaging')
@ApiBearerAuth()
@UseGuards(AuthGuard, StoreGuard)
@Controller('stock-packaging')
export class PackagingController {
  constructor(private service: PackagingService) {}

  @Post()
  @ApiOperation({ summary: 'Catat packaging baru (staff)' })
  async create(@Req() req, @StoreId() storeId: number, @Body() dto: CreatePackagingDto) {
    return this.service.create(req.user.sub, dto, storeId);
  }

  @Get()
  @ApiOperation({ summary: 'Riwayat packaging staff' })
  @ApiQuery({ name: 'date', required: false })
  async findByStaff(@Req() req, @Query('page') page?: number, @Query('per_page') perPage?: number, @Query('date') date?: string) {
    return this.service.findByStaff(req.user.sub, { page, per_page: perPage, date });
  }

  @Get('summary-today')
  @ApiOperation({ summary: 'Ringkasan packaging hari ini' })
  async getSummaryToday(@Req() req) {
    return this.service.getSummaryToday(req.user.sub);
  }

  @Get('admin')
  @UseGuards(RoleGuard)
  @Roles('SUPERADMIN')
  @ApiOperation({ summary: 'Riwayat packaging semua staff (admin)' })
  @ApiQuery({ name: 'staff_id', required: false })
  @ApiQuery({ name: 'date_from', required: false })
  @ApiQuery({ name: 'date_to', required: false })
  async findAllAdmin(
    @StoreId() storeId: number | null,
    @Query('page') page?: number,
    @Query('per_page') perPage?: number,
    @Query('staff_id') staffId?: number,
    @Query('date_from') dateFrom?: string,
    @Query('date_to') dateTo?: string,
  ) {
    return this.service.findAllAdmin({ page, per_page: perPage, staff_id: staffId, date_from: dateFrom, date_to: dateTo }, storeId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Hapus packaging' })
  async delete(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.service.delete(id, req.user.sub);
  }
}
