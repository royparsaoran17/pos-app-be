import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from '../../prisma.service';
import { StoreController } from './store.controller';
import { StoreService } from './store.service';

@Module({
  imports: [JwtModule.register({ secret: process.env.JWT_SECRET })],
  controllers: [StoreController],
  providers: [PrismaService, StoreService],
})
export class StoreModule {}
