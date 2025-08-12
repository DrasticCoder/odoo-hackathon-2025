import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsArray, ArrayUnique } from 'class-validator';

export enum SearchEntity {
  FACILITIES = 'facilities',
  COURTS = 'courts',
  USERS = 'users',
  REVIEWS = 'reviews',
  MATCHES = 'matches',
}

export class UniversalSearchDto {
  @ApiProperty({ description: 'Search query', required: true })
  @IsString()
  q: string;

  @ApiProperty({
    description: 'Entity types to search in',
    enum: SearchEntity,
    isArray: true,
    required: false,
    default: Object.values(SearchEntity),
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsEnum(SearchEntity, { each: true })
  entities?: SearchEntity[] = Object.values(SearchEntity);

  @ApiProperty({ description: 'Maximum results per entity type', default: 5, required: false })
  @IsOptional()
  limit?: number = 5;
}

export class SearchResultItem {
  @ApiProperty({ description: 'Unique identifier' })
  id: string;

  @ApiProperty({ description: 'Entity type' })
  type: SearchEntity;

  @ApiProperty({ description: 'Display title' })
  title: string;

  @ApiProperty({ description: 'Description or subtitle' })
  description?: string;

  @ApiProperty({ description: 'Image URL if available' })
  imageUrl?: string;

  @ApiProperty({ description: 'Additional metadata' })
  metadata?: Record<string, unknown>;

  @ApiProperty({ description: 'Deep link URL' })
  url?: string;

  @ApiProperty({ description: 'Search relevance score' })
  score?: number;
}

export class UniversalSearchResponseDto {
  @ApiProperty({ description: 'Search query used' })
  query: string;

  @ApiProperty({ description: 'Search results grouped by entity type' })
  results: {
    [key in SearchEntity]?: SearchResultItem[];
  };

  @ApiProperty({ description: 'Total number of results across all entities' })
  totalResults: number;

  @ApiProperty({ description: 'Search execution time in milliseconds' })
  executionTime: number;

  @ApiProperty({ description: 'Suggested queries for no results or better results' })
  suggestions?: string[];
}
