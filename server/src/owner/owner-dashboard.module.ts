import { Module } from '@nestjs/common';
import { OwnerDashboardService } from './owner-dashboard.service';
import { OwnerDashboardController } from './owner-dashboard.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [OwnerDashboardController],
  providers: [OwnerDashboardService],
  exports: [OwnerDashboardService],
})
export class OwnerDashboardModule {}
