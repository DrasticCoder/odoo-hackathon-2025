import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto, UserQueryDto } from './dto/user.dto';
import { createPaginationMeta, PaginationOptions } from '../common/dto/pagination.dto';
import { UserRole, Prisma, User } from 'prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        role: createUserDto.role || UserRole.USER,
      },
    });

    return this.sanitizeUser(user);
  }

  async findAll(query: UserQueryDto) {
    const { page = 1, limit = 20, q, sort, role, isActive, isVerified } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {};

    if (role) where.role = role;
    if (isActive !== undefined) where.isActive = isActive;
    if (isVerified !== undefined) where.isVerified = isVerified;

    if (q) {
      where.OR = [{ name: { contains: q, mode: 'insensitive' } }, { email: { contains: q, mode: 'insensitive' } }];
    }

    const orderBy = this.buildOrderBy(sort);

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          email: true,
          name: true,
          avatarUrl: true,
          role: true,
          isVerified: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    const meta = createPaginationMeta(total, page, limit);
    return { data: users, meta };
  }

  async findOne(id: string, includeStats = false) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: includeStats
        ? {
            facilities: { select: { id: true } },
            bookings: { select: { id: true } },
            reviews: { select: { id: true } },
            _count: {
              select: {
                facilities: true,
                bookings: true,
                reviews: true,
              },
            },
          }
        : undefined,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.sanitizeUser(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto, currentUser: Pick<User, 'id' | 'role'>) {
    const user = await this.findOne(id);

    if (currentUser.id !== id && currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only update your own profile');
    }

    if (currentUser.role !== UserRole.ADMIN) {
      delete updateUserDto.role;
      delete updateUserDto.isActive;
      delete updateUserDto.isVerified;
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });

    return this.sanitizeUser(updatedUser);
  }

  async ban(id: string, reason?: string) {
    const user = await this.findOne(id);

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    // TODO:create admin action record- vansh

    return this.sanitizeUser(updatedUser);
  }

  async unban(id: string) {
    const user = await this.findOne(id);

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { isActive: true },
    });

    // TODO:create admin action record- vansh

    return this.sanitizeUser(updatedUser);
  }

  async remove(id: string) {
    const user = await this.findOne(id);
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    return this.sanitizeUser(updatedUser);
  }

  private sanitizeUser<T extends { passwordHash?: string | null }>(user: T): Omit<T, 'passwordHash'> {
    const { passwordHash, ...sanitized } = user;
    return sanitized;
  }

  private buildOrderBy(sort?: string) {
    if (!sort) return { createdAt: 'desc' as const };

    const [field, direction = 'asc'] = sort.split(',');
    return { [field]: direction as 'asc' | 'desc' };
  }
}
