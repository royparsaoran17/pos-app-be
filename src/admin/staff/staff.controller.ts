import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, UseGuards, ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AdminStaffService } from './staff.service';
import { CreateStaffDto, UpdateStaffDto } from './staff.dto';
import { AuthGuard } from '../../guards/auth.guard';
import { RoleGuard, Roles } from '../../guards/role.guard';
import { StoreGuard, StoreId } from '../../guards/store.guard';

@ApiTags('Admin - Staff Management')
@ApiBearerAuth()
@UseGuards(AuthGuard, RoleGuard, StoreGuard)
@Roles('SUPERADMIN')
@Controller('admin/staff')
export class AdminStaffController {
  constructor(private service: AdminStaffService) {}

  @Get()
  @ApiOperation({ summary: 'Daftar staff' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'per_page', required: false })
  @ApiQuery({ name: 'search', required: false })
  async findAll(
    @StoreId() storeId: number | null,
    @Query('page') page?: number,
    @Query('per_page') perPage?: number,
    @Query('search') search?: string,
  ) {
    return this.service.findAll({ page, per_page: perPage, search }, storeId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail staff' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Tambah staff baru' })
  async create(@Body() dto: CreateStaffDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update staff' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateStaffDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Hapus staff (soft delete)' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }
}
