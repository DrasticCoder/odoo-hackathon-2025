import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, UserQueryDto, UserResponseDto, BanUserDto } from './dto/user.dto';
import { PaginatedResponseDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/user.decorator';
import { UserRole, User } from 'prisma/client';

@ApiTags('Users')
@Controller('api/users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Current User Profile Endpoints
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully', type: UserResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getCurrentUser(@CurrentUser() currentUser: User) {
    return this.usersService.findOne(currentUser.id, true);
  }

  @Patch('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'User profile updated successfully', type: UserResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  updateCurrentUser(@Body() updateUserDto: UpdateUserDto, @CurrentUser() currentUser: User) {
    return this.usersService.update(currentUser.id, updateUserDto, currentUser);
  }

  @Post('me/avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload user avatar' })
  @ApiResponse({ status: 200, description: 'Avatar uploaded successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async uploadAvatar(@UploadedFile() file: Express.Multer.File, @CurrentUser() currentUser: User) {
    if (!file) {
      throw new Error('No file uploaded');
    }
    return this.usersService.uploadAvatar(currentUser.id, file);
  }

  @Get('me/bookings')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user bookings' })
  @ApiResponse({ status: 200, description: 'User bookings retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getMyBookings(
    @Query()
    query: { page?: number; limit?: number; status?: string; dateFrom?: string; dateTo?: string; sort?: string },
    @CurrentUser() currentUser: User,
  ) {
    return this.usersService.getUserBookings(currentUser.id, query);
  }

  @Get('me/bookings/:bookingId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get specific user booking' })
  @ApiResponse({ status: 200, description: 'Booking retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  getMyBooking(@Param('bookingId') bookingId: string, @CurrentUser() currentUser: User) {
    return this.usersService.getUserBooking(currentUser.id, bookingId);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new user (Admin only)' })
  @ApiResponse({ status: 201, description: 'User created successfully', type: UserResponseDto })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
    type: PaginatedResponseDto<UserResponseDto>,
  })
  findAll(@Query() query: UserQueryDto) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User found', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  findOne(@Param('id') id: string, @Query('include') include?: string, @CurrentUser() currentUser?: User) {
    const includeStats = include?.includes('stats');

    if (!currentUser || (currentUser.id !== id && currentUser.role !== UserRole.ADMIN)) {
      return this.usersService.findOne(id, false);
    }

    return this.usersService.findOne(id, includeStats);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: 200, description: 'User updated successfully', type: UserResponseDto })
  @ApiResponse({ status: 403, description: 'Forbidden - Can only update own profile' })
  @ApiResponse({ status: 404, description: 'User not found' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @CurrentUser() currentUser: User) {
    return this.usersService.update(id, updateUserDto, currentUser);
  }

  @Post(':id/ban')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ban user (Admin only)' })
  @ApiResponse({ status: 200, description: 'User banned successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  ban(@Param('id') id: string, @Body() banUserDto: BanUserDto) {
    return this.usersService.ban(id, banUserDto.reason);
  }

  @Post(':id/unban')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unban user (Admin only)' })
  @ApiResponse({ status: 200, description: 'User unbanned successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  unban(@Param('id') id: string) {
    return this.usersService.unban(id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete user (Admin only)' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
