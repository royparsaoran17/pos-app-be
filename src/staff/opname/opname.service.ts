import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class OpnameService {
  constructor(private prisma: PrismaService) {}

  async getToppings() {
    const toppings = await this.prisma.toppings.findMany({
      where: { deleted_at: null, is_active: true },
      orderBy: { name: 'asc' },
    });
    return { content: toppings, message: 'Topping berhasil dimuat' };
  }

  async getOrCreate(staffId: number, date: string, storeId: number) {
    if (!storeId) {
      throw new BadRequestException('Pilih toko terlebih dahulu');
    }
    const opnameDate = new Date(date);
    let opname = await this.prisma.stock_opname.findUnique({
      where: { staff_id_opname_date: { staff_id: staffId, opname_date: opnameDate } },
      include: { items: { include: { topping: { select: { id: true, name: true } } } } },
    });

    if (!opname) {
      const toppings = await this.prisma.toppings.findMany({
        where: { deleted_at: null, is_active: true },
        orderBy: { name: 'asc' },
      });
      opname = await this.prisma.stock_opname.create({
        data: {
          staff_id: staffId,
          opname_date: opnameDate,
          store_id: storeId,
          items: {
            create: toppings.map((t) => ({
              topping_id: t.id,
              weight_kg: 0,
            })),
          },
        },
        include: { items: { include: { topping: { select: { id: true, name: true } } } } },
      });
    }

    return { content: opname, message: 'Stok opname berhasil dimuat' };
  }

  async save(staffId: number, date: string, items: { topping_id: number; weight_kg: number; notes?: string }[], storeId: number) {
    if (!storeId) {
      throw new BadRequestException('Pilih toko terlebih dahulu');
    }
    const opnameDate = new Date(date);
    let opname = await this.prisma.stock_opname.findUnique({
      where: { staff_id_opname_date: { staff_id: staffId, opname_date: opnameDate } },
    });

    if (!opname) {
      opname = await this.prisma.stock_opname.create({
        data: { staff_id: staffId, opname_date: opnameDate, store_id: storeId },
      });
    }

    // Delete existing items and recreate
    await this.prisma.stock_opname_items.deleteMany({ where: { opname_id: opname.id } });
    await this.prisma.stock_opname_items.createMany({
      data: items.map((item) => ({
        opname_id: opname.id,
        topping_id: item.topping_id,
        weight_kg: item.weight_kg,
        notes: item.notes || null,
      })),
    });

    const result = await this.prisma.stock_opname.findUnique({
      where: { id: opname.id },
      include: { items: { include: { topping: { select: { id: true, name: true } } } } },
    });

    return { content: result, message: 'Stok opname berhasil disimpan' };
  }

  // Admin: view all opname records
  async findAllAdmin(query: { page?: number; per_page?: number; date_from?: string; date_to?: string; staff_id?: number }, storeId: number | null = null) {
    const page = Number(query.page) || 1;
    const perPage = Number(query.per_page) || 20;
    const skip = (page - 1) * perPage;
    const where: any = {};

    if (storeId) where.store_id = storeId;

    if (query.staff_id) where.staff_id = Number(query.staff_id);
    if (query.date_from || query.date_to) {
      where.opname_date = {};
      if (query.date_from) where.opname_date.gte = new Date(query.date_from);
      if (query.date_to) where.opname_date.lte = new Date(query.date_to);
    }

    const [rows, count] = await Promise.all([
      this.prisma.stock_opname.findMany({
        where, skip, take: perPage,
        orderBy: { opname_date: 'desc' },
        include: {
          staff: { select: { id: true, name: true } },
          items: { include: { topping: { select: { id: true, name: true } } } },
        },
      }),
      this.prisma.stock_opname.count({ where }),
    ]);

    return {
      content: rows,
      meta: { total: count, per_page: perPage, current_page: page, last_page: Math.ceil(count / perPage) || 1 },
      message: 'Data stok opname berhasil dimuat',
    };
  }
}
