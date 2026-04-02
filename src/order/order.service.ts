import {
  Injectable, BadRequestException, NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  private generateOrderNumber(storeCode?: string): string {
    const now = new Date();
    const date = now.toISOString().slice(0, 10).replace(/-/g, '');
    const time = now.toTimeString().slice(0, 8).replace(/:/g, '');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return storeCode ? `POS-${storeCode}-${date}-${time}-${random}` : `POS-${date}-${time}-${random}`;
  }

  async createOrder(dto: CreateOrderDto, staffId: number, storeId: number) {
    // Look up store code
    const store = await this.prisma.stores.findUnique({ where: { id: storeId } });
    const storeCode = store?.code || String(storeId);

    // Load all active menu sizes from DB
    const menuSizes = await this.prisma.menu_sizes.findMany({
      where: { deleted_at: null, is_active: true },
    });
    const sizeMap = new Map(menuSizes.map((s) => [s.key, s]));

    // Validate each item
    for (const item of dto.items) {
      const sizeData = sizeMap.get(item.size);
      if (!sizeData) {
        throw new BadRequestException(`Ukuran "${item.size}" tidak valid`);
      }
      const isFood = sizeData.category === 'FOOD';
      if (isFood) {
        if (!item.bumbu || item.bumbu.length === 0) {
          throw new BadRequestException('Bumbu wajib dipilih minimal 1 untuk makanan');
        }
        if (sizeData.max_toppings !== null && (item.topping_ids?.length || 0) > sizeData.max_toppings) {
          throw new BadRequestException(
            `Ukuran ${sizeData.label} maksimal ${sizeData.max_toppings} topping`,
          );
        }
      }
      // Ensure defaults for drinks
      if (!item.topping_ids) item.topping_ids = [];
      if (!item.bumbu) item.bumbu = [];
      if (!item.spicy_level && item.spicy_level !== 0) item.spicy_level = 0;
    }

    // Calculate subtotal
    let subtotal = 0;
    for (const item of dto.items) {
      subtotal += sizeMap.get(item.size).price;
    }

    // Handle member (optional)
    let memberId: number | null = null;
    if (dto.member_phone) {
      let member = await this.prisma.members.findFirst({
        where: { phone: dto.member_phone, deleted_at: null },
      });
      if (!member) {
        member = await this.prisma.members.create({
          data: { phone: dto.member_phone, name: dto.member_name },
        });
      }
      memberId = member.id;
    }

    // Handle promo (optional)
    let promoId: number | null = null;
    let discountAmount = 0;
    if (dto.promo_code) {
      const promo = await this.prisma.promos.findFirst({
        where: { code: dto.promo_code.toUpperCase(), deleted_at: null, is_active: true },
      });
      if (!promo) throw new BadRequestException('Kode promo tidak valid');

      const now = new Date();
      if (promo.start_date && now < promo.start_date) throw new BadRequestException('Promo belum berlaku');
      if (promo.end_date && now > promo.end_date) throw new BadRequestException('Promo sudah berakhir');
      if (promo.max_usage && promo.used_count >= promo.max_usage) throw new BadRequestException('Kuota promo sudah habis');
      if (subtotal < promo.min_purchase) throw new BadRequestException(`Minimal pembelian Rp ${promo.min_purchase} untuk promo ini`);

      if (promo.discount_type === 'PERCENTAGE') {
        discountAmount = Math.floor(subtotal * promo.discount_value / 100);
        if (promo.max_discount && discountAmount > promo.max_discount) {
          discountAmount = promo.max_discount;
        }
      } else {
        discountAmount = promo.discount_value;
      }
      if (discountAmount > subtotal) discountAmount = subtotal;

      promoId = promo.id;

      // Increment promo usage
      await this.prisma.promos.update({
        where: { id: promo.id },
        data: { used_count: { increment: 1 } },
      });
    }

    const totalPrice = subtotal - discountAmount;
    const orderNumber = this.generateOrderNumber(storeCode);

    // Generate daily queue number (Jakarta timezone UTC+7)
    const now = new Date();
    const jakartaOffset = 7 * 60 * 60 * 1000;
    const jakartaDate = new Date(now.getTime() + jakartaOffset);
    const todayStr = jakartaDate.toISOString().slice(0, 10);
    const startOfDay = new Date(todayStr + 'T00:00:00+07:00');
    const endOfDay = new Date(todayStr + 'T23:59:59.999+07:00');

    const lastOrder = await this.prisma.orders.findFirst({
      where: { created_at: { gte: startOfDay, lte: endOfDay }, store_id: storeId },
      orderBy: { queue_number: 'desc' },
    });
    const queueNumber = (lastOrder?.queue_number || 0) + 1;

    const order = await this.prisma.$transaction(async (tx) => {
      const created = await tx.orders.create({
        data: {
          order_number: orderNumber,
          queue_number: queueNumber,
          store_id: storeId,
          staff_id: staffId,
          member_id: memberId,
          promo_id: promoId,
          subtotal,
          discount_amount: discountAmount,
          total_price: totalPrice,
          customer_name: dto.customer_name || null,
          payment_method: dto.payment_method as any,
          notes: dto.notes,
          order_items: {
            create: dto.items.map((item) => ({
              menu_size_key: item.size,
              price: sizeMap.get(item.size).price,
              spicy_level: item.spicy_level || 0,
              bumbu: Array.isArray(item.bumbu) ? item.bumbu.join(', ') : (item.bumbu || ''),
              toppings: item.topping_ids?.length ? {
                create: item.topping_ids.map((toppingId) => ({
                  topping_id: toppingId,
                })),
              } : undefined,
            })),
          },
        },
        include: {
          store: { select: { id: true, name: true, address: true, phone: true, instagram: true, tiktok: true } },
          staff: { select: { id: true, name: true } },
          member: { select: { id: true, name: true, phone: true } },
          promo: { select: { id: true, code: true, name: true, discount_type: true, discount_value: true } },
          order_items: {
            include: { toppings: { include: { topping: true } } },
          },
        },
      });

      // Update member stats within the same transaction
      if (memberId) {
        await tx.members.update({
          where: { id: memberId },
          data: {
            total_orders: { increment: 1 },
            total_spent: { increment: totalPrice },
          },
        });
      }

      return created;
    });

    return { content: order, message: 'Pesanan berhasil dibuat' };
  }

  async getOrders(query: {
    page?: number; per_page?: number; search?: string;
    sortBy?: string; orderBy?: string; staff_id?: number;
    payment_method?: string; date_from?: string; date_to?: string;
    member_id?: number;
  }, storeId: number | null = null) {
    const page = Number(query.page) || 1;
    const perPage = Number(query.per_page) || 10;
    const skip = (page - 1) * perPage;
    const where: any = { deleted_at: null };
    if (storeId) where.store_id = storeId;

    if (query.search) {
      where.OR = [
        { order_number: { contains: query.search } },
        { customer_name: { contains: query.search } },
        { member: { phone: { contains: query.search } } },
        { member: { name: { contains: query.search } } },
      ];
    }
    if (query.staff_id) where.staff_id = Number(query.staff_id);
    if (query.member_id) where.member_id = Number(query.member_id);
    if (query.payment_method) where.payment_method = query.payment_method;

    if (query.date_from || query.date_to) {
      where.created_at = {};
      if (query.date_from) where.created_at.gte = new Date(query.date_from + 'T00:00:00+07:00');
      if (query.date_to) where.created_at.lte = new Date(query.date_to + 'T23:59:59.999+07:00');
    }

    const orderByField = query.sortBy || 'created_at';
    const orderDirection = query.orderBy || 'desc';

    const [rows, count] = await Promise.all([
      this.prisma.orders.findMany({
        where, skip, take: perPage,
        orderBy: { [orderByField]: orderDirection },
        include: {
          store: { select: { id: true, name: true, address: true, phone: true, instagram: true, tiktok: true } },
          staff: { select: { id: true, name: true } },
          member: { select: { id: true, name: true, phone: true } },
          promo: { select: { id: true, code: true, name: true } },
          order_items: {
            include: { toppings: { include: { topping: true } } },
          },
        },
      }),
      this.prisma.orders.count({ where }),
    ]);

    return {
      content: rows,
      meta: { total: count, per_page: perPage, current_page: page, first_page: 1, last_page: Math.ceil(count / perPage) || 1 },
      message: 'Data pesanan berhasil dimuat',
    };
  }

  async getOrderById(id: number) {
    const order = await this.prisma.orders.findFirst({
      where: { id, deleted_at: null },
      include: {
        store: { select: { id: true, name: true, address: true, phone: true, instagram: true, tiktok: true } },
        staff: { select: { id: true, name: true } },
        member: { select: { id: true, name: true, phone: true } },
        promo: { select: { id: true, code: true, name: true, discount_type: true, discount_value: true } },
        order_items: {
          include: { toppings: { include: { topping: true } } },
        },
      },
    });
    if (!order) throw new NotFoundException('Pesanan tidak ditemukan');
    return { content: order, message: 'Detail pesanan berhasil dimuat' };
  }

  async updateOrder(id: number, dto: any) {
    const order = await this.prisma.orders.findFirst({ where: { id, deleted_at: null } });
    if (!order) throw new NotFoundException('Pesanan tidak ditemukan');

    // Update order-level fields
    const orderData: any = {};
    if (dto.payment_method) orderData.payment_method = dto.payment_method;
    if (dto.notes !== undefined) orderData.notes = dto.notes;

    if (dto.items && Array.isArray(dto.items)) {
      const menuSizes = await this.prisma.menu_sizes.findMany({ where: { deleted_at: null, is_active: true } });
      const sizeMap = new Map(menuSizes.map((s) => [s.key, s]));

      // Validate items before transaction
      let subtotal = 0;
      for (const item of dto.items) {
        const sizeData = sizeMap.get(item.size);
        if (!sizeData) throw new BadRequestException(`Ukuran "${item.size}" tidak valid`);
        subtotal += sizeData.price;
      }

      orderData.subtotal = subtotal;
      orderData.total_price = subtotal - (order.discount_amount || 0);
      if (orderData.total_price < 0) orderData.total_price = 0;

      await this.prisma.$transaction(async (tx) => {
        // Delete existing items and their toppings
        const existingItems = await tx.order_items.findMany({ where: { order_id: id } });
        for (const item of existingItems) {
          await tx.order_item_toppings.deleteMany({ where: { order_item_id: item.id } });
        }
        await tx.order_items.deleteMany({ where: { order_id: id } });

        // Recreate items
        for (const item of dto.items) {
          const sizeData = sizeMap.get(item.size);

          const createdItem = await tx.order_items.create({
            data: {
              order_id: id,
              menu_size_key: item.size,
              price: sizeData.price,
              spicy_level: item.spicy_level,
              bumbu: Array.isArray(item.bumbu) ? item.bumbu.join(', ') : item.bumbu,
            },
          });

          if (item.topping_ids?.length) {
            await tx.order_item_toppings.createMany({
              data: item.topping_ids.map((tid: number) => ({
                order_item_id: createdItem.id,
                topping_id: tid,
              })),
            });
          }
        }

        await tx.orders.update({ where: { id }, data: orderData });
      });
    } else {
      await this.prisma.orders.update({ where: { id }, data: orderData });
    }

    return this.getOrderById(id);
  }

  async deleteOrder(id: number) {
    const order = await this.prisma.orders.findFirst({ where: { id, deleted_at: null } });
    if (!order) throw new NotFoundException('Pesanan tidak ditemukan');
    await this.prisma.orders.update({
      where: { id },
      data: { deleted_at: new Date(), status: 'CANCELLED' },
    });
    return { message: 'Pesanan berhasil dibatalkan' };
  }
}
