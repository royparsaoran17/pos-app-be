import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { OpenShiftDto, CloseShiftDto } from './shift.dto';

@Injectable()
export class ShiftService {
  constructor(private prisma: PrismaService) {}

  private getJakartaDate(): Date {
    const now = new Date();
    const jakartaOffset = 7 * 60;
    const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
    return new Date(utcMs + jakartaOffset * 60000);
  }

  async getActiveShift(staffId: number) {
    const shift = await this.prisma.shifts.findFirst({
      where: { staff_id: staffId, status: 'OPEN' },
      include: { staff: { select: { id: true, name: true } } },
    });
    return { content: shift, message: shift ? 'Shift aktif ditemukan' : 'Tidak ada shift aktif' };
  }

  async openShift(staffId: number, dto: OpenShiftDto, storeId: number) {
    const existing = await this.prisma.shifts.findFirst({
      where: { staff_id: staffId, status: 'OPEN' },
    });
    if (existing) throw new BadRequestException('Masih ada shift yang belum ditutup');

    const jakartaDate = this.getJakartaDate();
    const shiftDate = new Date(jakartaDate.getFullYear(), jakartaDate.getMonth(), jakartaDate.getDate());

    const shift = await this.prisma.shifts.create({
      data: {
        staff_id: staffId,
        store_id: storeId,
        shift_date: shiftDate,
        opening_cash: dto.opening_cash,
        notes: dto.notes,
      },
    });

    return { content: shift, message: 'Shift berhasil dibuka' };
  }

  async closeShift(staffId: number, dto: CloseShiftDto) {
    const shift = await this.prisma.shifts.findFirst({
      where: { staff_id: staffId, status: 'OPEN' },
    });
    if (!shift) throw new NotFoundException('Tidak ada shift aktif untuk ditutup');

    const shiftOrderWhere = {
      staff_id: staffId,
      deleted_at: null,
      created_at: { gte: shift.open_time },
    };

    const [orderCount, totalRevenue, cashRevenue] = await Promise.all([
      this.prisma.orders.count({
        where: shiftOrderWhere,
      }),
      this.prisma.orders.aggregate({
        where: shiftOrderWhere,
        _sum: { total_price: true },
      }),
      this.prisma.orders.aggregate({
        where: {
          ...shiftOrderWhere,
          payment_method: 'CASH',
        },
        _sum: { total_price: true },
      }),
    ]);

    const totalRevenueAmount = totalRevenue._sum.total_price || 0;
    const cashRevenueAmount = cashRevenue._sum.total_price || 0;
    const expectedCash = shift.opening_cash + cashRevenueAmount;
    const cashDifference = dto.closing_cash - expectedCash;

    const updated = await this.prisma.shifts.update({
      where: { id: shift.id },
      data: {
        close_time: new Date(),
        closing_cash: dto.closing_cash,
        expected_cash: expectedCash,
        cash_difference: cashDifference,
        total_orders: orderCount,
        total_revenue: totalRevenueAmount,
        status: 'CLOSED',
        notes: dto.notes || shift.notes,
      },
    });

    return { content: updated, message: 'Shift berhasil ditutup' };
  }

  async getShiftHistory(staffId: number, query: { page?: number; per_page?: number }) {
    const page = Number(query.page) || 1;
    const perPage = Number(query.per_page) || 20;
    const skip = (page - 1) * perPage;

    const [rows, count] = await Promise.all([
      this.prisma.shifts.findMany({
        where: { staff_id: staffId },
        skip,
        take: perPage,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.shifts.count({ where: { staff_id: staffId } }),
    ]);

    return {
      content: rows,
      meta: { total: count, per_page: perPage, current_page: page, last_page: Math.ceil(count / perPage) || 1 },
      message: 'Riwayat shift berhasil dimuat',
    };
  }

  async getShiftHistoryAdmin(query: { page?: number; per_page?: number; staff_id?: number; date_from?: string; date_to?: string }, storeId: number | null) {
    const page = Number(query.page) || 1;
    const perPage = Number(query.per_page) || 20;
    const skip = (page - 1) * perPage;
    const where: any = {};

    if (storeId) where.store_id = storeId;

    if (query.staff_id) where.staff_id = Number(query.staff_id);
    if (query.date_from || query.date_to) {
      where.shift_date = {};
      if (query.date_from) where.shift_date.gte = new Date(query.date_from);
      if (query.date_to) where.shift_date.lte = new Date(query.date_to);
    }

    const [rows, count] = await Promise.all([
      this.prisma.shifts.findMany({
        where,
        skip,
        take: perPage,
        orderBy: { created_at: 'desc' },
        include: { staff: { select: { id: true, name: true, email: true } } },
      }),
      this.prisma.shifts.count({ where }),
    ]);

    return {
      content: rows,
      meta: { total: count, per_page: perPage, current_page: page, last_page: Math.ceil(count / perPage) || 1 },
      message: 'Riwayat shift berhasil dimuat',
    };
  }
}
