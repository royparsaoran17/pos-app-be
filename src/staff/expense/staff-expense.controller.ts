import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, UseGuards, Req, ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { StaffExpenseService } from './staff-expense.service';
import { AuthGuard } from '../../guards/auth.guard';
import { RoleGuard, Roles } from '../../guards/role.guard';
import { StoreGuard, StoreId } from '../../guards/store.guard';

@ApiTags('Staff Expenses')
@ApiBearerAuth()
@UseGuards(AuthGuard, StoreGuard)
@Controller('staff-expenses')
export class StaffExpenseController {
  constructor(private service: StaffExpenseService) {}

  @Get('categories')
  @ApiOperation({ summary: 'Daftar kategori pengeluaran' })
  getCategories() {
    return this.service.getCategories();
  }

  @Get()
  @ApiOperation({ summary: 'Daftar pengeluaran staff (milik sendiri)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'per_page', required: false })
  @ApiQuery({ name: 'date_from', required: false })
  @ApiQuery({ name: 'date_to', required: false })
  @ApiQuery({ name: 'category_id', required: false })
  findAll(@Req() req, @Query() query) {
    return this.service.findAll(req.user.sub, query);
  }

  @Post()
  @ApiOperation({ summary: 'Tambah pengeluaran' })
  create(@Req() req, @Body() dto: any, @StoreId() storeId: number) {
    return this.service.create(req.user.sub, dto, storeId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Edit pengeluaran' })
  update(@Req() req, @Param('id', ParseIntPipe) id: number, @Body() dto: any) {
    return this.service.update(req.user.sub, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Hapus pengeluaran' })
  delete(@Req() req, @Param('id', ParseIntPipe) id: number) {
    return this.service.delete(req.user.sub, id);
  }

  @Get('admin')
  @UseGuards(RoleGuard)
  @Roles('SUPERADMIN')
  @ApiOperation({ summary: 'Admin: semua pengeluaran staff' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'per_page', required: false })
  @ApiQuery({ name: 'date_from', required: false })
  @ApiQuery({ name: 'date_to', required: false })
  @ApiQuery({ name: 'staff_id', required: false })
  @ApiQuery({ name: 'category_id', required: false })
  findAllAdmin(@Query() query, @StoreId() storeId: number | null) {
    return this.service.findAllAdmin(query, storeId);
  }
}
