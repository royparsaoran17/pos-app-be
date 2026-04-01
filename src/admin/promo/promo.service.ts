import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreatePromoDto, UpdatePromoDto } from './promo.dto';

@Injectable()
export class PromoService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: { page?: number; per_page?: number; search?: string }) {
    const page = Number(query.page) || 1;
    const perPage = Number(query.per_page) || 20;
    const skip = (page - 1) * perPage;
    const where: any = { deleted_at: null };

    if (query.search) {
      where.OR = [
        { code: { contains: query.search } },
        { name: { contains: query.search } },
      ];
    }

    const [rows, count] = await Promise.all([
      this.prisma.promos.findMany({
        where, skip, take: perPage,
        orderBy: { created_at: 'desc' },
        include: { _count: { select: { orders: true } } },
      }),
      this.prisma.promos.count({ where }),
    ]);

    return {
      content: rows,
      meta: { total: count, per_page: perPage, current_page: page, last_page: Math.ceil(count / perPage) || 1 },
      message: 'Data promo berhasil dimuat',
    };
  }

  async findOne(id: number) {
    const row = await this.prisma.promos.findFirst({
      where: { id, deleted_at: null },
      include: { _count: { select: { orders: true } } },
    });
    if (!row) throw new NotFoundException('Promo tidak ditemukan');
    return { content: row, message: 'Detail promo berhasil dimuat' };
  }

  async validatePromoCode(code: string, subtotal: number) {
    const promo = await this.prisma.promos.findFirst({
      where: { code: code.toUpperCase(), deleted_at: null, is_active: true },
    });

    if (!promo) throw new NotFoundException('Kode promo tidak valid');

    const now = new Date();
    if (promo.start_date && now < promo.start_date) {
      throw new BadRequestException('Promo belum berlaku');
    }
    if (promo.end_date && now > promo.end_date) {
      throw new BadRequestException('Promo sudah berakhir');
    }
    if (promo.max_usage && promo.used_count >= promo.max_usage) {
      throw new BadRequestException('Kuota promo sudah habis');
    }
    if (subtotal < promo.min_purchase) {
      throw new BadRequestException(`Minimal pembelian ${promo.min_purchase} untuk promo ini`);
    }

    let discountAmount = 0;
    if (promo.discount_type === 'PERCENTAGE') {
      discountAmount = Math.floor(subtotal * promo.discount_value / 100);
      if (promo.max_discount && discountAmount > promo.max_discount) {
        discountAmount = promo.max_discount;
      }
    } else {
      discountAmount = promo.discount_value;
    }

    if (discountAmount > subtotal) {
      discountAmount = subtotal;
    }

    return {
      content: {
        promo,
        discount_amount: discountAmount,
        total_after_discount: subtotal - discountAmount,
      },
      message: 'Promo berhasil diterapkan',
    };
  }

  async create(dto: CreatePromoDto) {
    const exists = await this.prisma.promos.findFirst({
      where: { code: dto.code.toUpperCase(), deleted_at: null },
    });
    if (exists) throw new ConflictException('Kode promo sudah digunakan');

    const data: any = {
      ...dto,
      code: dto.code.toUpperCase(),
    };
    if (dto.start_date) data.start_date = new Date(dto.start_date);
    if (dto.end_date) data.end_date = new Date(dto.end_date);

    const row = await this.prisma.promos.create({ data });
    return { content: row, message: 'Promo berhasil ditambahkan' };
  }

  async update(id: number, dto: UpdatePromoDto) {
    await this.findOne(id);
    const data: any = { ...dto };
    if (dto.start_date) data.start_date = new Date(dto.start_date);
    if (dto.end_date) data.end_date = new Date(dto.end_date);

    const row = await this.prisma.promos.update({ where: { id }, data });
    return { content: row, message: 'Promo berhasil diperbarui' };
  }

  async delete(id: number) {
    await this.findOne(id);
    await this.prisma.promos.update({ where: { id }, data: { deleted_at: new Date() } });
    return { message: 'Promo berhasil dihapus' };
  }
}
