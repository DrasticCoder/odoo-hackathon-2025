import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import {
  CreateBookingDto,
  UpdateBookingDto,
  BookingQueryDto,
  BookingResponseDto,
  PaymentDto,
  CancelBookingDto,
  BookingStatsDto,
} from './dto/booking.dto';
import { PaginatedResponseDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/user.decorator';
import { UserRole } from 'prisma/client';

@ApiTags('Bookings')
@Controller('api/bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @Roles(UserRole.USER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new booking' })
  @ApiResponse({ status: 201, description: 'Booking created successfully', type: BookingResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid booking data' })
  @ApiResponse({ status: 409, description: 'Conflict - Time slot already booked' })
  create(@Body() createBookingDto: CreateBookingDto, @CurrentUser() currentUser: { id: string; role: string }) {
    return this.bookingsService.create(createBookingDto, currentUser.id);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all bookings (role-based access)' })
  @ApiResponse({
    status: 200,
    description: 'Bookings retrieved successfully',
    type: PaginatedResponseDto<BookingResponseDto>,
  })
  findAll(@Query() query: BookingQueryDto, @CurrentUser() currentUser: { id: string; role: string }) {
    return this.bookingsService.findAll(query, currentUser);
  }

  @Get('stats')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get booking statistics' })
  @ApiResponse({ status: 200, description: 'Stats retrieved successfully', type: BookingStatsDto })
  getStats(@CurrentUser() currentUser: { id: string; role: string }, @Query('facilityId') facilityId?: string) {
    return this.bookingsService.getStats(currentUser, facilityId);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get booking by ID' })
  @ApiResponse({ status: 200, description: 'Booking found', type: BookingResponseDto })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Cannot access this booking' })
  findOne(@Param('id') id: string, @CurrentUser() currentUser: { id: string; role: string }) {
    return this.bookingsService.findOne(id, currentUser);
  }

  @Patch(':id')
  @Roles(UserRole.USER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update booking (pending bookings only)' })
  @ApiResponse({ status: 200, description: 'Booking updated successfully', type: BookingResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request - Cannot update non-pending booking' })
  @ApiResponse({ status: 403, description: 'Forbidden - Cannot update this booking' })
  update(
    @Param('id') id: string,
    @Body() updateBookingDto: UpdateBookingDto,
    @CurrentUser() currentUser: { id: string; role: string },
  ) {
    return this.bookingsService.update(id, updateBookingDto, currentUser);
  }

  @Post(':id/pay')
  @Roles(UserRole.USER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Process payment for booking' })
  @ApiResponse({ status: 200, description: 'Payment processed successfully', type: BookingResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request - Payment failed or booking not pending' })
  @ApiResponse({ status: 403, description: 'Forbidden - Cannot pay for this booking' })
  pay(
    @Param('id') id: string,
    @Body() paymentDto: PaymentDto,
    @CurrentUser() currentUser: { id: string; role: string },
  ) {
    return this.bookingsService.pay(id, paymentDto, currentUser);
  }

  @Post(':id/cancel')
  @Roles(UserRole.USER, UserRole.OWNER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel booking' })
  @ApiResponse({ status: 200, description: 'Booking cancelled successfully', type: BookingResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request - Cannot cancel this booking' })
  @ApiResponse({ status: 403, description: 'Forbidden - Cannot cancel this booking' })
  cancel(
    @Param('id') id: string,
    @Body() cancelDto: CancelBookingDto,
    @CurrentUser() currentUser: { id: string; role: string },
  ) {
    return this.bookingsService.cancel(id, cancelDto.reason || 'No reason provided', currentUser);
  }
}
