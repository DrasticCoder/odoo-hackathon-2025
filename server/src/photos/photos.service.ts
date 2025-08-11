import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePhotoDto, UpdatePhotoDto } from './dto/photo.dto';
import { UserRole } from 'prisma/client';
import * as path from 'path';
import * as fs from 'fs/promises';

interface CurrentUser {
  id: string;
  role: string;
}

@Injectable()
export class PhotosService {
  private readonly uploadPath = 'uploads';

  constructor(private prisma: PrismaService) {
    void this.ensureUploadDirectory();
  }

  private async ensureUploadDirectory() {
    try {
      await fs.access(this.uploadPath);
    } catch {
      await fs.mkdir(this.uploadPath, { recursive: true });
    }
  }

  async uploadFile(file: Express.Multer.File, createPhotoDto: CreatePhotoDto, currentUser: CurrentUser) {
    // Validate file
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Only image files are allowed (JPEG, PNG, WebP)');
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new BadRequestException('File size must be less than 5MB');
    }

    // Check permissions
    await this.validateUploadPermissions(createPhotoDto, currentUser);

    // Generate unique filename
    const fileExtension = path.extname(file.originalname);
    const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${fileExtension}`;
    const filePath = path.join(this.uploadPath, fileName);

    // Save file
    await fs.writeFile(filePath, file.buffer);

    // Create photo record
    const photo = await this.prisma.photo.create({
      data: {
        url: `/uploads/${fileName}`, // Relative URL
        caption: createPhotoDto.caption,
        facilityId: createPhotoDto.facilityId,
        courtId: createPhotoDto.courtId,
        userId: createPhotoDto.userId,
      },
    });

    return photo;
  }

  async findAll(facilityId?: string, courtId?: string, userId?: string) {
    const where: { facilityId?: string; courtId?: string; userId?: string } = {};
    if (facilityId) where.facilityId = facilityId;
    if (courtId) where.courtId = courtId;
    if (userId) where.userId = userId;

    return this.prisma.photo.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const photo = await this.prisma.photo.findUnique({
      where: { id },
    });

    if (!photo) {
      throw new NotFoundException('Photo not found');
    }

    return photo;
  }

  async update(id: string, updatePhotoDto: UpdatePhotoDto, currentUser: CurrentUser) {
    const photo = await this.findOne(id);

    // Check permissions
    await this.validateUpdatePermissions(photo, currentUser);

    const updatedPhoto = await this.prisma.photo.update({
      where: { id },
      data: updatePhotoDto,
    });

    return updatedPhoto;
  }

  async remove(id: string, currentUser: CurrentUser) {
    const photo = await this.findOne(id);

    // Check permissions
    await this.validateUpdatePermissions(photo, currentUser);

    // Delete file from filesystem
    try {
      const fullPath = path.join(process.cwd(), photo.url);
      await fs.unlink(fullPath);
    } catch (error) {
      // Log error but don't fail the operation
      console.error('Failed to delete file:', error);
    }

    // Delete photo record
    await this.prisma.photo.delete({
      where: { id },
    });

    return { message: 'Photo deleted successfully' };
  }

  private async validateUploadPermissions(createPhotoDto: CreatePhotoDto, currentUser: CurrentUser) {
    // Check if user is uploading to their own profile
    if (createPhotoDto.userId && createPhotoDto.userId !== currentUser.id) {
      if (currentUser.role !== UserRole.ADMIN) {
        throw new ForbiddenException('You can only upload photos to your own profile');
      }
    }

    // Check facility ownership
    if (createPhotoDto.facilityId) {
      const facility = await this.prisma.facility.findUnique({
        where: { id: createPhotoDto.facilityId },
      });

      if (!facility) {
        throw new NotFoundException('Facility not found');
      }

      if (facility.ownerId !== currentUser.id && currentUser.role !== UserRole.ADMIN) {
        throw new ForbiddenException('You can only upload photos to your own facilities');
      }
    }

    // Check court ownership (through facility)
    if (createPhotoDto.courtId) {
      const court = await this.prisma.court.findUnique({
        where: { id: createPhotoDto.courtId },
        include: { facility: true },
      });

      if (!court) {
        throw new NotFoundException('Court not found');
      }

      if (court.facility.ownerId !== currentUser.id && currentUser.role !== UserRole.ADMIN) {
        throw new ForbiddenException('You can only upload photos to courts in your own facilities');
      }
    }
  }

  private async validateUpdatePermissions(
    photo: { id: string; userId?: string | null; facilityId?: string | null; courtId?: string | null },
    currentUser: CurrentUser,
  ) {
    // Admin can update any photo
    if (currentUser.role === UserRole.ADMIN) {
      return;
    }

    // Check user photo ownership
    if (photo.userId && photo.userId !== currentUser.id) {
      throw new ForbiddenException('You can only update your own photos');
    }

    // Check facility photo ownership
    if (photo.facilityId) {
      const facility = await this.prisma.facility.findUnique({
        where: { id: photo.facilityId },
      });

      if (facility && facility.ownerId !== currentUser.id) {
        throw new ForbiddenException('You can only update photos of your own facilities');
      }
    }

    // Check court photo ownership
    if (photo.courtId) {
      const court = await this.prisma.court.findUnique({
        where: { id: photo.courtId },
        include: { facility: true },
      });

      if (court && court.facility.ownerId !== currentUser.id) {
        throw new ForbiddenException('You can only update photos of courts in your own facilities');
      }
    }
  }
}
