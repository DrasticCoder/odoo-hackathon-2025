import { Injectable, BadRequestException } from '@nestjs/common';
import axios from 'axios';

interface RecaptchaVerificationResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
  score?: number;
  action?: string;
}

@Injectable()
export class RecaptchaService {
  private readonly secretKey = process.env.GOOGLE_RECAPTCHA_SECRET_KEY;
  private readonly verifyUrl = 'https://www.google.com/recaptcha/api/siteverify';

  async verifyRecaptcha(token: string, remoteIp?: string): Promise<boolean> {
    if (!this.secretKey) {
      throw new BadRequestException('reCAPTCHA secret key is not configured');
    }

    if (!token) {
      throw new BadRequestException('reCAPTCHA token is required');
    }

    try {
      const response = await axios.post<RecaptchaVerificationResponse>(
        this.verifyUrl,
        new URLSearchParams({
          secret: this.secretKey,
          response: token,
          ...(remoteIp && { remoteip: remoteIp }),
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      const { success, 'error-codes': errorCodes } = response.data;

      if (!success) {
        console.error('reCAPTCHA verification failed:', errorCodes);
        throw new BadRequestException(`reCAPTCHA verification failed: ${errorCodes?.join(', ') || 'Unknown error'}`);
      }

      return true;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      console.error('Error verifying reCAPTCHA:', error);
      throw new BadRequestException('Failed to verify reCAPTCHA');
    }
  }
}
