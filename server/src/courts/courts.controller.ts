import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CourtsService } from './courts.service';
import {
  CreateCourtDto,
  UpdateCourtDto,
  CourtQueryDto,
  CourtResponseDto,
  CreateAvailabilitySlotDto,
  AvailabilityQueryDto,
  AvailabilitySlotResponseDto,
} from './dto/court.dto';
import { PaginatedResponseDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { UserRole } from 'prisma/client';

interface CurrentUser {
  id: string;
  role: string;
}

@ApiTags('Courts')
@Controller('api/courts')
export class CourtsController {
  constructor(private readonly courtsService: CourtsService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all courts with filtering' })
  @ApiResponse({
    status: 200,
    description: 'Courts retrieved successfully',
    type: PaginatedResponseDto<CourtResponseDto>,
  })
  findAll(@Query() query: CourtQueryDto) {
    return this.courtsService.findAll(query);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get court by ID' })
  @ApiResponse({ status: 200, description: 'Court found', type: CourtResponseDto })
  @ApiResponse({ status: 404, description: 'Court not found' })
  findOne(@Param('id') id: string, @Query('include') include?: string) {
    return this.courtsService.findOne(id, include);
  }

  @Post('/facilities/:facilityId/courts')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new court for facility' })
  @ApiResponse({ status: 201, description: 'Court created successfully', type: CourtResponseDto })
  @ApiResponse({ status: 403, description: 'Forbidden - Can only create courts for own facilities' })
  create(
    @Param('facilityId') facilityId: string,
    @Body() createCourtDto: CreateCourtDto,
    @CurrentUser() currentUser: CurrentUser,
  ) {
    return this.courtsService.create(facilityId, createCourtDto, currentUser);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update court' })
  @ApiResponse({ status: 200, description: 'Court updated successfully', type: CourtResponseDto })
  @ApiResponse({ status: 403, description: 'Forbidden - Can only update own courts' })
  update(@Param('id') id: string, @Body() updateCourtDto: UpdateCourtDto, @CurrentUser() currentUser: CurrentUser) {
    return this.courtsService.update(id, updateCourtDto, currentUser);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete court' })
  @ApiResponse({ status: 200, description: 'Court deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Can only delete own courts' })
  remove(@Param('id') id: string, @CurrentUser() currentUser: CurrentUser) {
    return this.courtsService.remove(id, currentUser);
  }

  // Availability Management
  @Get(':courtId/availability')
  @Public()
  @ApiOperation({ summary: 'Get court availability' })
  @ApiResponse({ status: 200, description: 'Availability retrieved successfully', type: [AvailabilitySlotResponseDto] })
  getAvailability(@Param('courtId') courtId: string, @Query() query: AvailabilityQueryDto) {
    return this.courtsService.getAvailability(courtId, query);
  }

  @Post(':courtId/availability')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create availability slot' })
  @ApiResponse({
    status: 201,
    description: 'Availability slot created successfully',
    type: AvailabilitySlotResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Can only manage own courts' })
  createAvailabilitySlot(
    @Param('courtId') courtId: string,
    @Body() createSlotDto: CreateAvailabilitySlotDto,
    @CurrentUser() currentUser: CurrentUser,
  ) {
    return this.courtsService.createAvailabilitySlot(courtId, createSlotDto, currentUser);
  }

  @Patch('/availability/:slotId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update availability slot' })
  @ApiResponse({ status: 200, description: 'Availability slot updated successfully' })
  updateAvailabilitySlot(
    @Param('slotId') slotId: string,
    @Body() updateData: Partial<CreateAvailabilitySlotDto>,
    @CurrentUser() currentUser: CurrentUser,
  ) {
    return this.courtsService.updateAvailabilitySlot(slotId, updateData, currentUser);
  }

  @Delete('/availability/:slotId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete availability slot' })
  @ApiResponse({ status: 200, description: 'Availability slot deleted successfully' })
  deleteAvailabilitySlot(@Param('slotId') slotId: string, @CurrentUser() currentUser: CurrentUser) {
    return this.courtsService.deleteAvailabilitySlot(slotId, currentUser);
  }
}
