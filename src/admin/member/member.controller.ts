import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, UseGuards, ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { MemberService } from './member.service';
import { CreateMemberDto, UpdateMemberDto } from './member.dto';
import { AuthGuard } from '../../guards/auth.guard';

@ApiTags('Member')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('members')
export class MemberController {
  constructor(private service: MemberService) {}

  @Get()
  @ApiOperation({ summary: 'Daftar member' })
  async findAll(@Query('page') page?: number, @Query('per_page') perPage?: number, @Query('search') search?: string) {
    return this.service.findAll({ page, per_page: perPage, search });
  }

  @Get('search-phone')
  @ApiOperation({ summary: 'Cari member by phone (untuk staff saat order)' })
  @ApiQuery({ name: 'phone', required: true })
  async searchByPhone(@Query('phone') phone: string) {
    return this.service.findByPhone(phone);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail member' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Get(':id/orders')
  @ApiOperation({ summary: 'Riwayat pesanan member' })
  async getOrderHistory(
    @Param('id', ParseIntPipe) id: number,
    @Query('page') page?: number,
    @Query('per_page') perPage?: number,
  ) {
    return this.service.getOrderHistory(id, { page, per_page: perPage });
  }

  @Post()
  @ApiOperation({ summary: 'Tambah member' })
  async create(@Body() dto: CreateMemberDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update member' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateMemberDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Hapus member' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }
}
