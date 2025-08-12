import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { Poppins } from 'next/font/google';
import Loading from './loading';
import { Suspense } from 'react';
import Providers from './providers';
import ChatBot from '@/components/common/ChatBot';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
  title: 'QuickCourt - Sports Facility Booking',
  description: 'Book your favorite sports facilities with ease',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className={`antialiased ${poppins.className}`}>
        <Suspense fallback={<Loading />}>
          <Providers>
            <Toaster duration={2500} richColors closeButton position='top-right' />
            {children}
            <ChatBot />
          </Providers>
        </Suspense>
      </body>
    </html>
  );
}
