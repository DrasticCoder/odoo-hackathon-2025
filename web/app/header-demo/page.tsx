'use client';

import UserHeader from '@/components/UserHeader';
import { useLocationStore } from '@/store/location.store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function HeaderDemoPage() {
  const { selectedLocation, setLocation, clearLocation } = useLocationStore();

  return (
    <div className='bg-background min-h-screen'>
      <UserHeader />

      <div className='container mx-auto px-4 py-8'>
        <div className='mx-auto max-w-4xl space-y-6'>
          <div className='text-center'>
            <h1 className='text-foreground mb-2 text-3xl font-bold'>UserHeader Component Demo</h1>
            <p className='text-muted-foreground'>
              This page demonstrates the functionality of the UserHeader component
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Location Store Demo</CardTitle>
              <CardDescription>The selected location is stored in a persistent Zustand store</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-center space-x-4'>
                <span className='text-sm font-medium'>Current Location:</span>
                <span className='bg-primary/10 text-primary rounded-md px-3 py-1'>{selectedLocation}</span>
              </div>

              <div className='flex flex-wrap gap-2'>
                <Button variant='outline' size='sm' onClick={() => setLocation('Mumbai')}>
                  Set Mumbai
                </Button>
                <Button variant='outline' size='sm' onClick={() => setLocation('Delhi')}>
                  Set Delhi
                </Button>
                <Button variant='outline' size='sm' onClick={() => setLocation('Chennai')}>
                  Set Chennai
                </Button>
                <Button variant='outline' size='sm' onClick={clearLocation}>
                  Clear Location
                </Button>
              </div>

              <div className='text-muted-foreground text-sm'>
                <p>• The location is automatically saved to localStorage</p>
                <p>• Refresh the page to see persistence in action</p>
                <p>• The header will show the selected location</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Features</CardTitle>
              <CardDescription>What the UserHeader component provides</CardDescription>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div className='flex items-center space-x-3'>
                <div className='bg-primary h-2 w-2 rounded-full'></div>
                <span>Responsive design with mobile-first approach</span>
              </div>
              <div className='flex items-center space-x-3'>
                <div className='bg-primary h-2 w-2 rounded-full'></div>
                <span>Location dropdown with persistent storage</span>
              </div>
              <div className='flex items-center space-x-3'>
                <div className='bg-primary h-2 w-2 rounded-full'></div>
                <span>Search bar with form handling</span>
              </div>
              <div className='flex items-center space-x-3'>
                <div className='bg-primary h-2 w-2 rounded-full'></div>
                <span>Navigation links (Wishlist, My Bookings)</span>
              </div>
              <div className='flex items-center space-x-3'>
                <div className='bg-primary h-2 w-2 rounded-full'></div>
                <span>User profile dropdown with avatar</span>
              </div>
              <div className='flex items-center space-x-3'>
                <div className='bg-primary h-2 w-2 rounded-full'></div>
                <span>Sticky positioning with backdrop blur</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Usage</CardTitle>
              <CardDescription>How to use the UserHeader component</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='bg-muted rounded-md p-4'>
                <code className='text-sm'>
                  {`import UserHeader from '@/components/UserHeader';

// In your layout or page
<UserHeader />

// Access location store anywhere in your app
import { useLocationStore } from '@/store/location.store';

const { selectedLocation, setLocation } = useLocationStore();`}
                </code>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
