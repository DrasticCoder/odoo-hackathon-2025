import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UniversalSearchDto, SearchEntity, SearchResultItem, UniversalSearchResponseDto } from './dto/search.dto';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async universalSearch(searchDto: UniversalSearchDto): Promise<UniversalSearchResponseDto> {
    const startTime = Date.now();
    const { q, entities = Object.values(SearchEntity), limit = 5 } = searchDto;

    const results: { [key in SearchEntity]?: SearchResultItem[] } = {};
    let totalResults = 0;

    // Search in parallel for better performance
    const searchPromises = entities.map(async (entity) => {
      const entityResults = await this.searchInEntity(entity, q, limit);
      if (entityResults.length > 0) {
        results[entity] = entityResults;
        totalResults += entityResults.length;
      }
    });

    await Promise.all(searchPromises);

    const executionTime = Date.now() - startTime;

    return {
      query: q,
      results,
      totalResults,
      executionTime,
      suggestions: this.generateSuggestions(q, totalResults),
    };
  }

  private async searchInEntity(entity: SearchEntity, query: string, limit: number): Promise<SearchResultItem[]> {
    const searchTerm = query.toLowerCase();

    switch (entity) {
      case SearchEntity.FACILITIES:
        return this.searchFacilities(searchTerm, limit);

      case SearchEntity.COURTS:
        return this.searchCourts(searchTerm, limit);

      case SearchEntity.USERS:
        return this.searchUsers(searchTerm, limit);

      case SearchEntity.REVIEWS:
        return this.searchReviews(searchTerm, limit);

      case SearchEntity.MATCHES:
        return this.searchMatches(searchTerm, limit);

      default:
        return [];
    }
  }

  private async searchFacilities(query: string, limit: number): Promise<SearchResultItem[]> {
    const facilities = await this.prisma.facility.findMany({
      where: {
        AND: [
          { status: 'APPROVED' },
          {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
              { address: { contains: query, mode: 'insensitive' } },
              { shortLocation: { contains: query, mode: 'insensitive' } },
              { about: { contains: query, mode: 'insensitive' } },
            ],
          },
        ],
      },
      include: {
        owner: {
          select: { name: true },
        },
        photos: {
          select: { url: true },
          take: 1,
        },
        _count: {
          select: {
            courts: true,
            reviews: true,
          },
        },
      },
      take: limit,
      orderBy: {
        avgRating: 'desc',
      },
    });

    return facilities.map((facility) => ({
      id: facility.id,
      type: SearchEntity.FACILITIES,
      title: facility.name,
      description: `${facility.shortLocation || facility.address} • ${facility._count.courts} courts • ${facility._count.reviews} reviews`,
      imageUrl: facility.photos[0]?.url || undefined,
      metadata: {
        rating: facility.avgRating,
        owner: facility.owner.name,
        courtsCount: facility._count.courts,
        reviewsCount: facility._count.reviews,
        address: facility.address,
        status: facility.status,
      },
      url: `/facilities/${facility.id}`,
      score: this.calculateRelevanceScore(query, facility.name, facility.description),
    }));
  }

  private async searchCourts(query: string, limit: number): Promise<SearchResultItem[]> {
    const courts = await this.prisma.court.findMany({
      where: {
        AND: [
          { isActive: true },
          { status: 'APPROVED' },
          { facility: { status: 'APPROVED' } },
          {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { sportType: { contains: query, mode: 'insensitive' } },
              { facility: { name: { contains: query, mode: 'insensitive' } } },
              { facility: { address: { contains: query, mode: 'insensitive' } } },
            ],
          },
        ],
      },
      include: {
        facility: {
          select: {
            name: true,
            shortLocation: true,
            address: true,
          },
        },
        photos: {
          select: { url: true },
          take: 1,
        },
        _count: {
          select: {
            bookings: true,
          },
        },
      },
      take: limit,
      orderBy: {
        pricePerHour: 'asc',
      },
    });

    return courts.map((court) => ({
      id: court.id,
      type: SearchEntity.COURTS,
      title: `${court.name} (${court.sportType})`,
      description: `${court.facility.name} • $${court.pricePerHour}/hour • ${court._count.bookings} bookings`,
      imageUrl: court.photos[0]?.url || undefined,
      metadata: {
        sportType: court.sportType,
        pricePerHour: court.pricePerHour,
        facility: court.facility.name,
        facilityLocation: court.facility.shortLocation || court.facility.address,
        bookingsCount: court._count.bookings,
        isActive: court.isActive,
      },
      url: `/courts/${court.id}`,
      score: this.calculateRelevanceScore(query, court.name, court.sportType),
    }));
  }

  private async searchUsers(query: string, limit: number): Promise<SearchResultItem[]> {
    const users = await this.prisma.user.findMany({
      where: {
        AND: [
          { isActive: true },
          { isVerified: true },
          {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { email: { contains: query, mode: 'insensitive' } },
            ],
          },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            facilities: true,
            reviews: true,
            bookings: true,
          },
        },
      },
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return users.map((user) => ({
      id: user.id,
      type: SearchEntity.USERS,
      title: user.name || 'Unknown User',
      description: `${user.role.toLowerCase()} • ${user._count.facilities} facilities • ${user._count.reviews} reviews`,
      imageUrl: user.avatarUrl || undefined,
      metadata: {
        email: user.email,
        role: user.role,
        facilitiesCount: user._count.facilities,
        reviewsCount: user._count.reviews,
        bookingsCount: user._count.bookings,
        joinedAt: user.createdAt,
      },
      url: `/users/${user.id}`,
      score: this.calculateRelevanceScore(query, user.name, user.email),
    }));
  }

  private async searchReviews(query: string, limit: number): Promise<SearchResultItem[]> {
    const reviews = await this.prisma.review.findMany({
      where: {
        AND: [
          { isApproved: true },
          {
            OR: [
              { comment: { contains: query, mode: 'insensitive' } },
              { user: { name: { contains: query, mode: 'insensitive' } } },
              { facility: { name: { contains: query, mode: 'insensitive' } } },
            ],
          },
        ],
      },
      include: {
        user: {
          select: {
            name: true,
            avatarUrl: true,
          },
        },
        facility: {
          select: {
            name: true,
            shortLocation: true,
          },
        },
      },
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return reviews.map((review) => ({
      id: review.id,
      type: SearchEntity.REVIEWS,
      title: `Review by ${review.user.name || 'Anonymous'}`,
      description: `${review.rating}/5 stars for ${review.facility.name} • ${review.comment?.substring(0, 100)}${review.comment && review.comment.length > 100 ? '...' : ''}`,
      imageUrl: review.user.avatarUrl || undefined,
      metadata: {
        rating: review.rating,
        facilityName: review.facility.name,
        facilityLocation: review.facility.shortLocation,
        userName: review.user.name,
        comment: review.comment,
        createdAt: review.createdAt,
      },
      url: `/reviews/${review.id}`,
      score: this.calculateRelevanceScore(query, review.comment, review.facility.name),
    }));
  }

  private async searchMatches(query: string, limit: number): Promise<SearchResultItem[]> {
    const matches = await this.prisma.match.findMany({
      where: {
        AND: [
          { status: { in: ['OPEN', 'ONGOING'] } },
          {
            OR: [
              { sportType: { contains: query, mode: 'insensitive' } },
              { creator: { name: { contains: query, mode: 'insensitive' } } },
            ],
          },
        ],
      },
      include: {
        creator: {
          select: {
            name: true,
            avatarUrl: true,
          },
        },
      },
      take: limit,
      orderBy: {
        dateTime: 'asc',
      },
    });

    return matches.map((match) => ({
      id: match.id,
      type: SearchEntity.MATCHES,
      title: `${match.sportType} Match`,
      description: `Created by ${match.creator?.name || 'Unknown'} • ${match.participants.length}/${match.maxPlayers} players • ${new Date(match.dateTime).toLocaleDateString()}`,
      imageUrl: match.creator?.avatarUrl || undefined,
      metadata: {
        sportType: match.sportType,
        creatorName: match.creator?.name,
        currentPlayers: match.participants.length,
        maxPlayers: match.maxPlayers,
        dateTime: match.dateTime,
        status: match.status,
      },
      url: `/matches/${match.id}`,
      score: this.calculateRelevanceScore(query, match.sportType, match.creator?.name),
    }));
  }

  private calculateRelevanceScore(query: string, ...fields: (string | null | undefined)[]): number {
    const normalizedQuery = query.toLowerCase();
    let score = 0;

    fields.forEach((field, index) => {
      if (!field) return;
      const normalizedField = field.toLowerCase();
      // Exact match gets highest score
      if (normalizedField === normalizedQuery) {
        score += 100 - index * 10;
      }
      // Starts with query gets high score
      else if (normalizedField.startsWith(normalizedQuery)) {
        score += 80 - index * 10;
      }
      // Contains query gets medium score
      else if (normalizedField.includes(normalizedQuery)) {
        score += 60 - index * 10;
      }
      // Word boundary match gets lower score
      else if (new RegExp(`\\b${normalizedQuery}`, 'i').test(normalizedField)) {
        score += 40 - index * 10;
      }
    });
    return Math.max(score, 0);
  }

  private generateSuggestions(query: string, totalResults: number): string[] {
    if (totalResults > 0) return [];
    const suggestions: string[] = [];
    // Common sport types
    const sportTypes = ['basketball', 'tennis', 'football', 'soccer', 'badminton', 'volleyball'];
    const queryLower = query.toLowerCase();
    sportTypes.forEach((sport) => {
      if (sport.includes(queryLower) || queryLower.includes(sport)) {
        suggestions.push(sport);
      }
    });
    // Location-based suggestions
    if (queryLower.includes('near') || queryLower.includes('location')) {
      suggestions.push('Try searching with a specific city or area name');
    }
    // Generic suggestions
    if (suggestions.length === 0) {
      suggestions.push(
        'Try using different keywords',
        'Check your spelling',
        'Use more general terms',
        'Try searching for sport types like "basketball" or "tennis"',
      );
    }
    return suggestions.slice(0, 3);
  }
}
