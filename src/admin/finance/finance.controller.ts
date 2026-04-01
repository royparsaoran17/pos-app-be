import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, UseGuards, ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { FinanceService } from './finance.service';
import { CreateFinanceDto, UpdateFinanceDto } from './finance.dto';
import { AuthGuard } from '../../guards/auth.guard';
import { RoleGuard, Roles } from '../../guards/role.guard';
import { StoreGuard, StoreId } from '../../guards/store.guard';

@ApiTags('Admin - Finance')
@ApiBearerAuth()
@UseGuards(AuthGuard, RoleGuard, StoreGuard)
@Roles('SUPERADMIN')
@Controller('admin/finance')
export class FinanceController {
  constructor(private service: FinanceService) {}

  @Get()
  @ApiOperation({ summary: 'Daftar transaksi keuangan' })
  async findAll(
    @StoreId() storeId: number | null,
    @Query('page') page?: number,
    @Query('per_page') perPage?: number,
    @Query('search') search?: string,
    @Query('type') type?: string,
    @Query('wallet') wallet?: string,
    @Query('category') category?: string,
    @Query('date_from') dateFrom?: string,
    @Query('date_to') dateTo?: string,
  ) {
    return this.service.findAll({
      page, per_page: perPage, search, type, wallet, category,
      date_from: dateFrom, date_to: dateTo,
    }, storeId);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Ringkasan saldo (Cash, Bank, QRIS)' })
  async getSummary(@StoreId() storeId: number | null) {
    return this.service.getSummary(storeId);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Daftar kategori yang pernah dipakai' })
  async getCategories(@StoreId() storeId: number | null) {
    return this.service.getCategories(storeId);
  }

  @Post()
  @ApiOperation({ summary: 'Tambah transaksi' })
  async create(@StoreId() storeId: number, @Body() dto: CreateFinanceDto) {
    return this.service.create(dto, storeId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update transaksi' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateFinanceDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Hapus transaksi' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }
}
