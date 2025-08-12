import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { UniversalSearchDto, UniversalSearchResponseDto } from './dto/search.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('universal')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Universal search across all entities' })
  @ApiResponse({
    status: 200,
    description: 'Search results',
    type: UniversalSearchResponseDto,
  })
  async universalSearch(@Query() searchDto: UniversalSearchDto): Promise<UniversalSearchResponseDto> {
    return this.searchService.universalSearch(searchDto);
  }
}
