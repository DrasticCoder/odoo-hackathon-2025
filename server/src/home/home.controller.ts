import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HomeService } from './home.service';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Home')
@Controller('api')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Get('venues/popular')
  @Public()
  @ApiOperation({ summary: 'Get popular venues' })
  @ApiResponse({ status: 200, description: 'Popular venues retrieved successfully' })
  getPopularVenues(@Query('limit') limit?: string) {
    const limitNumber = limit ? parseInt(limit, 10) : 6;
    return this.homeService.getPopularVenues(limitNumber);
  }

  @Get('sports/popular')
  @Public()
  @ApiOperation({ summary: 'Get popular sports' })
  @ApiResponse({ status: 200, description: 'Popular sports retrieved successfully' })
  getPopularSports() {
    return this.homeService.getPopularSports();
  }

  @Get('home')
  @Public()
  @ApiOperation({ summary: 'Get home page data' })
  @ApiResponse({ status: 200, description: 'Home page data retrieved successfully' })
  getHomePageData() {
    return this.homeService.getHomePageData();
  }
}
