import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateSupplierDto, UpdateSupplierDto } from './supplier.dto';

@Injectable()
export class SupplierService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: { page?: number; per_page?: number; search?: string }) {
    const page = Number(query.page) || 1;
    const perPage = Number(query.per_page) || 20;
    const skip = (page - 1) * perPage;
    const where: any = { deleted_at: null };

    if (query.search) {
      where.OR = [
        { name: { contains: query.search } },
        { phone: { contains: query.search } },
        { contact_person: { contains: query.search } },
      ];
    }

    const [rows, count] = await Promise.all([
      this.prisma.suppliers.findMany({ where, skip, take: perPage, orderBy: { created_at: 'desc' } }),
      this.prisma.suppliers.count({ where }),
    ]);

    return {
      content: rows,
      meta: { total: count, per_page: perPage, current_page: page, last_page: Math.ceil(count / perPage) || 1 },
      message: 'Data supplier berhasil dimuat',
    };
  }

  async findOne(id: number) {
    const row = await this.prisma.suppliers.findFirst({ where: { id, deleted_at: null } });
    if (!row) throw new NotFoundException('Supplier tidak ditemukan');
    return { content: row, message: 'Detail supplier berhasil dimuat' };
  }

  async create(dto: CreateSupplierDto) {
    const row = await this.prisma.suppliers.create({ data: dto });
    return { content: row, message: 'Supplier berhasil ditambahkan' };
  }

  async update(id: number, dto: UpdateSupplierDto) {
    await this.findOne(id);
    const row = await this.prisma.suppliers.update({ where: { id }, data: dto });
    return { content: row, message: 'Supplier berhasil diperbarui' };
  }

  async delete(id: number) {
    await this.findOne(id);
    await this.prisma.suppliers.update({ where: { id }, data: { deleted_at: new Date() } });
    return { message: 'Supplier berhasil dihapus' };
  }
}
