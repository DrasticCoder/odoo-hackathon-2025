import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsEnum, IsOptional, MinLength } from 'class-validator';
import { UserRole } from 'prisma/client';

export class GoogleAuthDto {
  @ApiProperty({ description: 'The ID token from Google' })
  @IsString()
  idToken: string;
}

export class OtpAuthDto {
  @ApiProperty({ description: 'User email address' })
  @IsEmail()
  email: string;
}

export class VerifyOtpDto {
  @ApiProperty({ description: 'User email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'OTP code received via email' })
  @IsString()
  otp: string;
}

export class SignUpDto {
  @ApiProperty({ description: 'User email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'User password', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ description: 'User full name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'User role', enum: UserRole, default: UserRole.USER })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @ApiProperty({ description: 'User avatar URL', required: false })
  @IsString()
  @IsOptional()
  avatarUrl?: string;
}

export class LoginDto {
  @ApiProperty({ description: 'User email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'User password' })
  @IsString()
  password: string;

  @ApiProperty({ description: 'Google reCAPTCHA token' })
  @IsString()
  recaptchaToken: string;
}
