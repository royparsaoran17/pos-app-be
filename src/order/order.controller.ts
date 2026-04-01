import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { AuthGuard } from '../guards/auth.guard';
import { StoreGuard, StoreId } from '../guards/store.guard';

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(AuthGuard, StoreGuard)
@Controller('orders')
export class OrderController {
  constructor(private orderService: OrderService) {}

  @Post()
  @ApiOperation({ summary: 'Buat pesanan baru (bulk support)' })
  async createOrder(@Body() dto: CreateOrderDto, @Req() req, @StoreId() storeId: number) {
    return this.orderService.createOrder(dto, req.user.sub, storeId);
  }

  @Get()
  @ApiOperation({ summary: 'Daftar semua pesanan' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'per_page', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'staff_id', required: false })
  @ApiQuery({ name: 'payment_method', required: false })
  @ApiQuery({ name: 'date_from', required: false })
  @ApiQuery({ name: 'date_to', required: false })
  async getOrders(@Query() query, @StoreId() storeId: number) {
    return this.orderService.getOrders(query, storeId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail pesanan' })
  async getOrderById(@Param('id', ParseIntPipe) id: number) {
    return this.orderService.getOrderById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Edit pesanan (admin)' })
  async updateOrder(@Param('id', ParseIntPipe) id: number, @Body() dto: any) {
    return this.orderService.updateOrder(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Batalkan pesanan' })
  async deleteOrder(@Param('id', ParseIntPipe) id: number) {
    return this.orderService.deleteOrder(id);
  }
}
