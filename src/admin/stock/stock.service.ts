import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateStockEntryDto, UpdateStockEntryDto } from './stock.dto';

@Injectable()
export class StockService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: { page?: number; per_page?: number; search?: string; item_type?: string; date_from?: string; date_to?: string }, storeId: number | null = null) {
    const page = Number(query.page) || 1;
    const perPage = Number(query.per_page) || 20;
    const skip = (page - 1) * perPage;
    const where: any = { deleted_at: null };

    if (storeId) where.store_id = storeId;

    if (query.search) {
      where.OR = [
        { item_name: { contains: query.search } },
        { supplier: { contains: query.search } },
      ];
    }

    if (query.item_type) {
      where.item_type = query.item_type;
    }

    if (query.date_from || query.date_to) {
      where.entry_date = {};
      if (query.date_from) where.entry_date.gte = new Date(query.date_from);
      if (query.date_to) {
        const dt = new Date(query.date_to);
        dt.setHours(23, 59, 59, 999);
        where.entry_date.lte = dt;
      }
    }

    const [rows, count, totalCost] = await Promise.all([
      this.prisma.stock_entries.findMany({
        where,
        skip,
        take: perPage,
        orderBy: { entry_date: 'desc' },
        include: { topping: { select: { id: true, name: true } }, bumbu: { select: { id: true, name: true } } },
      }),
      this.prisma.stock_entries.count({ where }),
      this.prisma.stock_entries.aggregate({ where, _sum: { total_cost: true } }),
    ]);

    return {
      content: rows,
      meta: {
        total: count,
        per_page: perPage,
        current_page: page,
        last_page: Math.ceil(count / perPage) || 1,
        total_cost: totalCost._sum.total_cost || 0,
      },
      message: 'Data stok berhasil dimuat',
    };
  }

  async findOne(id: number) {
    const row = await this.prisma.stock_entries.findFirst({
      where: { id, deleted_at: null },
      include: { topping: { select: { id: true, name: true } }, bumbu: { select: { id: true, name: true } } },
    });
    if (!row) throw new NotFoundException('Stok tidak ditemukan');
    return { content: row, message: 'Detail stok berhasil dimuat' };
  }

  async create(dto: CreateStockEntryDto, storeId: number) {
    const totalCost = Math.round(dto.quantity * dto.purchase_price);
    const row = await this.prisma.stock_entries.create({
      data: {
        store_id: storeId,
        item_type: dto.item_type,
        item_name: dto.item_name,
        topping_id: dto.topping_id || null,
        bumbu_id: dto.bumbu_id || null,
        quantity: dto.quantity,
        unit: dto.unit,
        purchase_price: dto.purchase_price,
        total_cost: totalCost,
        supplier: dto.supplier || null,
        notes: dto.notes || null,
        entry_date: dto.entry_date ? new Date(dto.entry_date) : new Date(),
      },
    });
    return { content: row, message: 'Stok berhasil ditambahkan' };
  }

  async update(id: number, dto: UpdateStockEntryDto) {
    await this.findOne(id);
    const data: any = { ...dto };
    if (dto.entry_date) data.entry_date = new Date(dto.entry_date);
    if (dto.quantity !== undefined && dto.purchase_price !== undefined) {
      data.total_cost = Math.round(dto.quantity * dto.purchase_price);
    } else if (dto.quantity !== undefined || dto.purchase_price !== undefined) {
      const existing = await this.prisma.stock_entries.findUnique({ where: { id } });
      const qty = dto.quantity ?? existing.quantity;
      const price = dto.purchase_price ?? existing.purchase_price;
      data.total_cost = Math.round(qty * price);
    }
    const row = await this.prisma.stock_entries.update({ where: { id }, data });
    return { content: row, message: 'Stok berhasil diperbarui' };
  }

  async delete(id: number) {
    await this.findOne(id);
    await this.prisma.stock_entries.update({ where: { id }, data: { deleted_at: new Date() } });
    return { message: 'Stok berhasil dihapus' };
  }
}
