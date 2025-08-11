import { Body, Controller, Post, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleAuthDto, OtpAuthDto, VerifyOtpDto, SignUpDto, LoginDto } from './dto/auth.dto';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/user.decorator';
import { RequestUser } from './dto/request-user.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('/api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @Public()
  @ApiOperation({ summary: 'Register a new user with email and password' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @Post('login')
  @Public()
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('google')
  @Public()
  @ApiOperation({ summary: 'Authenticate with Google OAuth' })
  @ApiResponse({ status: 200, description: 'Google authentication successful' })
  @ApiResponse({ status: 401, description: 'Invalid Google token' })
  async googleAuth(@Body() body: GoogleAuthDto) {
    return this.authService.handleGoogleAuth(body.idToken);
  }

  @Post('otp')
  @Public()
  @ApiOperation({ summary: 'Send OTP to email for authentication' })
  @ApiResponse({ status: 200, description: 'OTP sent successfully' })
  async otpAuth(@Body() body: OtpAuthDto) {
    return this.authService.handleOtpAuth(body.email);
  }

  @Post('otp/verify')
  @Public()
  @ApiOperation({ summary: 'Verify OTP and authenticate user' })
  @ApiResponse({ status: 200, description: 'OTP verification successful' })
  @ApiResponse({ status: 401, description: 'Invalid or expired OTP' })
  async verifyOtp(@Body() body: VerifyOtpDto) {
    return this.authService.verifyOtp(body.email, body.otp);
  }

  @Post('otp/resend')
  @Public()
  @ApiOperation({ summary: 'Resend verification OTP' })
  @ApiResponse({ status: 200, description: 'Verification OTP sent successfully' })
  @ApiResponse({ status: 401, description: 'User not found' })
  @ApiResponse({ status: 409, description: 'User already verified' })
  async resendVerificationOtp(@Body() body: OtpAuthDto) {
    return this.authService.resendVerificationOtp(body.email);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user information' })
  @ApiResponse({ status: 200, description: 'User information retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  getMe(@CurrentUser() user: RequestUser) {
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        role: user.role,
        isVerified: user.isVerified,
        isActive: user.isActive,
      },
    };
  }
}
