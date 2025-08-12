'use client';

import Link from 'next/link';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className='bg-muted/30 border-t'>
      <div className='container mx-auto px-4 py-12'>
        <div className='grid grid-cols-1 gap-8 md:grid-cols-4'>
          {/* Brand */}
          <div className='space-y-4'>
            <Link href='/' className='flex items-center space-x-2'>
              <div className='bg-primary flex h-8 w-8 items-center justify-center rounded'>
                <span className='text-primary-foreground text-sm font-bold'>QC</span>
              </div>
              <span className='text-xl font-bold'>QuickCourt</span>
            </Link>
            <p className='text-muted-foreground text-sm'>
              Your ultimate destination for booking sports facilities and joining matches in your area.
            </p>
            <div className='flex space-x-4'>
              <Facebook className='text-muted-foreground hover:text-primary h-5 w-5 cursor-pointer' />
              <Twitter className='text-muted-foreground hover:text-primary h-5 w-5 cursor-pointer' />
              <Instagram className='text-muted-foreground hover:text-primary h-5 w-5 cursor-pointer' />
            </div>
          </div>

          {/* Quick Links */}
          <div className='space-y-4'>
            <h3 className='font-semibold'>Quick Links</h3>
            <div className='space-y-2'>
              <Link href='/venues' className='text-muted-foreground hover:text-primary block text-sm'>
                Find Venues
              </Link>
              <Link href='/matches' className='text-muted-foreground hover:text-primary block text-sm'>
                Join Matches
              </Link>
              <Link href='/about' className='text-muted-foreground hover:text-primary block text-sm'>
                About Us
              </Link>
              <Link href='/contact' className='text-muted-foreground hover:text-primary block text-sm'>
                Contact
              </Link>
            </div>
          </div>

          {/* For Owners */}
          <div className='space-y-4'>
            <h3 className='font-semibold'>For Owners</h3>
            <div className='space-y-2'>
              <Link href='/owner/signup' className='text-muted-foreground hover:text-primary block text-sm'>
                List Your Facility
              </Link>
              <Link href='/owner/login' className='text-muted-foreground hover:text-primary block text-sm'>
                Owner Login
              </Link>
              <Link href='/owner/dashboard' className='text-muted-foreground hover:text-primary block text-sm'>
                Owner Dashboard
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div className='space-y-4'>
            <h3 className='font-semibold'>Contact Info</h3>
            <div className='space-y-2'>
              <div className='text-muted-foreground flex items-center space-x-2 text-sm'>
                <Mail className='h-4 w-4' />
                <span>support@quickcourt.com</span>
              </div>
              <div className='text-muted-foreground flex items-center space-x-2 text-sm'>
                <Phone className='h-4 w-4' />
                <span>+91 98765 43210</span>
              </div>
              <div className='text-muted-foreground flex items-center space-x-2 text-sm'>
                <MapPin className='h-4 w-4' />
                <span>Mumbai, India</span>
              </div>
            </div>
          </div>
        </div>

        <div className='mt-8 border-t pt-8 text-center'>
          <p className='text-muted-foreground text-sm'>
            © 2024 QuickCourt. All rights reserved. Built for sports enthusiasts.
          </p>
        </div>
      </div>
    </footer>
  );
}
