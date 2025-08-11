'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthService } from '@/services/auth.service';
import { useAuthStore } from '@/store';
import { otpSchema, verifyOtpSchema, OtpFormData, VerifyOtpFormData } from '@/validations';
import { UserRole } from '@/types/auth.type';

export default function OtpLoginPage() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [showOTP, setShowOTP] = React.useState(false);
  const [resendTimer, setResendTimer] = React.useState(0);
  const router = useRouter();
  const { login } = useAuthStore();

  const form = useForm<VerifyOtpFormData>({
    resolver: zodResolver(showOTP ? verifyOtpSchema : otpSchema),
    defaultValues: {
      email: '',
      otp: '',
    },
  });

  const startResendTimer = () => {
    setResendTimer(60);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOTP = async (email: string) => {
    setIsLoading(true);
    const result = await AuthService.sendOtp({ email });
    setIsLoading(false);

    if (result.error) {
      if (result.error.status === 404) {
        toast.error('Email not found. Please sign up first.');
      } else {
        toast.error(result.error.message || 'Failed to send OTP');
      }
      return false;
    }

    toast.success('OTP sent successfully');
    startResendTimer();
    return true;
  };

  async function onSubmit(values: VerifyOtpFormData) {
    if (!showOTP) {
      const success = await handleSendOTP(values.email);
      if (success) {
        setShowOTP(true);
      }
      return;
    }

    setIsLoading(true);
    const result = await AuthService.verifyOtp(values);

    if (result.error) {
      if (result.error.status === 401) {
        if (result.error.message?.includes('expired')) {
          toast.error('OTP has expired. Please request a new one.');
        } else {
          toast.error('Invalid OTP. Please check the code and try again.');
        }
      } else {
        toast.error(result.error.message || 'Verification failed');
      }
    } else if (result.data) {
      const { user, token } = result.data;
      login(user, token);
      toast.success('Logged in successfully');

      // Redirect based on user role
      switch (user.role) {
        case UserRole.ADMIN:
          router.push('/admin/dashboard');
          break;
        case UserRole.OWNER:
          router.push('/owner/dashboard');
          break;
        default:
          router.push('/venues');
          break;
      }
    }
    setIsLoading(false);
  }

  return (
    <div className='from-background/50 to-muted/30 flex min-h-screen w-full items-center justify-center bg-linear-to-br p-4'>
      <motion.div
        className='mx-auto w-full max-w-md'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <Card className='w-full shadow-none'>
          <CardHeader className='space-y-2 pb-6'>
            <CardTitle className='text-center text-2xl font-semibold'>Sign in with OTP</CardTitle>
            <CardDescription className='text-center text-sm'>
              {showOTP ? 'Enter the verification code sent to your email' : 'Enter your email to receive an OTP'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
                <FormField
                  control={form.control}
                  name='email'
                  render={({ field }) => (
                    <FormItem className='flex flex-col items-center space-y-2'>
                      <FormLabel>Email address</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='name@example.com'
                          {...field}
                          disabled={showOTP}
                          className='placeholder:text-center'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <AnimatePresence mode='wait'>
                  {showOTP && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className='space-y-4'
                    >
                      <FormField
                        control={form.control}
                        name='otp'
                        render={({ field }) => (
                          <FormItem className='flex flex-col items-center space-y-2'>
                            <FormLabel className='mb-3'>Verification code</FormLabel>
                            <FormControl>
                              <InputOTP value={field.value} onChange={field.onChange} maxLength={6}>
                                <InputOTPGroup>
                                  <InputOTPSlot index={0} />
                                  <InputOTPSlot index={1} />
                                  <InputOTPSlot index={2} />
                                  <InputOTPSlot index={3} />
                                  <InputOTPSlot index={4} />
                                  <InputOTPSlot index={5} />
                                </InputOTPGroup>
                              </InputOTP>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className='text-center'>
                        {resendTimer > 0 ? (
                          <p className='text-muted-foreground text-sm'>Resend code in {resendTimer}s</p>
                        ) : (
                          <Button
                            type='button'
                            variant='link'
                            className='h-auto p-0 text-sm'
                            onClick={() => handleSendOTP(form.getValues('email'))}
                            disabled={isLoading}
                          >
                            Resend verification code
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <Button type='submit' className='w-full shadow-xs' disabled={isLoading}>
                  {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                  {showOTP ? 'Verify code' : 'Send OTP'}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className='text-center'>
            <p className='text-sm text-gray-600'>
              Prefer password login?{' '}
              <Button variant='link' className='h-auto p-0' onClick={() => router.push('/auth/login')}>
                Sign in with password
              </Button>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
