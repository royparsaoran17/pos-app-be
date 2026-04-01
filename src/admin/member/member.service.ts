import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateMemberDto, UpdateMemberDto } from './member.dto';

@Injectable()
export class MemberService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: { page?: number; per_page?: number; search?: string }) {
    const page = Number(query.page) || 1;
    const perPage = Number(query.per_page) || 20;
    const skip = (page - 1) * perPage;
    const where: any = { deleted_at: null };

    if (query.search) {
      where.OR = [
        { phone: { contains: query.search } },
        { name: { contains: query.search } },
      ];
    }

    const [rows, count] = await Promise.all([
      this.prisma.members.findMany({
        where, skip, take: perPage,
        orderBy: { created_at: 'desc' },
        include: { _count: { select: { orders: true } } },
      }),
      this.prisma.members.count({ where }),
    ]);

    return {
      content: rows,
      meta: { total: count, per_page: perPage, current_page: page, last_page: Math.ceil(count / perPage) || 1 },
      message: 'Data member berhasil dimuat',
    };
  }

  async findOne(id: number) {
    const row = await this.prisma.members.findFirst({
      where: { id, deleted_at: null },
      include: { _count: { select: { orders: true } } },
    });
    if (!row) throw new NotFoundException('Member tidak ditemukan');
    return { content: row, message: 'Detail member berhasil dimuat' };
  }

  async findByPhone(phone: string) {
    const row = await this.prisma.members.findFirst({
      where: { phone, deleted_at: null },
      include: { _count: { select: { orders: true } } },
    });
    return { content: row, message: row ? 'Member ditemukan' : 'Member tidak ditemukan' };
  }

  async getOrderHistory(id: number, query: { page?: number; per_page?: number }) {
    const member = await this.prisma.members.findFirst({ where: { id, deleted_at: null } });
    if (!member) throw new NotFoundException('Member tidak ditemukan');

    const page = Number(query.page) || 1;
    const perPage = Number(query.per_page) || 10;
    const skip = (page - 1) * perPage;

    const [rows, count] = await Promise.all([
      this.prisma.orders.findMany({
        where: { member_id: id, deleted_at: null },
        skip, take: perPage,
        orderBy: { created_at: 'desc' },
        include: {
          staff: { select: { id: true, name: true } },
          promo: { select: { id: true, code: true, name: true } },
          order_items: { include: { toppings: { include: { topping: true } } } },
        },
      }),
      this.prisma.orders.count({ where: { member_id: id, deleted_at: null } }),
    ]);

    return {
      content: { member, orders: rows },
      meta: { total: count, per_page: perPage, current_page: page, last_page: Math.ceil(count / perPage) || 1 },
      message: 'Riwayat pesanan member berhasil dimuat',
    };
  }

  async create(dto: CreateMemberDto) {
    const exists = await this.prisma.members.findFirst({ where: { phone: dto.phone, deleted_at: null } });
    if (exists) throw new ConflictException('Nomor HP sudah terdaftar');

    const row = await this.prisma.members.create({ data: dto });
    return { content: row, message: 'Member berhasil ditambahkan' };
  }

  async findOrCreate(phone: string, name?: string) {
    let member = await this.prisma.members.findFirst({ where: { phone, deleted_at: null } });
    if (!member) {
      member = await this.prisma.members.create({ data: { phone, name } });
    }
    return member;
  }

  async update(id: number, dto: UpdateMemberDto) {
    await this.findOne(id);
    if (dto.phone) {
      const exists = await this.prisma.members.findFirst({
        where: { phone: dto.phone, deleted_at: null, NOT: { id } },
      });
      if (exists) throw new ConflictException('Nomor HP sudah digunakan member lain');
    }
    const row = await this.prisma.members.update({ where: { id }, data: dto });
    return { content: row, message: 'Member berhasil diperbarui' };
  }

  async delete(id: number) {
    await this.findOne(id);
    await this.prisma.members.update({ where: { id }, data: { deleted_at: new Date() } });
    return { message: 'Member berhasil dihapus' };
  }
}
