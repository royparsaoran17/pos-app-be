import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, UseGuards, ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SupplierService } from './supplier.service';
import { CreateSupplierDto, UpdateSupplierDto } from './supplier.dto';
import { AuthGuard } from '../../guards/auth.guard';
import { RoleGuard, Roles } from '../../guards/role.guard';

@ApiTags('Admin - Supplier Management')
@ApiBearerAuth()
@UseGuards(AuthGuard, RoleGuard)
@Roles('SUPERADMIN')
@Controller('admin/suppliers')
export class SupplierController {
  constructor(private service: SupplierService) {}

  @Get()
  @ApiOperation({ summary: 'Daftar supplier' })
  async findAll(@Query('page') page?: number, @Query('per_page') perPage?: number, @Query('search') search?: string) {
    return this.service.findAll({ page, per_page: perPage, search });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail supplier' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Tambah supplier' })
  async create(@Body() dto: CreateSupplierDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update supplier' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSupplierDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Hapus supplier' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }
}
