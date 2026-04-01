import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, UseGuards, ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { MenuSizeService } from './menu-size.service';
import { CreateMenuSizeDto, UpdateMenuSizeDto } from './menu-size.dto';
import { AuthGuard } from '../../guards/auth.guard';
import { RoleGuard, Roles } from '../../guards/role.guard';

@ApiTags('Admin - Menu/Ukuran')
@ApiBearerAuth()
@UseGuards(AuthGuard, RoleGuard)
@Roles('SUPERADMIN')
@Controller('admin/menu-sizes')
export class MenuSizeController {
  constructor(private service: MenuSizeService) {}

  @Get()
  @ApiOperation({ summary: 'Daftar menu/ukuran (admin)' })
  async findAll(@Query('page') page?: number, @Query('per_page') perPage?: number, @Query('search') search?: string) {
    return this.service.findAll({ page, per_page: perPage, search });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail menu/ukuran' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Tambah menu/ukuran baru' })
  async create(@Body() dto: CreateMenuSizeDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update menu/ukuran' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateMenuSizeDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Hapus menu/ukuran' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }
}
