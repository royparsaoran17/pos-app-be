import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(dto: LoginDto, requiredRole?: string) {
    const user = await this.prisma.users.findFirst({
      where: {
        email: dto.email,
        deleted_at: null,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Email atau password salah');
    }

    if (!user.is_active) {
      throw new ForbiddenException('Akun Anda tidak aktif');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email atau password salah');
    }

    if (requiredRole && user.role !== requiredRole) {
      throw new ForbiddenException('Anda tidak memiliki akses ke halaman ini');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      store_id: user.store_id || null,
    };

    // Record attendance for staff login (Jakarta timezone)
    if (user.role === 'STAFF') {
      if (!user.store_id) {
        throw new ForbiddenException('Staff belum di-assign ke toko');
      }
      const now = new Date();
      const jakartaOffset = 7 * 60 * 60 * 1000;
      const jakartaDate = new Date(now.getTime() + jakartaOffset);
      const loginDate = new Date(jakartaDate.toISOString().slice(0, 10) + 'T00:00:00Z');
      await this.prisma.staff_attendance.upsert({
        where: { staff_id_login_date: { staff_id: user.id, login_date: loginDate } },
        update: { login_at: now },
        create: { staff_id: user.id, login_date: loginDate, login_at: now, store_id: user.store_id },
      });
    }

    // Get store info if user has store_id
    let storeInfo = null;
    if (user.store_id) {
      storeInfo = await this.prisma.stores.findUnique({
        where: { id: user.store_id },
        select: { id: true, name: true, code: true },
      });
    }

    // For superadmin, also return list of all active stores
    let stores = [];
    if (user.role === 'SUPERADMIN') {
      stores = await this.prisma.stores.findMany({
        where: { deleted_at: null, is_active: true },
        orderBy: { name: 'asc' },
        select: { id: true, name: true, code: true },
      });
    }

    return {
      content: {
        access_token: await this.jwtService.signAsync(payload),
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          store_id: user.store_id,
          store: storeInfo,
        },
        stores,
      },
      message: 'Login berhasil',
    };
  }

  async getProfile(userId: number) {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        store_id: true,
        is_active: true,
        created_at: true,
        store: { select: { id: true, name: true, code: true } },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User tidak ditemukan');
    }

    return { content: user, message: 'Profil berhasil dimuat' };
  }
}
