import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreatePhotoDto {
  @ApiProperty({ description: 'Photo URL' })
  @IsString()
  url: string;

  @ApiProperty({ description: 'Photo caption', required: false })
  @IsOptional()
  @IsString()
  caption?: string;

  @ApiProperty({ description: 'Facility ID (if photo belongs to facility)', required: false })
  @IsOptional()
  @IsString()
  facilityId?: string;

  @ApiProperty({ description: 'Court ID (if photo belongs to court)', required: false })
  @IsOptional()
  @IsString()
  courtId?: string;

  @ApiProperty({ description: 'User ID (if photo belongs to user)', required: false })
  @IsOptional()
  @IsString()
  userId?: string;
}

export class UpdatePhotoDto {
  @ApiProperty({ description: 'Photo caption', required: false })
  @IsOptional()
  @IsString()
  caption?: string;
}

export class PhotoResponseDto {
  @ApiProperty({ description: 'Photo ID' })
  id: string;

  @ApiProperty({ description: 'Photo URL' })
  url: string;

  @ApiProperty({ description: 'Photo caption' })
  caption: string | null;

  @ApiProperty({ description: 'Facility ID' })
  facilityId: string | null;

  @ApiProperty({ description: 'Court ID' })
  courtId: string | null;

  @ApiProperty({ description: 'User ID' })
  userId: string | null;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;
}

export class UploadResponseDto {
  @ApiProperty({ description: 'Uploaded photo details', type: PhotoResponseDto })
  photo: PhotoResponseDto;

  @ApiProperty({ description: 'Upload success message' })
  message: string;
}
