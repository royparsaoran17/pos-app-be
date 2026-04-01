import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, UseGuards, ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { StockService } from './stock.service';
import { CreateStockEntryDto, UpdateStockEntryDto } from './stock.dto';
import { AuthGuard } from '../../guards/auth.guard';
import { RoleGuard, Roles } from '../../guards/role.guard';
import { StoreGuard, StoreId } from '../../guards/store.guard';

@ApiTags('Admin - Stock')
@ApiBearerAuth()
@UseGuards(AuthGuard, RoleGuard, StoreGuard)
@Roles('SUPERADMIN')
@Controller('admin/stocks')
export class StockController {
  constructor(private service: StockService) {}

  @Get()
  @ApiOperation({ summary: 'Daftar stok masuk (admin)' })
  async findAll(
    @StoreId() storeId: number | null,
    @Query('page') page?: number,
    @Query('per_page') perPage?: number,
    @Query('search') search?: string,
    @Query('item_type') itemType?: string,
    @Query('date_from') dateFrom?: string,
    @Query('date_to') dateTo?: string,
  ) {
    return this.service.findAll({ page, per_page: perPage, search, item_type: itemType, date_from: dateFrom, date_to: dateTo }, storeId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail stok' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Tambah stok masuk' })
  async create(@StoreId() storeId: number, @Body() dto: CreateStockEntryDto) {
    return this.service.create(dto, storeId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update stok' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateStockEntryDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Hapus stok' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }
}
