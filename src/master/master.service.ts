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

  async getAdditionals() {
    const additionals = await this.prisma.additionals.findMany({
      where: { deleted_at: null, is_active: true },
      orderBy: { sort_order: 'asc' },
    });
    return { content: additionals, message: 'Data additional berhasil dimuat' };
  }

  async getActivePromos() {
    const now = new Date();
    const promos = await this.prisma.promos.findMany({
      where: {
        deleted_at: null,
        is_active: true,
        OR: [
          { start_date: null },
          { start_date: { lte: now } },
        ],
      },
      orderBy: { created_at: 'desc' },
    });
    // Filter out expired / exhausted promos
    const valid = promos.filter(p => {
      if (p.end_date && now > p.end_date) return false;
      if (p.max_usage && p.used_count >= p.max_usage) return false;
      return true;
    });
    return { content: valid, message: 'Data promo aktif berhasil dimuat' };
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
