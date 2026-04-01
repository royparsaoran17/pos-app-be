import {
  Controller, Get, Post, Query, Body, UseGuards, Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { OpnameService } from './opname.service';
import { AuthGuard } from '../../guards/auth.guard';
import { RoleGuard, Roles } from '../../guards/role.guard';
import { StoreGuard, StoreId } from '../../guards/store.guard';

@ApiTags('Stock Opname')
@ApiBearerAuth()
@UseGuards(AuthGuard, StoreGuard)
@Controller('stock-opname')
export class OpnameController {
  constructor(private service: OpnameService) {}

  @Get('toppings')
  @ApiOperation({ summary: 'Daftar topping aktif' })
  getToppings() {
    return this.service.getToppings();
  }

  @Get()
  @ApiOperation({ summary: 'Ambil/buat stok opname hari ini' })
  @ApiQuery({ name: 'date', required: false })
  getOrCreate(@Req() req, @StoreId() storeId: number, @Query('date') date?: string) {
    const d = date || new Date().toISOString().slice(0, 10);
    return this.service.getOrCreate(req.user.sub, d, storeId);
  }

  @Post()
  @ApiOperation({ summary: 'Simpan stok opname' })
  save(@Req() req, @StoreId() storeId: number, @Body() dto: { date: string; items: { topping_id: number; weight_kg: number; notes?: string }[] }) {
    return this.service.save(req.user.sub, dto.date, dto.items, storeId);
  }

  @Get('admin')
  @UseGuards(RoleGuard)
  @Roles('SUPERADMIN')
  @ApiOperation({ summary: 'Admin: semua data stok opname' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'per_page', required: false })
  @ApiQuery({ name: 'date_from', required: false })
  @ApiQuery({ name: 'date_to', required: false })
  @ApiQuery({ name: 'staff_id', required: false })
  findAllAdmin(@StoreId() storeId: number | null, @Query() query) {
    return this.service.findAllAdmin(query, storeId);
  }
}
