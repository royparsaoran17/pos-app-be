import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateStoreDto, UpdateStoreDto } from './store.dto';

@Injectable()
export class StoreService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: { page?: number; per_page?: number; search?: string }) {
    const page = Number(query.page) || 1;
    const perPage = Number(query.per_page) || 50;
    const skip = (page - 1) * perPage;
    const where: any = { deleted_at: null };

    if (query.search) {
      where.OR = [
        { name: { contains: query.search } },
        { code: { contains: query.search } },
      ];
    }

    const [rows, count] = await Promise.all([
      this.prisma.stores.findMany({
        where, skip, take: perPage,
        orderBy: { name: 'asc' },
        include: {
          _count: { select: { users: true, orders: true } },
        },
      }),
      this.prisma.stores.count({ where }),
    ]);

    return {
      content: rows,
      meta: { total: count, per_page: perPage, current_page: page, first_page: 1, last_page: Math.ceil(count / perPage) || 1 },
      message: 'Data toko berhasil dimuat',
    };
  }

  async findAllActive() {
    const stores = await this.prisma.stores.findMany({
      where: { deleted_at: null, is_active: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, code: true, address: true, phone: true },
    });
    return { content: stores, message: 'Data toko berhasil dimuat' };
  }

  async create(dto: CreateStoreDto) {
    const existing = await this.prisma.stores.findUnique({ where: { code: dto.code.toUpperCase() } });
    if (existing) throw new ConflictException('Kode toko sudah digunakan');

    const store = await this.prisma.stores.create({
      data: {
        name: dto.name,
        code: dto.code.toUpperCase(),
        address: dto.address,
        phone: dto.phone,
      },
    });
    return { content: store, message: 'Toko berhasil ditambahkan' };
  }

  async update(id: number, dto: UpdateStoreDto) {
    const store = await this.prisma.stores.findFirst({ where: { id, deleted_at: null } });
    if (!store) throw new NotFoundException('Toko tidak ditemukan');

    const data: any = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.code !== undefined) data.code = dto.code.toUpperCase();
    if (dto.address !== undefined) data.address = dto.address;
    if (dto.phone !== undefined) data.phone = dto.phone;
    if (dto.is_active !== undefined) data.is_active = dto.is_active;

    const updated = await this.prisma.stores.update({ where: { id }, data });
    return { content: updated, message: 'Toko berhasil diperbarui' };
  }

  async delete(id: number) {
    const store = await this.prisma.stores.findFirst({ where: { id, deleted_at: null } });
    if (!store) throw new NotFoundException('Toko tidak ditemukan');

    await this.prisma.stores.update({ where: { id }, data: { deleted_at: new Date() } });
    return { message: 'Toko berhasil dihapus' };
  }
}
