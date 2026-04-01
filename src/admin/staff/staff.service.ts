import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateStaffDto, UpdateStaffDto } from './staff.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminStaffService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: { page?: number; per_page?: number; search?: string }, storeId: number | null = null) {
    const page = Number(query.page) || 1;
    const perPage = Number(query.per_page) || 20;
    const skip = (page - 1) * perPage;
    const where: any = { deleted_at: null, role: 'STAFF' };

    if (storeId) where.store_id = storeId;

    if (query.search) {
      where.OR = [
        { name: { contains: query.search } },
        { email: { contains: query.search } },
      ];
    }

    const [rows, count] = await Promise.all([
      this.prisma.users.findMany({
        where,
        skip,
        take: perPage,
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          is_active: true,
          created_at: true,
          updated_at: true,
          store: { select: { id: true, name: true, code: true } },
          _count: { select: { orders: true, sop_checklists: true, quality_checks: true } },
        },
      }),
      this.prisma.users.count({ where }),
    ]);

    return {
      content: rows,
      meta: { total: count, per_page: perPage, current_page: page, last_page: Math.ceil(count / perPage) || 1 },
      message: 'Data staff berhasil dimuat',
    };
  }

  async findOne(id: number) {
    const row = await this.prisma.users.findFirst({
      where: { id, deleted_at: null, role: 'STAFF' },
      select: {
        id: true,
        name: true,
        email: true,
        is_active: true,
        created_at: true,
        updated_at: true,
        store: { select: { id: true, name: true, code: true } },
        _count: { select: { orders: true, sop_checklists: true, quality_checks: true } },
      },
    });
    if (!row) throw new NotFoundException('Staff tidak ditemukan');
    return { content: row, message: 'Detail staff berhasil dimuat' };
  }

  async create(dto: CreateStaffDto) {
    const exists = await this.prisma.users.findFirst({
      where: { email: dto.email, deleted_at: null },
    });
    if (exists) throw new ConflictException('Email sudah terdaftar');

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const row = await this.prisma.users.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
        role: 'STAFF',
        store_id: dto.store_id || null,
      },
    });

    const { password, ...result } = row;
    return { content: result, message: 'Staff berhasil ditambahkan' };
  }

  async update(id: number, dto: UpdateStaffDto) {
    await this.findOne(id);

    if (dto.email) {
      const exists = await this.prisma.users.findFirst({
        where: { email: dto.email, deleted_at: null, NOT: { id } },
      });
      if (exists) throw new ConflictException('Email sudah digunakan user lain');
    }

    const data: any = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.email !== undefined) data.email = dto.email;
    if (dto.is_active !== undefined) data.is_active = dto.is_active;
    if (dto.store_id !== undefined) data.store_id = dto.store_id;
    if (dto.password) data.password = await bcrypt.hash(dto.password, 10);

    const row = await this.prisma.users.update({ where: { id }, data });
    const { password, ...result } = row;
    return { content: result, message: 'Staff berhasil diperbarui' };
  }

  async delete(id: number) {
    await this.findOne(id);
    await this.prisma.users.update({ where: { id }, data: { deleted_at: new Date() } });
    return { message: 'Staff berhasil dihapus' };
  }
}
