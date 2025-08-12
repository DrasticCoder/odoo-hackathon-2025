import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { FacilitiesService } from './facilities.service';
import {
  CreateFacilityDto,
  UpdateFacilityDto,
  FacilityQueryDto,
  FacilityResponseDto,
  ApproveFacilityDto,
} from './dto/facility.dto';
import { PaginatedResponseDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { UserRole, User } from 'prisma/client';

@ApiTags('Facilities')
@Controller('api/facilities')
export class FacilitiesController {
  constructor(private readonly facilitiesService: FacilitiesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new facility' })
  @ApiResponse({ status: 201, description: 'Facility created successfully', type: FacilityResponseDto })
  @ApiResponse({ status: 403, description: 'Forbidden - Owner or Admin role required' })
  create(@Body() createFacilityDto: CreateFacilityDto, @CurrentUser() currentUser: User) {
    return this.facilitiesService.create(createFacilityDto, currentUser.id);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all facilities with search and filtering' })
  @ApiResponse({
    status: 200,
    description: 'Facilities retrieved successfully',
    type: PaginatedResponseDto<FacilityResponseDto>,
  })
  findAll(@Query() query: FacilityQueryDto, @CurrentUser() currentUser?: User) {
    console.log('Current user in facilities controller:', currentUser);
    return this.facilitiesService.findAll(query, currentUser);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get facility by ID' })
  @ApiResponse({ status: 200, description: 'Facility found', type: FacilityResponseDto })
  @ApiResponse({ status: 404, description: 'Facility not found' })
  findOne(@Param('id') id: string, @Query('include') include?: string) {
    return this.facilitiesService.findOne(id, include);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update facility' })
  @ApiResponse({ status: 200, description: 'Facility updated successfully', type: FacilityResponseDto })
  @ApiResponse({ status: 403, description: 'Forbidden - Can only update own facilities' })
  @ApiResponse({ status: 404, description: 'Facility not found' })
  update(@Param('id') id: string, @Body() updateFacilityDto: UpdateFacilityDto, @CurrentUser() currentUser: User) {
    return this.facilitiesService.update(id, updateFacilityDto, currentUser);
  }

  @Post(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve facility (Admin only)' })
  @ApiResponse({ status: 200, description: 'Facility approved successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 400, description: 'Facility is not pending approval' })
  approve(@Param('id') id: string, @Body() approveDto: ApproveFacilityDto, @CurrentUser() currentUser: User) {
    return this.facilitiesService.approve(id, currentUser.id, approveDto.comment);
  }

  @Post(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reject facility (Admin only)' })
  @ApiResponse({ status: 200, description: 'Facility rejected successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 400, description: 'Facility is not pending approval' })
  reject(@Param('id') id: string, @Body() rejectDto: ApproveFacilityDto, @CurrentUser() currentUser: User) {
    return this.facilitiesService.reject(id, currentUser.id, rejectDto.comment);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete facility' })
  @ApiResponse({ status: 200, description: 'Facility deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Can only delete own facilities' })
  remove(@Param('id') id: string, @CurrentUser() currentUser: User) {
    return this.facilitiesService.remove(id, currentUser);
  }
}
