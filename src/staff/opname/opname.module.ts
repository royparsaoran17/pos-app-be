import { Module } from '@nestjs/common';
import { OpnameController } from './opname.controller';
import { OpnameService } from './opname.service';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [OpnameController],
  providers: [OpnameService, PrismaService],
})
export class OpnameModule {}
