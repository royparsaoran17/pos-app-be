import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, UseGuards, ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { PromoService } from './promo.service';
import { CreatePromoDto, UpdatePromoDto } from './promo.dto';
import { AuthGuard } from '../../guards/auth.guard';
import { RoleGuard, Roles } from '../../guards/role.guard';

@ApiTags('Promo')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('promos')
export class PromoController {
  constructor(private service: PromoService) {}

  @Get()
  @ApiOperation({ summary: 'Daftar promo' })
  async findAll(@Query('page') page?: number, @Query('per_page') perPage?: number, @Query('search') search?: string) {
    return this.service.findAll({ page, per_page: perPage, search });
  }

  @Get('validate')
  @ApiOperation({ summary: 'Validasi kode promo (staff saat order)' })
  @ApiQuery({ name: 'code', required: true })
  @ApiQuery({ name: 'subtotal', required: true })
  async validatePromo(@Query('code') code: string, @Query('subtotal') subtotal: string) {
    return this.service.validatePromoCode(code, Number(subtotal));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail promo' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @UseGuards(RoleGuard)
  @Roles('SUPERADMIN')
  @ApiOperation({ summary: 'Tambah promo (admin)' })
  async create(@Body() dto: CreatePromoDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  @UseGuards(RoleGuard)
  @Roles('SUPERADMIN')
  @ApiOperation({ summary: 'Update promo (admin)' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePromoDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(RoleGuard)
  @Roles('SUPERADMIN')
  @ApiOperation({ summary: 'Hapus promo (admin)' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }
}
