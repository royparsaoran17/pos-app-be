import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, UseGuards, ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ToppingService } from './topping.service';
import { CreateToppingDto, UpdateToppingDto } from './topping.dto';
import { AuthGuard } from '../../guards/auth.guard';
import { RoleGuard, Roles } from '../../guards/role.guard';

@ApiTags('Admin - Topping')
@ApiBearerAuth()
@UseGuards(AuthGuard, RoleGuard)
@Roles('SUPERADMIN')
@Controller('admin/toppings')
export class ToppingController {
  constructor(private service: ToppingService) {}

  @Get()
  @ApiOperation({ summary: 'Daftar topping (admin)' })
  async findAll(@Query('page') page?: number, @Query('per_page') perPage?: number, @Query('search') search?: string) {
    return this.service.findAll({ page, per_page: perPage, search });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail topping' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Tambah topping' })
  async create(@Body() dto: CreateToppingDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update topping' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateToppingDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Hapus topping' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }
}
