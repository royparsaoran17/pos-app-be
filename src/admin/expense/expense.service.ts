import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import {
  CreateExpenseCategoryDto, UpdateExpenseCategoryDto,
  CreateExpenseDto, UpdateExpenseDto,
} from './expense.dto';

@Injectable()
export class ExpenseService {
  constructor(private prisma: PrismaService) {}

  // ============ CATEGORIES ============

  async findAllCategories(query: { page?: number; per_page?: number; search?: string }) {
    const page = Number(query.page) || 1;
    const perPage = Number(query.per_page) || 20;
    const skip = (page - 1) * perPage;
    const where: any = { deleted_at: null };

    if (query.search) {
      where.name = { contains: query.search };
    }

    const [rows, count] = await Promise.all([
      this.prisma.expense_categories.findMany({ where, skip, take: perPage, orderBy: { name: 'asc' } }),
      this.prisma.expense_categories.count({ where }),
    ]);

    return {
      content: rows,
      meta: { total: count, per_page: perPage, current_page: page, last_page: Math.ceil(count / perPage) || 1 },
      message: 'Kategori pengeluaran berhasil dimuat',
    };
  }

  async findOneCategory(id: number) {
    const row = await this.prisma.expense_categories.findFirst({ where: { id, deleted_at: null } });
    if (!row) throw new NotFoundException('Kategori tidak ditemukan');
    return { content: row, message: 'Detail kategori berhasil dimuat' };
  }

  async createCategory(dto: CreateExpenseCategoryDto) {
    const row = await this.prisma.expense_categories.create({ data: { name: dto.name } });
    return { content: row, message: 'Kategori berhasil ditambahkan' };
  }

  async updateCategory(id: number, dto: UpdateExpenseCategoryDto) {
    await this.findOneCategory(id);
    const row = await this.prisma.expense_categories.update({ where: { id }, data: dto });
    return { content: row, message: 'Kategori berhasil diperbarui' };
  }

  async deleteCategory(id: number) {
    await this.findOneCategory(id);
    await this.prisma.expense_categories.update({ where: { id }, data: { deleted_at: new Date() } });
    return { message: 'Kategori berhasil dihapus' };
  }

  // ============ EXPENSES ============

  async findAll(query: { page?: number; per_page?: number; search?: string; category_id?: number; date_from?: string; date_to?: string }, storeId: number | null) {
    const page = Number(query.page) || 1;
    const perPage = Number(query.per_page) || 20;
    const skip = (page - 1) * perPage;
    const where: any = { deleted_at: null };

    if (storeId) where.store_id = storeId;

    if (query.search) {
      where.description = { contains: query.search };
    }

    if (query.category_id) {
      where.category_id = Number(query.category_id);
    }

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
      this.prisma.expenses.findMany({
        where,
        skip,
        take: perPage,
        orderBy: { expense_date: 'desc' },
        include: { category: { select: { id: true, name: true } } },
      }),
      this.prisma.expenses.count({ where }),
      this.prisma.expenses.aggregate({ where, _sum: { amount: true } }),
    ]);

    return {
      content: rows,
      meta: {
        total: count,
        per_page: perPage,
        current_page: page,
        last_page: Math.ceil(count / perPage) || 1,
        total_amount: totalAmount._sum.amount || 0,
      },
      message: 'Data pengeluaran berhasil dimuat',
    };
  }

  async findOne(id: number) {
    const row = await this.prisma.expenses.findFirst({
      where: { id, deleted_at: null },
      include: { category: { select: { id: true, name: true } } },
    });
    if (!row) throw new NotFoundException('Pengeluaran tidak ditemukan');
    return { content: row, message: 'Detail pengeluaran berhasil dimuat' };
  }

  async create(dto: CreateExpenseDto, storeId: number) {
    const row = await this.prisma.expenses.create({
      data: {
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

  async update(id: number, dto: UpdateExpenseDto) {
    await this.findOne(id);
    const data: any = { ...dto };
    if (dto.expense_date) data.expense_date = new Date(dto.expense_date);
    const row = await this.prisma.expenses.update({ where: { id }, data });
    return { content: row, message: 'Pengeluaran berhasil diperbarui' };
  }

  async delete(id: number) {
    await this.findOne(id);
    await this.prisma.expenses.update({ where: { id }, data: { deleted_at: new Date() } });
    return { message: 'Pengeluaran berhasil dihapus' };
  }
}
