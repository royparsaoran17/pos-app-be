import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class MasterService {
  constructor(private prisma: PrismaService) {}

  async getToppings() {
    const toppings = await this.prisma.toppings.findMany({
      where: { deleted_at: null, is_active: true },
      orderBy: { name: 'asc' },
    });
    return { content: toppings, message: 'Data topping berhasil dimuat' };
  }

  async getBumbu() {
    const bumbu = await this.prisma.bumbu.findMany({
      where: { deleted_at: null, is_active: true },
      orderBy: { name: 'asc' },
    });
    return { content: bumbu, message: 'Data bumbu berhasil dimuat' };
  }

  async getSizes() {
    const sizes = await this.prisma.menu_sizes.findMany({
      where: { deleted_at: null, is_active: true },
      orderBy: { sort_order: 'asc' },
    });
    return { content: sizes, message: 'Data ukuran berhasil dimuat' };
  }

  getPaymentMethods() {
    const methods = [
      { key: 'CASH', label: 'Cash' },
      { key: 'QRIS', label: 'QRIS' },
      { key: 'PROMO', label: 'Promo' },
      { key: 'GOJEK', label: 'Gojek' },
    ];
    return { content: methods, message: 'Data metode pembayaran berhasil dimuat' };
  }
}
