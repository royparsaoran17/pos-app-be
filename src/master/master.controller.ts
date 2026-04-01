import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { MasterService } from './master.service';
import { AuthGuard } from '../guards/auth.guard';

@ApiTags('Master Data')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('master')
export class MasterController {
  constructor(private masterService: MasterService) {}

  @Get('toppings')
  @ApiOperation({ summary: 'Daftar semua topping' })
  async getToppings() {
    return this.masterService.getToppings();
  }

  @Get('bumbu')
  @ApiOperation({ summary: 'Daftar semua bumbu' })
  async getBumbu() {
    return this.masterService.getBumbu();
  }

  @Get('sizes')
  @ApiOperation({ summary: 'Daftar ukuran dan harga' })
  async getSizes() {
    return this.masterService.getSizes();
  }

  @Get('payment-methods')
  @ApiOperation({ summary: 'Daftar metode pembayaran' })
  async getPaymentMethods() {
    return this.masterService.getPaymentMethods();
  }
}
