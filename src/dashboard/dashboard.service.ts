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

  async getToppingStock(date?: string, storeId?: number | null) {
    const targetDate = date || new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
    const startOfDay = new Date(targetDate + 'T00:00:00+07:00');
    const endOfDay = new Date(targetDate + 'T23:59:59.999+07:00');

    const orderWhere: any = { deleted_at: null, created_at: { gte: startOfDay, lte: endOfDay } };
    if (storeId) orderWhere.store_id = storeId;

    // Get all active toppings
    const toppings = await this.prisma.toppings.findMany({
      where: { deleted_at: null, is_active: true },
      orderBy: { name: 'asc' },
    });

    // Today's usage: sum gram_used grouped by topping_id
    const todayUsage = await this.prisma.order_item_toppings.groupBy({
      by: ['topping_id'],
      where: {
        order_item: { order: orderWhere },
      },
      _sum: { gram_used: true },
      _count: true,
    });
    const usageMap = new Map(todayUsage.map(u => [u.topping_id, {
      gram_used: u._sum.gram_used || 0,
      order_count: u._count,
    }]));

    // Total stock in (from stock_entries, all time for this store)
    const stockWhere: any = { deleted_at: null, item_type: 'TOPPING' as any };
    if (storeId) stockWhere.store_id = storeId;

    const stockEntries = await this.prisma.stock_entries.groupBy({
      by: ['topping_id'],
      where: stockWhere,
      _sum: { quantity: true },
    });
    const stockInMap = new Map(stockEntries.map(s => [s.topping_id, s._sum.quantity || 0]));

    // Total usage all time (sum gram_used from all orders for this store)
    const allTimeUsageWhere: any = { deleted_at: null };
    if (storeId) allTimeUsageWhere.store_id = storeId;

    const allTimeUsage = await this.prisma.order_item_toppings.groupBy({
      by: ['topping_id'],
      where: {
        order_item: { order: allTimeUsageWhere },
      },
      _sum: { gram_used: true },
    });
    const allTimeUsageMap = new Map(allTimeUsage.map(u => [u.topping_id, u._sum.gram_used || 0]));

    const result = toppings.map(t => {
      const todayData = usageMap.get(t.id) || { gram_used: 0, order_count: 0 };
      const totalStockIn = stockInMap.get(t.id) || 0;
      const totalUsed = allTimeUsageMap.get(t.id) || 0;
      // Stock in is in kg from stock_entries, convert to grams
      const stockInGram = totalStockIn * 1000;
      const currentStock = Math.round((stockInGram - totalUsed) * 10) / 10;

      return {
        topping_id: t.id,
        name: t.name,
        gram_per_portion: t.gram_per_portion,
        today_gram_used: Math.round(todayData.gram_used * 10) / 10,
        today_order_count: todayData.order_count,
        total_stock_in_kg: Math.round(totalStockIn * 100) / 100,
        total_used_gram: Math.round(totalUsed * 10) / 10,
        current_stock_gram: currentStock,
        current_stock_kg: Math.round((currentStock / 1000) * 100) / 100,
      };
    });

    return {
      content: {
        date: targetDate,
        toppings: result,
        summary: {
          total_gram_used_today: Math.round(result.reduce((s, t) => s + t.today_gram_used, 0) * 10) / 10,
          total_order_count_today: result.reduce((s, t) => s + t.today_order_count, 0),
        },
      },
      message: 'Data stok topping berhasil dimuat',
    };
  }

  async getAnalytics(dateFrom?: string, dateTo?: string, storeId?: number | null) {
    const now = new Date();
    const startDate = dateFrom
      ? new Date(dateFrom + 'T00:00:00+07:00')
      : new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = dateTo
      ? new Date(dateTo + 'T23:59:59.999+07:00')
      : new Date(now);

    const orderWhere: any = {
      deleted_at: null,
      created_at: { gte: startDate, lte: endDate },
    };
    if (storeId) orderWhere.store_id = storeId;

    // 1. Monthly trend
    const monthlyTrend = await this.prisma.$queryRawUnsafe(`
      SELECT
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as order_count,
        COALESCE(SUM(total_price), 0) as revenue,
        ROUND(AVG(total_price), 0) as avg_order_value
      FROM orders
      WHERE deleted_at IS NULL
        AND created_at >= ? AND created_at <= ?
        ${storeId ? 'AND store_id = ?' : ''}
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month ASC
    `, startDate, endDate, ...(storeId ? [storeId] : []));

    // 2. Peak hours
    const peakHours = await this.prisma.$queryRawUnsafe(`
      SELECT
        HOUR(CONVERT_TZ(created_at, '+00:00', '+07:00')) as hour,
        COUNT(*) as order_count,
        COALESCE(SUM(total_price), 0) as revenue
      FROM orders
      WHERE deleted_at IS NULL
        AND created_at >= ? AND created_at <= ?
        ${storeId ? 'AND store_id = ?' : ''}
      GROUP BY HOUR(CONVERT_TZ(created_at, '+00:00', '+07:00'))
      ORDER BY hour ASC
    `, startDate, endDate, ...(storeId ? [storeId] : []));

    // 3. Day of week performance
    const dayOfWeek = await this.prisma.$queryRawUnsafe(`
      SELECT
        DAYNAME(CONVERT_TZ(created_at, '+00:00', '+07:00')) as day_name,
        DAYOFWEEK(CONVERT_TZ(created_at, '+00:00', '+07:00')) as day_num,
        COUNT(*) as order_count,
        COALESCE(SUM(total_price), 0) as revenue,
        COUNT(DISTINCT DATE(CONVERT_TZ(created_at, '+00:00', '+07:00'))) as num_days
      FROM orders
      WHERE deleted_at IS NULL
        AND created_at >= ? AND created_at <= ?
        ${storeId ? 'AND store_id = ?' : ''}
      GROUP BY day_name, day_num
      ORDER BY day_num ASC
    `, startDate, endDate, ...(storeId ? [storeId] : []));

    // 4. Acquisition channels
    const channels = await this.prisma.$queryRawUnsafe(`
      SELECT
        COALESCE(acquisition_channel, 'Tidak diketahui') as channel,
        COUNT(*) as order_count,
        COALESCE(SUM(total_price), 0) as revenue
      FROM orders
      WHERE deleted_at IS NULL
        AND created_at >= ? AND created_at <= ?
        ${storeId ? 'AND store_id = ?' : ''}
      GROUP BY acquisition_channel
      ORDER BY order_count DESC
    `, startDate, endDate, ...(storeId ? [storeId] : []));

    // 5. Product mix
    const productMix = await this.prisma.order_items.groupBy({
      by: ['menu_size_key'],
      where: { order: orderWhere },
      _count: true,
      _sum: { price: true },
    });

    // 6. Top toppings
    const topToppings = await this.prisma.order_item_toppings.groupBy({
      by: ['topping_id'],
      where: { order_item: { order: orderWhere } },
      _count: true,
      _sum: { gram_used: true },
      orderBy: { _count: { topping_id: 'desc' } },
      take: 15,
    });
    const toppingIds = topToppings.map(t => t.topping_id);
    const toppingNames = toppingIds.length
      ? await this.prisma.toppings.findMany({
          where: { id: { in: toppingIds } },
          select: { id: true, name: true },
        })
      : [];
    const toppingNameMap = Object.fromEntries(toppingNames.map(t => [t.id, t.name]));

    // 7. Top bumbu
    const topBumbu = await this.prisma.order_items.groupBy({
      by: ['bumbu'],
      where: { order: orderWhere, bumbu: { not: '' } },
      _count: true,
      orderBy: { _count: { bumbu: 'desc' } },
      take: 10,
    });

    // 8. Repeat customers (top 15)
    const repeatCustomers = await this.prisma.$queryRawUnsafe(`
      SELECT
        customer_name as name,
        COUNT(*) as order_count,
        COALESCE(SUM(total_price), 0) as total_spent
      FROM orders
      WHERE deleted_at IS NULL
        AND customer_name IS NOT NULL AND customer_name != ''
        AND created_at >= ? AND created_at <= ?
        ${storeId ? 'AND store_id = ?' : ''}
      GROUP BY customer_name
      HAVING COUNT(*) > 1
      ORDER BY order_count DESC
      LIMIT 15
    `, startDate, endDate, ...(storeId ? [storeId] : []));

    // 9. Customer stats
    const customerStats = await this.prisma.$queryRawUnsafe(`
      SELECT
        COUNT(DISTINCT customer_name) as total_customers,
        (SELECT COUNT(*) FROM (
          SELECT customer_name FROM orders
          WHERE deleted_at IS NULL AND customer_name IS NOT NULL AND customer_name != ''
            AND created_at >= ? AND created_at <= ?
            ${storeId ? 'AND store_id = ?' : ''}
          GROUP BY customer_name HAVING COUNT(*) > 1
        ) sub) as repeat_customers
      FROM orders
      WHERE deleted_at IS NULL AND customer_name IS NOT NULL AND customer_name != ''
        AND created_at >= ? AND created_at <= ?
        ${storeId ? 'AND store_id = ?' : ''}
    `, startDate, endDate, ...(storeId ? [storeId] : []),
       startDate, endDate, ...(storeId ? [storeId] : []));

    // 10. Low stock alerts
    const toppingsAll = await this.prisma.toppings.findMany({
      where: { deleted_at: null, is_active: true },
    });
    const stockWhere: any = { deleted_at: null, item_type: 'TOPPING' as any };
    if (storeId) stockWhere.store_id = storeId;
    const stockEntries = await this.prisma.stock_entries.groupBy({
      by: ['topping_id'],
      where: stockWhere,
      _sum: { quantity: true },
    });
    const stockInMap = new Map(stockEntries.map(s => [s.topping_id, s._sum.quantity || 0]));

    const allTimeWhere: any = { deleted_at: null };
    if (storeId) allTimeWhere.store_id = storeId;
    const allTimeUsage = await this.prisma.order_item_toppings.groupBy({
      by: ['topping_id'],
      where: { order_item: { order: allTimeWhere } },
      _sum: { gram_used: true },
    });
    const allTimeUsageMap = new Map(allTimeUsage.map(u => [u.topping_id, u._sum.gram_used || 0]));

    const lowStockAlerts = toppingsAll
      .map(t => {
        const stockInGram = (stockInMap.get(t.id) || 0) * 1000;
        const usedGram = allTimeUsageMap.get(t.id) || 0;
        const currentGram = Math.round((stockInGram - usedGram) * 10) / 10;
        return { id: t.id, name: t.name, current_stock_gram: currentGram };
      })
      .filter(t => t.current_stock_gram < 500)
      .sort((a, b) => a.current_stock_gram - b.current_stock_gram);

    // 11. Spicy level distribution
    const spicyDistribution = await this.prisma.$queryRawUnsafe(`
      SELECT
        oi.spicy_level,
        COUNT(*) as count
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      WHERE o.deleted_at IS NULL
        AND o.created_at >= ? AND o.created_at <= ?
        ${storeId ? 'AND o.store_id = ?' : ''}
      GROUP BY oi.spicy_level
      ORDER BY count DESC
    `, startDate, endDate, ...(storeId ? [storeId] : []));

    const totalOrders = await this.prisma.orders.count({ where: orderWhere });
    const totalRevenue = await this.prisma.orders.aggregate({ where: orderWhere, _sum: { total_price: true } });

    return {
      content: {
        period: { start: startDate, end: endDate },
        summary: {
          total_orders: totalOrders,
          total_revenue: totalRevenue._sum.total_price || 0,
          avg_order_value: totalOrders > 0 ? Math.round((totalRevenue._sum.total_price || 0) / totalOrders) : 0,
          operating_days: (await this.prisma.$queryRawUnsafe(`
            SELECT COUNT(DISTINCT DATE(created_at)) as days FROM orders
            WHERE deleted_at IS NULL AND created_at >= ? AND created_at <= ?
            ${storeId ? 'AND store_id = ?' : ''}
          `, startDate, endDate, ...(storeId ? [storeId] : [])) as any[])[0]?.days || 0,
        },
        monthly_trend: (monthlyTrend as any[]).map(m => ({
          month: m.month,
          order_count: Number(m.order_count),
          revenue: Number(m.revenue),
          avg_order_value: Number(m.avg_order_value),
        })),
        peak_hours: (peakHours as any[]).map(h => ({
          hour: Number(h.hour),
          order_count: Number(h.order_count),
          revenue: Number(h.revenue),
        })),
        day_of_week: (dayOfWeek as any[]).map(d => ({
          day_name: d.day_name,
          order_count: Number(d.order_count),
          revenue: Number(d.revenue),
          avg_orders_per_day: d.num_days > 0 ? Math.round(Number(d.order_count) / Number(d.num_days) * 10) / 10 : 0,
          avg_revenue_per_day: d.num_days > 0 ? Math.round(Number(d.revenue) / Number(d.num_days)) : 0,
        })),
        acquisition_channels: (channels as any[]).map(c => ({
          channel: c.channel,
          order_count: Number(c.order_count),
          revenue: Number(c.revenue),
        })),
        product_mix: productMix.map(p => ({
          size: p.menu_size_key,
          count: p._count,
          revenue: p._sum.price || 0,
        })),
        top_toppings: topToppings.map(t => ({
          name: toppingNameMap[t.topping_id] || `#${t.topping_id}`,
          count: t._count,
          total_gram: Math.round((t._sum.gram_used || 0) * 10) / 10,
        })),
        top_bumbu: topBumbu.map(b => ({
          name: b.bumbu,
          count: b._count,
        })),
        spicy_distribution: (spicyDistribution as any[]).map(s => ({
          level: Number(s.spicy_level),
          count: Number(s.count),
        })),
        customer_stats: {
          total_customers: Number((customerStats as any[])[0]?.total_customers || 0),
          repeat_customers: Number((customerStats as any[])[0]?.repeat_customers || 0),
          repeat_rate: (() => {
            const total = Number((customerStats as any[])[0]?.total_customers || 0);
            const repeat = Number((customerStats as any[])[0]?.repeat_customers || 0);
            return total > 0 ? Math.round((repeat / total) * 100) : 0;
          })(),
        },
        top_repeat_customers: (repeatCustomers as any[]).map(c => ({
          name: c.name,
          order_count: Number(c.order_count),
          total_spent: Number(c.total_spent),
        })),
        low_stock_alerts: lowStockAlerts,
      },
      message: 'Data analytics berhasil dimuat',
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
