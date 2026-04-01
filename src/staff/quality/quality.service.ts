import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { SaveQualityCheckDto } from './quality.dto';

@Injectable()
export class QualityService {
  constructor(private prisma: PrismaService) {}

  async getCheckByDate(staffId: number, checkDate: string) {
    const date = new Date(checkDate);

    const existing = await this.prisma.quality_checks.findFirst({
      where: {
        staff_id: staffId,
        check_date: date,
      },
      include: {
        items: {
          include: { topping: { select: { id: true, name: true } } },
        },
      },
    });

    const toppings = await this.prisma.toppings.findMany({
      where: { is_active: true, deleted_at: null },
      orderBy: { name: 'asc' },
    });

    const itemMap = new Map<number, { status: string; notes: string | null }>();
    if (existing) {
      for (const item of existing.items) {
        itemMap.set(item.topping_id, { status: item.status, notes: item.notes });
      }
    }

    const items = toppings.map((t) => {
      const checked = itemMap.get(t.id);
      return {
        topping_id: t.id,
        topping_name: t.name,
        status: checked?.status || 'GOOD',
        notes: checked?.notes || null,
      };
    });

    const goodCount = items.filter((i) => i.status === 'GOOD').length;
    const warningCount = items.filter((i) => i.status === 'WARNING').length;
    const badCount = items.filter((i) => i.status === 'BAD').length;

    return {
      content: {
        check_date: checkDate,
        quality_check_id: existing?.id || null,
        overall_notes: existing?.notes || null,
        items,
        summary: { good: goodCount, warning: warningCount, bad: badCount, total: items.length },
      },
      message: 'Quality check berhasil dimuat',
    };
  }

  async saveCheck(staffId: number, dto: SaveQualityCheckDto, storeId: number) {
    const date = new Date(dto.check_date);

    let check = await this.prisma.quality_checks.findFirst({
      where: { staff_id: staffId, check_date: date },
    });

    if (check) {
      await this.prisma.quality_check_items.deleteMany({ where: { quality_check_id: check.id } });
      await this.prisma.quality_checks.update({
        where: { id: check.id },
        data: { notes: dto.notes || null },
      });
    } else {
      check = await this.prisma.quality_checks.create({
        data: {
          staff_id: staffId,
          check_date: date,
          notes: dto.notes || null,
          store_id: storeId,
        },
      });
    }

    if (dto.items.length > 0) {
      await this.prisma.quality_check_items.createMany({
        data: dto.items.map((item) => ({
          quality_check_id: check.id,
          topping_id: item.topping_id,
          status: item.status,
          notes: item.notes || null,
        })),
      });
    }

    return this.getCheckByDate(staffId, dto.check_date);
  }

  // Admin: view all quality checks
  async getChecksByDate(checkDate: string, storeId: number | null = null) {
    const date = new Date(checkDate);
    const where: any = { check_date: date };
    if (storeId) where.store_id = storeId;

    const checks = await this.prisma.quality_checks.findMany({
      where,
      include: {
        staff: { select: { id: true, name: true } },
        items: {
          include: { topping: { select: { id: true, name: true } } },
        },
      },
    });

    return {
      content: checks.map((c) => ({
        id: c.id,
        staff: c.staff,
        check_date: c.check_date,
        notes: c.notes,
        summary: {
          good: c.items.filter((i) => i.status === 'GOOD').length,
          warning: c.items.filter((i) => i.status === 'WARNING').length,
          bad: c.items.filter((i) => i.status === 'BAD').length,
          total: c.items.length,
        },
        items: c.items.map((i) => ({
          topping: i.topping.name,
          status: i.status,
          notes: i.notes,
        })),
      })),
      message: 'Data quality check berhasil dimuat',
    };
  }

  // Admin: history for a specific date range
  async getHistory(query: { date_from?: string; date_to?: string; staff_id?: number }, storeId: number | null = null) {
    const where: any = {};

    if (storeId) where.store_id = storeId;

    if (query.date_from || query.date_to) {
      where.check_date = {};
      if (query.date_from) where.check_date.gte = new Date(query.date_from);
      if (query.date_to) where.check_date.lte = new Date(query.date_to);
    }
    if (query.staff_id) where.staff_id = Number(query.staff_id);

    const checks = await this.prisma.quality_checks.findMany({
      where,
      orderBy: { check_date: 'desc' },
      take: 50,
      include: {
        staff: { select: { id: true, name: true } },
        items: true,
      },
    });

    return {
      content: checks.map((c) => ({
        id: c.id,
        staff: c.staff,
        check_date: c.check_date,
        notes: c.notes,
        summary: {
          good: c.items.filter((i) => i.status === 'GOOD').length,
          warning: c.items.filter((i) => i.status === 'WARNING').length,
          bad: c.items.filter((i) => i.status === 'BAD').length,
          total: c.items.length,
        },
      })),
      message: 'Riwayat quality check berhasil dimuat',
    };
  }
}
