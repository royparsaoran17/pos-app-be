import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateBumbuDto, UpdateBumbuDto } from './bumbu.dto';

@Injectable()
export class BumbuService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: { page?: number; per_page?: number; search?: string }) {
    const page = Number(query.page) || 1;
    const perPage = Number(query.per_page) || 20;
    const skip = (page - 1) * perPage;
    const where: any = { deleted_at: null };

    if (query.search) {
      where.name = { contains: query.search };
    }

    const [rows, count] = await Promise.all([
      this.prisma.bumbu.findMany({ where, skip, take: perPage, orderBy: { name: 'asc' } }),
      this.prisma.bumbu.count({ where }),
    ]);

    return {
      content: rows,
      meta: { total: count, per_page: perPage, current_page: page, last_page: Math.ceil(count / perPage) || 1 },
      message: 'Data bumbu berhasil dimuat',
    };
  }

  async findOne(id: number) {
    const row = await this.prisma.bumbu.findFirst({ where: { id, deleted_at: null } });
    if (!row) throw new NotFoundException('Bumbu tidak ditemukan');
    return { content: row, message: 'Detail bumbu berhasil dimuat' };
  }

  async create(dto: CreateBumbuDto) {
    const row = await this.prisma.bumbu.create({ data: { name: dto.name } });
    return { content: row, message: 'Bumbu berhasil ditambahkan' };
  }

  async update(id: number, dto: UpdateBumbuDto) {
    await this.findOne(id);
    const data: any = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.is_active !== undefined) data.is_active = dto.is_active;
    const row = await this.prisma.bumbu.update({ where: { id }, data });
    return { content: row, message: 'Bumbu berhasil diperbarui' };
  }

  async delete(id: number) {
    await this.findOne(id);
    await this.prisma.bumbu.update({ where: { id }, data: { deleted_at: new Date() } });
    return { message: 'Bumbu berhasil dihapus' };
  }
}
