import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateAdditionalDto, UpdateAdditionalDto } from './additional.dto';

@Injectable()
export class AdditionalService {
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
      this.prisma.additionals.findMany({ where, skip, take: perPage, orderBy: { sort_order: 'asc' } }),
      this.prisma.additionals.count({ where }),
    ]);

    return {
      content: rows,
      meta: { total: count, per_page: perPage, current_page: page, last_page: Math.ceil(count / perPage) || 1 },
      message: 'Data additional berhasil dimuat',
    };
  }

  async findOne(id: number) {
    const row = await this.prisma.additionals.findFirst({ where: { id, deleted_at: null } });
    if (!row) throw new NotFoundException('Additional tidak ditemukan');
    return { content: row, message: 'Detail additional berhasil dimuat' };
  }

  async create(dto: CreateAdditionalDto) {
    const row = await this.prisma.additionals.create({
      data: { name: dto.name, price: dto.price, sort_order: dto.sort_order || 0 },
    });
    return { content: row, message: 'Additional berhasil ditambahkan' };
  }

  async update(id: number, dto: UpdateAdditionalDto) {
    await this.findOne(id);
    const data: any = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.price !== undefined) data.price = dto.price;
    if (dto.is_active !== undefined) data.is_active = dto.is_active;
    if (dto.sort_order !== undefined) data.sort_order = dto.sort_order;
    const row = await this.prisma.additionals.update({ where: { id }, data });
    return { content: row, message: 'Additional berhasil diperbarui' };
  }

  async delete(id: number) {
    await this.findOne(id);
    await this.prisma.additionals.update({ where: { id }, data: { deleted_at: new Date() } });
    return { message: 'Additional berhasil dihapus' };
  }
}
