import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, UseGuards, ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { StoreService } from './store.service';
import { CreateStoreDto, UpdateStoreDto } from './store.dto';
import { AuthGuard } from '../../guards/auth.guard';
import { RoleGuard, Roles } from '../../guards/role.guard';

@ApiTags('Stores')
@ApiBearerAuth()
@Controller('admin/stores')
@UseGuards(AuthGuard, RoleGuard)
@Roles('SUPERADMIN')
export class StoreController {
  constructor(private storeService: StoreService) {}

  @Get()
  findAll(@Query() query) {
    return this.storeService.findAll(query);
  }

  @Get('active')
  findAllActive() {
    return this.storeService.findAllActive();
  }

  @Post()
  create(@Body() dto: CreateStoreDto) {
    return this.storeService.create(dto);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateStoreDto) {
    return this.storeService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.storeService.delete(id);
  }
}
