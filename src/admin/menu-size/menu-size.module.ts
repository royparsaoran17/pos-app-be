import { Module } from '@nestjs/common';
import { MenuSizeController } from './menu-size.controller';
import { MenuSizeService } from './menu-size.service';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [MenuSizeController],
  providers: [MenuSizeService, PrismaService],
})
export class AdminMenuSizeModule {}
