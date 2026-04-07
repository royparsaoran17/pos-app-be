import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, UseGuards, ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AdditionalService } from './additional.service';
import { CreateAdditionalDto, UpdateAdditionalDto } from './additional.dto';
import { AuthGuard } from '../../guards/auth.guard';
import { RoleGuard, Roles } from '../../guards/role.guard';

@ApiTags('Admin - Additional')
@ApiBearerAuth()
@UseGuards(AuthGuard, RoleGuard)
@Roles('SUPERADMIN')
@Controller('admin/additionals')
export class AdditionalController {
  constructor(private service: AdditionalService) {}

  @Get()
  @ApiOperation({ summary: 'Daftar additional (admin)' })
  async findAll(@Query('page') page?: number, @Query('per_page') perPage?: number, @Query('search') search?: string) {
    return this.service.findAll({ page, per_page: perPage, search });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail additional' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Tambah additional' })
  async create(@Body() dto: CreateAdditionalDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update additional' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAdditionalDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Hapus additional' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }
}
