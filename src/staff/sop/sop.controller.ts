import {
  Controller, Get, Post, Body, Query, Req, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { SopService } from './sop.service';
import { SaveChecklistDto } from './sop.dto';
import { AuthGuard } from '../../guards/auth.guard';
import { RoleGuard, Roles } from '../../guards/role.guard';
import { StoreGuard, StoreId } from '../../guards/store.guard';

@ApiTags('Staff - SOP Checklist')
@ApiBearerAuth()
@UseGuards(AuthGuard, StoreGuard)
@Controller('sop')
export class SopController {
  constructor(private service: SopService) {}

  @Get('tasks')
  @ApiOperation({ summary: 'Daftar semua SOP tasks' })
  async getTasks() {
    return this.service.getTasks();
  }

  @Get('checklist')
  @ApiOperation({ summary: 'Ambil checklist staff untuk tanggal tertentu' })
  @ApiQuery({ name: 'date', required: false })
  async getChecklist(@Req() req: any, @Query('date') date?: string) {
    const shiftDate = date || new Date().toISOString().slice(0, 10);
    return this.service.getChecklist(req.user.sub, shiftDate);
  }

  @Post('checklist')
  @ApiOperation({ summary: 'Simpan/update checklist' })
  async saveChecklist(@Req() req: any, @StoreId() storeId: number, @Body() dto: SaveChecklistDto) {
    return this.service.saveChecklist(req.user.sub, dto, storeId);
  }

  @Get('checklist/admin')
  @UseGuards(RoleGuard)
  @Roles('SUPERADMIN')
  @ApiOperation({ summary: 'Lihat checklist semua staff (admin)' })
  @ApiQuery({ name: 'date', required: false })
  async getChecklistsByDate(@StoreId() storeId: number | null, @Query('date') date?: string) {
    const shiftDate = date || new Date().toISOString().slice(0, 10);
    return this.service.getChecklistsByDate(shiftDate, storeId);
  }
}
