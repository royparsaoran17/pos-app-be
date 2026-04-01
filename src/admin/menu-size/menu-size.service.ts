import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateMenuSizeDto, UpdateMenuSizeDto } from './menu-size.dto';

@Injectable()
export class MenuSizeService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: { page?: number; per_page?: number; search?: string }) {
    const page = Number(query.page) || 1;
    const perPage = Number(query.per_page) || 20;
    const skip = (page - 1) * perPage;
    const where: any = { deleted_at: null };

    if (query.search) {
      where.label = { contains: query.search };
    }

    const [rows, count] = await Promise.all([
      this.prisma.menu_sizes.findMany({ where, skip, take: perPage, orderBy: { sort_order: 'asc' } }),
      this.prisma.menu_sizes.count({ where }),
    ]);

    return {
      content: rows,
      meta: { total: count, per_page: perPage, current_page: page, last_page: Math.ceil(count / perPage) || 1 },
      message: 'Data menu/ukuran berhasil dimuat',
    };
  }

  async findOne(id: number) {
    const row = await this.prisma.menu_sizes.findFirst({ where: { id, deleted_at: null } });
    if (!row) throw new NotFoundException('Menu/ukuran tidak ditemukan');
    return { content: row, message: 'Detail menu/ukuran berhasil dimuat' };
  }

  async create(dto: CreateMenuSizeDto) {
    const exists = await this.prisma.menu_sizes.findFirst({ where: { key: dto.key.toUpperCase(), deleted_at: null } });
    if (exists) throw new ConflictException('Key sudah digunakan');

    const row = await this.prisma.menu_sizes.create({
      data: { ...dto, key: dto.key.toUpperCase() },
    });
    return { content: row, message: 'Menu/ukuran berhasil ditambahkan' };
  }

  async update(id: number, dto: UpdateMenuSizeDto) {
    await this.findOne(id);
    const row = await this.prisma.menu_sizes.update({ where: { id }, data: dto });
    return { content: row, message: 'Menu/ukuran berhasil diperbarui' };
  }

  async delete(id: number) {
    await this.findOne(id);
    await this.prisma.menu_sizes.update({ where: { id }, data: { deleted_at: new Date() } });
    return { message: 'Menu/ukuran berhasil dihapus' };
  }
}
