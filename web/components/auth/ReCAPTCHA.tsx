'use client';

import { useRef, forwardRef, useImperativeHandle } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

export interface ReCAPTCHAHandle {
  executeRecaptcha: () => Promise<string | null>;
  resetRecaptcha: () => void;
}

interface ReCAPTCHAComponentProps {
  onVerify?: (token: string | null) => void;
  onExpired?: () => void;
  onError?: () => void;
  size?: 'compact' | 'normal';
  theme?: 'light' | 'dark';
  className?: string;
}

const ReCAPTCHAComponent = forwardRef<ReCAPTCHAHandle, ReCAPTCHAComponentProps>(
  ({ onVerify, onExpired, onError, size = 'normal', theme = 'light', className }, ref) => {
    const recaptchaRef = useRef<ReCAPTCHA>(null);
    const siteKey = process.env.NEXT_PUBLIC_GOOGLE_RECAPTCHA_SITE_KEY;

    useImperativeHandle(ref, () => ({
      executeRecaptcha: async (): Promise<string | null> => {
        if (!recaptchaRef.current) {
          console.error('ReCAPTCHA not initialized');
          return null;
        }

        try {
          const token = await recaptchaRef.current.executeAsync();
          return token;
        } catch (error) {
          console.error('ReCAPTCHA execution failed:', error);
          return null;
        }
      },
      resetRecaptcha: () => {
        if (recaptchaRef.current) {
          recaptchaRef.current.reset();
        }
      },
    }));

    const handleVerify = (token: string | null) => {
      onVerify?.(token);
    };

    const handleExpired = () => {
      onExpired?.();
    };

    const handleError = () => {
      onError?.();
    };

    if (!siteKey) {
      console.error('Google reCAPTCHA site key is not configured');
      return (
        <div className='rounded border border-red-200 p-2 text-sm text-red-500'>
          reCAPTCHA configuration error. Please contact support.
        </div>
      );
    }

    return (
      <div className={className}>
        <ReCAPTCHA
          ref={recaptchaRef}
          sitekey={siteKey}
          onChange={handleVerify}
          onExpired={handleExpired}
          onError={handleError}
          size={size}
          theme={theme}
        />
      </div>
    );
  }
);

ReCAPTCHAComponent.displayName = 'ReCAPTCHAComponent';

export default ReCAPTCHAComponent;
