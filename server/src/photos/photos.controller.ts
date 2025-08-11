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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { PhotosService } from './photos.service';
import { CreatePhotoDto, UpdatePhotoDto, PhotoResponseDto, UploadResponseDto } from './dto/photo.dto';
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

@ApiTags('Photos')
@Controller('api/photos')
export class PhotosController {
  constructor(private readonly photosService: PhotosService) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER, UserRole.OWNER, UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a photo' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        caption: {
          type: 'string',
          description: 'Photo caption',
        },
        facilityId: {
          type: 'string',
          description: 'Facility ID (if photo belongs to facility)',
        },
        courtId: {
          type: 'string',
          description: 'Court ID (if photo belongs to court)',
        },
        userId: {
          type: 'string',
          description: 'User ID (if photo belongs to user)',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Photo uploaded successfully', type: UploadResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid file or data' })
  @ApiResponse({ status: 403, description: 'Forbidden - Cannot upload to this entity' })
  async uploadPhoto(
    @UploadedFile() file: Express.Multer.File,
    @Body() createPhotoDto: CreatePhotoDto,
    @CurrentUser() currentUser: CurrentUser,
  ) {
    const photo = await this.photosService.uploadFile(file, createPhotoDto, currentUser);
    return {
      photo,
      message: 'Photo uploaded successfully',
    };
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get photos with optional filtering' })
  @ApiResponse({ status: 200, description: 'Photos retrieved successfully', type: [PhotoResponseDto] })
  findAll(
    @Query('facilityId') facilityId?: string,
    @Query('courtId') courtId?: string,
    @Query('userId') userId?: string,
  ) {
    return this.photosService.findAll(facilityId, courtId, userId);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get photo by ID' })
  @ApiResponse({ status: 200, description: 'Photo found', type: PhotoResponseDto })
  @ApiResponse({ status: 404, description: 'Photo not found' })
  findOne(@Param('id') id: string) {
    return this.photosService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER, UserRole.OWNER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update photo caption' })
  @ApiResponse({ status: 200, description: 'Photo updated successfully', type: PhotoResponseDto })
  @ApiResponse({ status: 403, description: 'Forbidden - Cannot update this photo' })
  @ApiResponse({ status: 404, description: 'Photo not found' })
  update(@Param('id') id: string, @Body() updatePhotoDto: UpdatePhotoDto, @CurrentUser() currentUser: CurrentUser) {
    return this.photosService.update(id, updatePhotoDto, currentUser);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER, UserRole.OWNER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete photo' })
  @ApiResponse({ status: 200, description: 'Photo deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Cannot delete this photo' })
  @ApiResponse({ status: 404, description: 'Photo not found' })
  remove(@Param('id') id: string, @CurrentUser() currentUser: CurrentUser) {
    return this.photosService.remove(id, currentUser);
  }
}
