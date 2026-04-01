import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, UseGuards, ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { BumbuService } from './bumbu.service';
import { CreateBumbuDto, UpdateBumbuDto } from './bumbu.dto';
import { AuthGuard } from '../../guards/auth.guard';
import { RoleGuard, Roles } from '../../guards/role.guard';

@ApiTags('Admin - Bumbu')
@ApiBearerAuth()
@UseGuards(AuthGuard, RoleGuard)
@Roles('SUPERADMIN')
@Controller('admin/bumbu')
export class BumbuController {
  constructor(private service: BumbuService) {}

  @Get()
  @ApiOperation({ summary: 'Daftar bumbu (admin)' })
  async findAll(@Query('page') page?: number, @Query('per_page') perPage?: number, @Query('search') search?: string) {
    return this.service.findAll({ page, per_page: perPage, search });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail bumbu' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Tambah bumbu' })
  async create(@Body() dto: CreateBumbuDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update bumbu' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBumbuDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Hapus bumbu' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }
}
