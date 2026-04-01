import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreatePackagingDto } from './packaging.dto';

@Injectable()
export class PackagingService {
  constructor(private prisma: PrismaService) {}

  private getJakartaDate(): Date {
    const now = new Date();
    const jakartaOffset = 7 * 60;
    const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
    return new Date(utcMs + jakartaOffset * 60000);
  }

  async create(staffId: number, dto: CreatePackagingDto, storeId: number) {
    const jakartaDate = this.getJakartaDate();
    const packagingDate = new Date(jakartaDate.getFullYear(), jakartaDate.getMonth(), jakartaDate.getDate());

    const row = await this.prisma.stock_packaging.create({
      data: {
        store_id: storeId,
        staff_id: staffId,
        menu_size_key: dto.menu_size_key,
        quantity: dto.quantity,
        packaging_date: packagingDate,
        notes: dto.notes,
      },
    });

    return { content: row, message: 'Data packaging berhasil disimpan' };
  }

  async findByStaff(staffId: number, query: { page?: number; per_page?: number; date?: string }) {
    const page = Number(query.page) || 1;
    const perPage = Number(query.per_page) || 20;
    const skip = (page - 1) * perPage;
    const where: any = { staff_id: staffId };

    if (query.date) {
      const d = new Date(query.date);
      const nextDay = new Date(d);
      nextDay.setDate(nextDay.getDate() + 1);
      where.packaging_date = { gte: d, lt: nextDay };
    }

    const [rows, count] = await Promise.all([
      this.prisma.stock_packaging.findMany({
        where,
        skip,
        take: perPage,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.stock_packaging.count({ where }),
    ]);

    return {
      content: rows,
      meta: { total: count, per_page: perPage, current_page: page, last_page: Math.ceil(count / perPage) || 1 },
      message: 'Data packaging berhasil dimuat',
    };
  }

  async findAllAdmin(query: { page?: number; per_page?: number; staff_id?: number; date_from?: string; date_to?: string }, storeId: number | null = null) {
    const page = Number(query.page) || 1;
    const perPage = Number(query.per_page) || 20;
    const skip = (page - 1) * perPage;
    const where: any = {};

    if (storeId) where.store_id = storeId;

    if (query.staff_id) where.staff_id = Number(query.staff_id);
    if (query.date_from || query.date_to) {
      where.packaging_date = {};
      if (query.date_from) where.packaging_date.gte = new Date(query.date_from);
      if (query.date_to) where.packaging_date.lte = new Date(query.date_to);
    }

    const [rows, count] = await Promise.all([
      this.prisma.stock_packaging.findMany({
        where,
        skip,
        take: perPage,
        orderBy: { created_at: 'desc' },
        include: { staff: { select: { id: true, name: true } } },
      }),
      this.prisma.stock_packaging.count({ where }),
    ]);

    return {
      content: rows,
      meta: { total: count, per_page: perPage, current_page: page, last_page: Math.ceil(count / perPage) || 1 },
      message: 'Data packaging berhasil dimuat',
    };
  }

  async delete(id: number, staffId: number) {
    const row = await this.prisma.stock_packaging.findFirst({ where: { id, staff_id: staffId } });
    if (!row) throw new NotFoundException('Data packaging tidak ditemukan');
    await this.prisma.stock_packaging.delete({ where: { id } });
    return { message: 'Data packaging berhasil dihapus' };
  }

  async getSummaryToday(staffId: number) {
    const jakartaDate = this.getJakartaDate();
    const today = new Date(jakartaDate.getFullYear(), jakartaDate.getMonth(), jakartaDate.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const rows = await this.prisma.stock_packaging.groupBy({
      by: ['menu_size_key'],
      where: {
        staff_id: staffId,
        packaging_date: { gte: today, lt: tomorrow },
      },
      _sum: { quantity: true },
    });

    return {
      content: rows.map(r => ({ menu_size_key: r.menu_size_key, total: r._sum.quantity || 0 })),
      message: 'Ringkasan packaging hari ini',
    };
  }
}
