import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStatistics(dateFrom?: string, dateTo?: string, storeId?: number | null) {
    const where: any = { deleted_at: null };
    if (storeId) where.store_id = storeId;

    if (dateFrom || dateTo) {
      where.created_at = {};
      if (dateFrom) where.created_at.gte = new Date(dateFrom + 'T00:00:00+07:00');
      if (dateTo) where.created_at.lte = new Date(dateTo + 'T23:59:59.999+07:00');
    }

    const [totalOrders, totalRevenue, ordersByPayment, ordersBySize, todayOrders] =
      await Promise.all([
        this.prisma.orders.count({ where }),
        this.prisma.orders.aggregate({
          where,
          _sum: { total_price: true },
        }),
        this.prisma.orders.groupBy({
          by: ['payment_method'],
          where,
          _count: true,
          _sum: { total_price: true },
        }),
        this.prisma.order_items.groupBy({
          by: ['menu_size_key'],
          _count: true,
        }),
        this.prisma.orders.count({
          where: {
            ...where,
            created_at: (() => {
              const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
              return { gte: new Date(today + 'T00:00:00+07:00'), lte: new Date(today + 'T23:59:59.999+07:00') };
            })(),
          },
        }),
      ]);

    return {
      content: {
        total_orders: totalOrders,
        total_revenue: totalRevenue._sum.total_price || 0,
        today_orders: todayOrders,
        orders_by_payment: ordersByPayment,
        orders_by_size: ordersBySize.map((s) => ({ size: s.menu_size_key, _count: s._count })),
      },
      message: 'Statistik berhasil dimuat',
    };
  }

  async getStaffList(storeId?: number | null) {
    const staffWhere: any = { role: 'STAFF', deleted_at: null };
    if (storeId) staffWhere.store_id = storeId;
    const staff = await this.prisma.users.findMany({
      where: staffWhere,
      select: {
        id: true,
        name: true,
        email: true,
        is_active: true,
        created_at: true,
        _count: { select: { orders: true } },
      },
      orderBy: { name: 'asc' },
    });

    return { content: staff, message: 'Data staff berhasil dimuat' };
  }

  async getReports(period: string, dateFrom?: string, dateTo?: string, storeId?: number | null) {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = new Date(now);
    endDate.setHours(23, 59, 59, 999);

    if (dateFrom && dateTo) {
      startDate = new Date(dateFrom);
      endDate = new Date(dateTo);
      endDate.setHours(23, 59, 59, 999);
    } else {
      switch (period) {
        case 'today':
          startDate = new Date(now);
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'yesterday':
          startDate = new Date(now);
          startDate.setDate(startDate.getDate() - 1);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(startDate);
          endDate.setHours(23, 59, 59, 999);
          break;
        case 'this_week':
          startDate = new Date(now);
          startDate.setDate(startDate.getDate() - startDate.getDay());
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'this_month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'last_month':
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }
    }

    const orderWhere: any = {
      deleted_at: null,
      created_at: { gte: startDate, lte: endDate },
    };
    if (storeId) orderWhere.store_id = storeId;

    // Previous period for comparison
    const periodLength = endDate.getTime() - startDate.getTime();
    const prevStart = new Date(startDate.getTime() - periodLength);
    const prevEnd = new Date(startDate.getTime() - 1);
    const prevWhere: any = {
      deleted_at: null,
      created_at: { gte: prevStart, lte: prevEnd },
    };
    if (storeId) prevWhere.store_id = storeId;

    const [
      totalOrders,
      totalRevenue,
      avgOrder,
      prevTotalOrders,
      prevTotalRevenue,
      ordersByPayment,
      ordersBySize,
      topToppings,
      topBumbu,
      dailySales,
      totalStockCost,
      totalExpenses,
      itemsSoldBySize,
      allMenuSizes,
    ] = await Promise.all([
      // Current period
      this.prisma.orders.count({ where: orderWhere }),
      this.prisma.orders.aggregate({ where: orderWhere, _sum: { total_price: true } }),
      this.prisma.orders.aggregate({ where: orderWhere, _avg: { total_price: true } }),

      // Previous period comparison
      this.prisma.orders.count({ where: prevWhere }),
      this.prisma.orders.aggregate({ where: prevWhere, _sum: { total_price: true } }),

      // Breakdown by payment
      this.prisma.orders.groupBy({
        by: ['payment_method'],
        where: orderWhere,
        _count: true,
        _sum: { total_price: true },
      }),

      // Breakdown by menu size
      this.prisma.order_items.groupBy({
        by: ['menu_size_key'],
        where: {
          order: orderWhere,
        },
        _count: true,
      }),

      // Top toppings
      this.prisma.order_item_toppings.groupBy({
        by: ['topping_id'],
        where: {
          order_item: { order: orderWhere },
        },
        _count: true,
        orderBy: { _count: { topping_id: 'desc' } },
        take: 10,
      }),

      // Top bumbu
      this.prisma.order_items.groupBy({
        by: ['bumbu'],
        where: { order: orderWhere },
        _count: true,
        orderBy: { _count: { bumbu: 'desc' } },
        take: 10,
      }),

      // Daily sales trend (raw query for grouping by date)
      this.prisma.$queryRawUnsafe(`
        SELECT DATE(created_at) as date, COUNT(*) as order_count, COALESCE(SUM(total_price), 0) as revenue
        FROM orders
        WHERE deleted_at IS NULL AND created_at >= ? AND created_at <= ?
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `, startDate, endDate),

      // Total stock cost in period
      this.prisma.stock_entries.aggregate({
        where: {
          deleted_at: null,
          entry_date: { gte: startDate, lte: endDate },
          ...(storeId ? { store_id: storeId } : {}),
        },
        _sum: { total_cost: true },
      }),

      // Total expenses in period
      this.prisma.expenses.aggregate({
        where: {
          deleted_at: null,
          expense_date: { gte: startDate, lte: endDate },
          ...(storeId ? { store_id: storeId } : {}),
        },
        _sum: { amount: true },
      }),

      // Items sold per menu_size_key (for HPP calc)
      this.prisma.order_items.groupBy({
        by: ['menu_size_key'],
        where: { order: orderWhere },
        _count: true,
      }),

      // All menu sizes with HPP
      this.prisma.menu_sizes.findMany({
        where: { deleted_at: null },
        select: { key: true, label: true, price: true, hpp: true },
      }),
    ]);

    // Calculate total HPP from items sold x hpp per size
    const sizeHppMap = Object.fromEntries(allMenuSizes.map((s) => [s.key, s.hpp || 0]));
    let totalHpp = 0;
    const hppBreakdown = itemsSoldBySize.map((s) => {
      const hpp = sizeHppMap[s.menu_size_key] || 0;
      const itemHpp = hpp * s._count;
      totalHpp += itemHpp;
      return { size: s.menu_size_key, count: s._count, hpp_per_item: hpp, total_hpp: itemHpp };
    });
    const toppingIds = topToppings.map((t) => t.topping_id);
    const toppingNames = toppingIds.length
      ? await this.prisma.toppings.findMany({
          where: { id: { in: toppingIds } },
          select: { id: true, name: true },
        })
      : [];
    const toppingMap = Object.fromEntries(toppingNames.map((t) => [t.id, t.name]));

    const currentRevenue = totalRevenue._sum.total_price || 0;
    const prevRevenueVal = prevTotalRevenue._sum.total_price || 0;
    const stockCost = totalStockCost._sum.total_cost || 0;
    const expenseTotal = totalExpenses._sum.amount || 0;

    return {
      content: {
        period: { start: startDate, end: endDate },
        summary: {
          total_orders: totalOrders,
          total_revenue: currentRevenue,
          avg_order_value: Math.round(avgOrder._avg.total_price || 0),
          total_hpp: totalHpp,
          gross_profit: currentRevenue - totalHpp,
          gross_margin: currentRevenue > 0 ? Math.round(((currentRevenue - totalHpp) / currentRevenue) * 100) : 0,
          total_stock_cost: stockCost,
          total_expenses: expenseTotal,
          net_profit: currentRevenue - totalHpp - stockCost - expenseTotal,
        },
        hpp_breakdown: hppBreakdown,
        comparison: {
          prev_orders: prevTotalOrders,
          prev_revenue: prevRevenueVal,
          orders_change: prevTotalOrders > 0
            ? Math.round(((totalOrders - prevTotalOrders) / prevTotalOrders) * 100)
            : totalOrders > 0 ? 100 : 0,
          revenue_change: prevRevenueVal > 0
            ? Math.round(((currentRevenue - prevRevenueVal) / prevRevenueVal) * 100)
            : currentRevenue > 0 ? 100 : 0,
        },
        orders_by_payment: ordersByPayment,
        orders_by_size: ordersBySize.map((s) => ({ size: s.menu_size_key, count: s._count })),
        top_toppings: topToppings.map((t) => ({
          topping_id: t.topping_id,
          name: toppingMap[t.topping_id] || `Topping #${t.topping_id}`,
          count: t._count,
        })),
        top_bumbu: topBumbu.map((b) => ({
          name: b.bumbu,
          count: b._count,
        })),
        daily_sales: (dailySales as any[]).map((d) => ({
          date: d.date,
          order_count: Number(d.order_count),
          revenue: Number(d.revenue),
        })),
      },
      message: 'Laporan berhasil dimuat',
    };
  }

  async getDailyRecap(date: string, storeId?: number | null) {
    const startOfDay = new Date(date + 'T00:00:00+07:00');
    const endOfDay = new Date(date + 'T23:59:59.999+07:00');

    const orderWhere: any = {
      deleted_at: null,
      created_at: { gte: startOfDay, lte: endOfDay },
    };
    if (storeId) orderWhere.store_id = storeId;

    const [
      totalOrders,
      totalRevenue,
      ordersByPayment,
      ordersBySize,
      expenses,
      financeExpenses,
      financeIncome,
      staffOrders,
    ] = await Promise.all([
      // Total orders count
      this.prisma.orders.count({ where: orderWhere }),

      // Total revenue
      this.prisma.orders.aggregate({
        where: orderWhere,
        _sum: { total_price: true },
      }),

      // Orders by payment method
      this.prisma.orders.groupBy({
        by: ['payment_method'],
        where: orderWhere,
        _count: true,
        _sum: { total_price: true },
      }),

      // Orders by menu size
      this.prisma.order_items.groupBy({
        by: ['menu_size_key'],
        where: { order: orderWhere },
        _count: true,
        _sum: { price: true },
      }),

      // Expenses from expenses table
      this.prisma.expenses.findMany({
        where: {
          deleted_at: null,
          expense_date: { gte: startOfDay, lte: endOfDay },
          ...(storeId ? { store_id: storeId } : {}),
        },
        include: { category: { select: { name: true } } },
      }),

      // Finance transactions (EXPENSE)
      this.prisma.finance_transactions.findMany({
        where: {
          deleted_at: null,
          type: 'EXPENSE',
          transaction_date: { gte: startOfDay, lte: endOfDay },
          ...(storeId ? { store_id: storeId } : {}),
        },
      }),

      // Finance transactions (INCOME)
      this.prisma.finance_transactions.findMany({
        where: {
          deleted_at: null,
          type: 'INCOME',
          transaction_date: { gte: startOfDay, lte: endOfDay },
          ...(storeId ? { store_id: storeId } : {}),
        },
      }),

      // Staff orders for the day
      this.prisma.orders.groupBy({
        by: ['staff_id'],
        where: orderWhere,
        _count: true,
      }),
    ]);

    // Get staff names
    const staffIds = staffOrders.map((s) => s.staff_id).filter(Boolean);
    const staffUsers = staffIds.length
      ? await this.prisma.users.findMany({
          where: { id: { in: staffIds } },
          select: { id: true, name: true },
        })
      : [];
    const staffMap = Object.fromEntries(staffUsers.map((u) => [u.id, u.name]));

    // Build expenses list from both tables
    const expenseItems = [
      ...expenses.map((e) => ({
        description: e.description || '-',
        amount: e.amount,
        category: e.category?.name || '-',
        source: 'expenses',
      })),
      ...financeExpenses.map((f) => ({
        description: f.description || '-',
        amount: f.amount,
        category: f.category || '-',
        source: 'finance',
      })),
    ];

    const expensesTotal = expenseItems.reduce((sum, e) => sum + (e.amount || 0), 0);

    // Finance income/expense by wallet
    const incomeTotal = financeIncome.reduce((sum, f) => sum + (f.amount || 0), 0);
    const finExpenseTotal = financeExpenses.reduce((sum, f) => sum + (f.amount || 0), 0);

    const byWallet: Record<string, number> = {};
    for (const f of financeIncome) {
      byWallet[f.wallet] = (byWallet[f.wallet] || 0) + (f.amount || 0);
    }
    for (const f of financeExpenses) {
      byWallet[f.wallet] = (byWallet[f.wallet] || 0) - (f.amount || 0);
    }

    const revenue = totalRevenue._sum.total_price || 0;

    return {
      content: {
        date,
        orders: {
          total_count: totalOrders,
          total_revenue: revenue,
          by_payment: ordersByPayment.map((p) => ({
            method: p.payment_method,
            count: p._count,
            total: p._sum?.total_price || 0,
          })),
          by_size: ordersBySize.map((s) => ({
            size: s.menu_size_key,
            count: s._count,
            total: s._sum?.price || 0,
          })),
        },
        expenses: {
          total: expensesTotal,
          items: expenseItems,
        },
        finance: {
          income_total: incomeTotal,
          expense_total: finExpenseTotal,
          by_wallet: byWallet,
        },
        staff_on_duty: staffOrders.map((s) => ({
          name: staffMap[s.staff_id] || `Staff #${s.staff_id}`,
          orders_count: s._count,
        })),
        net_summary: {
          revenue,
          total_expenses: expensesTotal,
          net_profit: revenue - expensesTotal,
        },
      },
      message: 'Rekap harian berhasil dimuat',
    };
  }

  async getAttendance(dateFrom?: string, dateTo?: string, staffId?: number, storeId?: number | null) {
    const where: any = {};
    if (storeId) where.store_id = storeId;
    if (staffId) where.staff_id = staffId;
    if (dateFrom || dateTo) {
      where.login_date = {};
      if (dateFrom) where.login_date.gte = new Date(dateFrom);
      if (dateTo) where.login_date.lte = new Date(dateTo);
    }

    const rows = await this.prisma.staff_attendance.findMany({
      where,
      orderBy: { login_date: 'desc' },
      include: { staff: { select: { id: true, name: true, email: true } } },
    });

    return { content: rows, message: 'Data absensi berhasil dimuat' };
  }
}
