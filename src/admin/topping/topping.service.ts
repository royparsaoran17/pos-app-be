import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateToppingDto, UpdateToppingDto } from './topping.dto';

@Injectable()
export class ToppingService {
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
      this.prisma.toppings.findMany({ where, skip, take: perPage, orderBy: { name: 'asc' } }),
      this.prisma.toppings.count({ where }),
    ]);

    return {
      content: rows,
      meta: { total: count, per_page: perPage, current_page: page, last_page: Math.ceil(count / perPage) || 1 },
      message: 'Data topping berhasil dimuat',
    };
  }

  async findOne(id: number) {
    const row = await this.prisma.toppings.findFirst({ where: { id, deleted_at: null } });
    if (!row) throw new NotFoundException('Topping tidak ditemukan');
    return { content: row, message: 'Detail topping berhasil dimuat' };
  }

  async create(dto: CreateToppingDto) {
    const row = await this.prisma.toppings.create({
      data: { name: dto.name, gram_per_portion: dto.gram_per_portion || 0 },
    });
    return { content: row, message: 'Topping berhasil ditambahkan' };
  }

  async update(id: number, dto: UpdateToppingDto) {
    await this.findOne(id);
    const data: any = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.gram_per_portion !== undefined) data.gram_per_portion = dto.gram_per_portion;
    if (dto.is_active !== undefined) data.is_active = dto.is_active;
    const row = await this.prisma.toppings.update({ where: { id }, data });
    return { content: row, message: 'Topping berhasil diperbarui' };
  }

  async delete(id: number) {
    await this.findOne(id);
    await this.prisma.toppings.update({ where: { id }, data: { deleted_at: new Date() } });
    return { message: 'Topping berhasil dihapus' };
  }
}
