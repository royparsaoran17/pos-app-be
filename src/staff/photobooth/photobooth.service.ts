import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../prisma.service';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

const UPLOADS_DIR = path.join(process.cwd(), 'uploads', 'photostrips');
const EXPIRY_HOURS = 48;

@Injectable()
export class PhotoboothService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  onModuleInit() {
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }
  }

  async upload(imageDataUrl: string, storeId: number) {
    // Extract base64 from data URL
    const matches = imageDataUrl.match(/^data:image\/(jpeg|png|jpg);base64,(.+)$/);
    if (!matches) {
      throw new NotFoundException('Format gambar tidak valid');
    }

    const ext = matches[1] === 'png' ? 'png' : 'jpg';
    const buffer = Buffer.from(matches[2], 'base64');

    const filename = `${uuidv4()}.${ext}`;
    const token = uuidv4();
    const filePath = path.join(UPLOADS_DIR, filename);

    fs.writeFileSync(filePath, buffer);

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + EXPIRY_HOURS);

    const record = await this.prisma.photo_strips.create({
      data: {
        store_id: storeId,
        token,
        filename,
        expires_at: expiresAt,
      },
    });

    const publicBaseUrl = this.config.get('PUBLIC_BASE_URL') || `http://localhost:${this.config.get('PORT') || 9005}`;
    const downloadUrl = `${publicBaseUrl}/photobooth/download/${token}`;

    return {
      content: {
        token,
        download_url: downloadUrl,
        expires_at: expiresAt,
      },
      message: 'Foto berhasil disimpan',
    };
  }

  async download(token: string): Promise<string | null> {
    const record = await this.prisma.photo_strips.findUnique({
      where: { token },
    });

    if (!record) return null;
    if (new Date() > record.expires_at) return null;

    const filePath = path.join(UPLOADS_DIR, record.filename);
    if (!fs.existsSync(filePath)) return null;

    return filePath;
  }

  // Run daily at 3 AM to clean up expired photos
  @Cron('0 3 * * *')
  async cleanupExpired() {
    const expired = await this.prisma.photo_strips.findMany({
      where: { expires_at: { lt: new Date() } },
    });

    for (const record of expired) {
      const filePath = path.join(UPLOADS_DIR, record.filename);
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (err) {
        console.error(`Failed to delete file ${record.filename}:`, err);
      }
    }

    if (expired.length > 0) {
      await this.prisma.photo_strips.deleteMany({
        where: { expires_at: { lt: new Date() } },
      });
      console.log(`Cleaned up ${expired.length} expired photo strips`);
    }
  }
}
