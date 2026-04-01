import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class StaffExpenseService {
  constructor(private prisma: PrismaService) {}

  async getCategories() {
    const categories = await this.prisma.expense_categories.findMany({
      where: { deleted_at: null, is_active: true },
      orderBy: { name: 'asc' },
    });
    return { content: categories, message: 'Kategori berhasil dimuat' };
  }

  async findAll(staffId: number, query: { page?: number; per_page?: number; date_from?: string; date_to?: string; category_id?: number }) {
    const page = Number(query.page) || 1;
    const perPage = Number(query.per_page) || 20;
    const skip = (page - 1) * perPage;
    const where: any = { deleted_at: null, staff_id: staffId };

    if (query.category_id) where.category_id = Number(query.category_id);
    if (query.date_from || query.date_to) {
      where.expense_date = {};
      if (query.date_from) where.expense_date.gte = new Date(query.date_from);
      if (query.date_to) {
        const dt = new Date(query.date_to);
        dt.setHours(23, 59, 59, 999);
        where.expense_date.lte = dt;
      }
    }

    const [rows, count, totalAmount] = await Promise.all([
      this.prisma.staff_expenses.findMany({
        where, skip, take: perPage,
        orderBy: { expense_date: 'desc' },
        include: { category: { select: { id: true, name: true } } },
      }),
      this.prisma.staff_expenses.count({ where }),
      this.prisma.staff_expenses.aggregate({ where, _sum: { amount: true } }),
    ]);

    return {
      content: rows,
      meta: { total: count, per_page: perPage, current_page: page, last_page: Math.ceil(count / perPage) || 1, total_amount: totalAmount._sum.amount || 0 },
      message: 'Data pengeluaran berhasil dimuat',
    };
  }

  async create(staffId: number, dto: any, storeId: number) {
    const row = await this.prisma.staff_expenses.create({
      data: {
        staff_id: staffId,
        store_id: storeId,
        category_id: dto.category_id,
        description: dto.description,
        amount: dto.amount,
        expense_date: dto.expense_date ? new Date(dto.expense_date) : new Date(),
        notes: dto.notes || null,
      },
    });
    return { content: row, message: 'Pengeluaran berhasil ditambahkan' };
  }

  async update(staffId: number, id: number, dto: any) {
    const row = await this.prisma.staff_expenses.findFirst({ where: { id, staff_id: staffId, deleted_at: null } });
    if (!row) throw new NotFoundException('Pengeluaran tidak ditemukan');
    const data: any = { ...dto };
    if (dto.expense_date) data.expense_date = new Date(dto.expense_date);
    const updated = await this.prisma.staff_expenses.update({ where: { id }, data });
    return { content: updated, message: 'Pengeluaran berhasil diperbarui' };
  }

  async delete(staffId: number, id: number) {
    const row = await this.prisma.staff_expenses.findFirst({ where: { id, staff_id: staffId, deleted_at: null } });
    if (!row) throw new NotFoundException('Pengeluaran tidak ditemukan');
    await this.prisma.staff_expenses.update({ where: { id }, data: { deleted_at: new Date() } });
    return { message: 'Pengeluaran berhasil dihapus' };
  }

  // Admin: view all staff expenses
  async findAllAdmin(query: { page?: number; per_page?: number; date_from?: string; date_to?: string; staff_id?: number; category_id?: number }, storeId: number | null) {
    const page = Number(query.page) || 1;
    const perPage = Number(query.per_page) || 20;
    const skip = (page - 1) * perPage;
    const where: any = { deleted_at: null };

    if (storeId) where.store_id = storeId;

    if (query.staff_id) where.staff_id = Number(query.staff_id);
    if (query.category_id) where.category_id = Number(query.category_id);
    if (query.date_from || query.date_to) {
      where.expense_date = {};
      if (query.date_from) where.expense_date.gte = new Date(query.date_from);
      if (query.date_to) {
        const dt = new Date(query.date_to);
        dt.setHours(23, 59, 59, 999);
        where.expense_date.lte = dt;
      }
    }

    const [rows, count, totalAmount] = await Promise.all([
      this.prisma.staff_expenses.findMany({
        where, skip, take: perPage,
        orderBy: { expense_date: 'desc' },
        include: {
          category: { select: { id: true, name: true } },
          staff: { select: { id: true, name: true } },
        },
      }),
      this.prisma.staff_expenses.count({ where }),
      this.prisma.staff_expenses.aggregate({ where, _sum: { amount: true } }),
    ]);

    return {
      content: rows,
      meta: { total: count, per_page: perPage, current_page: page, last_page: Math.ceil(count / perPage) || 1, total_amount: totalAmount._sum.amount || 0 },
      message: 'Data pengeluaran staff berhasil dimuat',
    };
  }
}
