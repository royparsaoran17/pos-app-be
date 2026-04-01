import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, UseGuards, ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ExpenseService } from './expense.service';
import {
  CreateExpenseCategoryDto, UpdateExpenseCategoryDto,
  CreateExpenseDto, UpdateExpenseDto,
} from './expense.dto';
import { AuthGuard } from '../../guards/auth.guard';
import { RoleGuard, Roles } from '../../guards/role.guard';
import { StoreGuard, StoreId } from '../../guards/store.guard';

@ApiTags('Admin - Expense')
@ApiBearerAuth()
@UseGuards(AuthGuard, RoleGuard, StoreGuard)
@Roles('SUPERADMIN')
@Controller('admin')
export class ExpenseController {
  constructor(private service: ExpenseService) {}

  // ============ CATEGORIES ============

  @Get('expense-categories')
  @ApiOperation({ summary: 'Daftar kategori pengeluaran' })
  async findAllCategories(@Query('page') page?: number, @Query('per_page') perPage?: number, @Query('search') search?: string) {
    return this.service.findAllCategories({ page, per_page: perPage, search });
  }

  @Get('expense-categories/all')
  @ApiOperation({ summary: 'Semua kategori aktif (untuk dropdown)' })
  async allActiveCategories() {
    return this.service.findAllCategories({ per_page: 1000 });
  }

  @Post('expense-categories')
  @ApiOperation({ summary: 'Tambah kategori pengeluaran' })
  async createCategory(@Body() dto: CreateExpenseCategoryDto) {
    return this.service.createCategory(dto);
  }

  @Put('expense-categories/:id')
  @ApiOperation({ summary: 'Update kategori pengeluaran' })
  async updateCategory(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateExpenseCategoryDto) {
    return this.service.updateCategory(id, dto);
  }

  @Delete('expense-categories/:id')
  @ApiOperation({ summary: 'Hapus kategori pengeluaran' })
  async deleteCategory(@Param('id', ParseIntPipe) id: number) {
    return this.service.deleteCategory(id);
  }

  // ============ EXPENSES ============

  @Get('expenses')
  @ApiOperation({ summary: 'Daftar pengeluaran' })
  async findAll(
    @StoreId() storeId: number | null,
    @Query('page') page?: number,
    @Query('per_page') perPage?: number,
    @Query('search') search?: string,
    @Query('category_id') categoryId?: number,
    @Query('date_from') dateFrom?: string,
    @Query('date_to') dateTo?: string,
  ) {
    return this.service.findAll({ page, per_page: perPage, search, category_id: categoryId, date_from: dateFrom, date_to: dateTo }, storeId);
  }

  @Get('expenses/:id')
  @ApiOperation({ summary: 'Detail pengeluaran' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post('expenses')
  @ApiOperation({ summary: 'Tambah pengeluaran' })
  async create(@Body() dto: CreateExpenseDto, @StoreId() storeId: number) {
    return this.service.create(dto, storeId);
  }

  @Put('expenses/:id')
  @ApiOperation({ summary: 'Update pengeluaran' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateExpenseDto) {
    return this.service.update(id, dto);
  }

  @Delete('expenses/:id')
  @ApiOperation({ summary: 'Hapus pengeluaran' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }
}
