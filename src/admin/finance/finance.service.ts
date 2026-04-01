import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateFinanceDto, UpdateFinanceDto } from './finance.dto';

@Injectable()
export class FinanceService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: {
    page?: number;
    per_page?: number;
    search?: string;
    type?: string;
    wallet?: string;
    category?: string;
    date_from?: string;
    date_to?: string;
  }, storeId: number | null = null) {
    const page = Number(query.page) || 1;
    const perPage = Number(query.per_page) || 20;
    const skip = (page - 1) * perPage;
    const where: any = { deleted_at: null };

    if (storeId) where.store_id = storeId;

    if (query.search) {
      where.description = { contains: query.search };
    }
    if (query.type) where.type = query.type;
    if (query.wallet) where.wallet = query.wallet;
    if (query.category) where.category = query.category;

    if (query.date_from || query.date_to) {
      where.transaction_date = {};
      if (query.date_from) where.transaction_date.gte = new Date(query.date_from);
      if (query.date_to) where.transaction_date.lte = new Date(query.date_to);
    }

    const [rows, count] = await Promise.all([
      this.prisma.finance_transactions.findMany({
        where,
        skip,
        take: perPage,
        orderBy: [{ transaction_date: 'desc' }, { created_at: 'desc' }],
      }),
      this.prisma.finance_transactions.count({ where }),
    ]);

    return {
      content: rows,
      meta: {
        total: count,
        per_page: perPage,
        current_page: page,
        last_page: Math.ceil(count / perPage) || 1,
      },
      message: 'Data keuangan berhasil dimuat',
    };
  }

  async getSummary(storeId: number | null = null) {
    const where: any = { deleted_at: null };

    if (storeId) where.store_id = storeId;

    const transactions = await this.prisma.finance_transactions.findMany({
      where,
      select: { type: true, wallet: true, amount: true },
    });

    const wallets = { CASH: 0, BANK: 0, QRIS: 0 };
    let totalIncome = 0;
    let totalExpense = 0;

    for (const tx of transactions) {
      const sign = tx.type === 'INCOME' ? 1 : -1;
      wallets[tx.wallet] += tx.amount * sign;
      if (tx.type === 'INCOME') totalIncome += tx.amount;
      else totalExpense += tx.amount;
    }

    return {
      content: {
        saldo_cash: wallets.CASH,
        saldo_bank: wallets.BANK,
        saldo_qris: wallets.QRIS,
        saldo_total: wallets.CASH + wallets.BANK + wallets.QRIS,
        total_income: totalIncome,
        total_expense: totalExpense,
      },
      message: 'Ringkasan saldo berhasil dimuat',
    };
  }

  async getCategories(storeId: number | null = null) {
    const where: any = { deleted_at: null, category: { not: null } };
    if (storeId) where.store_id = storeId;

    const rows = await this.prisma.finance_transactions.findMany({
      where,
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    });
    return {
      content: rows.map((r) => r.category).filter(Boolean),
      message: 'Kategori berhasil dimuat',
    };
  }

  async create(dto: CreateFinanceDto, storeId: number) {
    const today = new Date()
      .toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
    const row = await this.prisma.finance_transactions.create({
      data: {
        store_id: storeId,
        type: dto.type as any,
        wallet: dto.wallet as any,
        amount: dto.amount,
        description: dto.description,
        category: dto.category || null,
        transaction_date: new Date(dto.transaction_date || today),
        notes: dto.notes || null,
      },
    });
    return { content: row, message: 'Transaksi berhasil ditambahkan' };
  }

  async update(id: number, dto: UpdateFinanceDto) {
    const existing = await this.prisma.finance_transactions.findFirst({
      where: { id, deleted_at: null },
    });
    if (!existing) throw new NotFoundException('Transaksi tidak ditemukan');

    const data: any = {};
    if (dto.type !== undefined) data.type = dto.type;
    if (dto.wallet !== undefined) data.wallet = dto.wallet;
    if (dto.amount !== undefined) data.amount = dto.amount;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.category !== undefined) data.category = dto.category || null;
    if (dto.transaction_date !== undefined)
      data.transaction_date = new Date(dto.transaction_date);
    if (dto.notes !== undefined) data.notes = dto.notes || null;

    const row = await this.prisma.finance_transactions.update({
      where: { id },
      data,
    });
    return { content: row, message: 'Transaksi berhasil diperbarui' };
  }

  async delete(id: number) {
    const existing = await this.prisma.finance_transactions.findFirst({
      where: { id, deleted_at: null },
    });
    if (!existing) throw new NotFoundException('Transaksi tidak ditemukan');

    await this.prisma.finance_transactions.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
    return { message: 'Transaksi berhasil dihapus' };
  }
}
