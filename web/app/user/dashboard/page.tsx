'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import AuthGuard from '@/components/auth/AuthGuard';
import { UserRole } from '@/types/auth.type';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Calendar,
  MapPin,
  Star,
  Clock,
  Trophy,
  Search,
  Heart,
  Users,
  TrendingUp,
  Activity,
  Target,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface BookingStats {
  totalBookings: number;
  upcomingBookings: number;
  completedBookings: number;
  favoriteVenues: number;
}

interface RecentBooking {
  id: string;
  facilityName: string;
  courtName: string;
  date: string;
  time: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  amount: number;
}

interface FavoriteFacility {
  id: string;
  name: string;
  location: string;
  rating: number;
  imageUrl?: string;
  courts: number;
}

export default function UserDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<BookingStats>({
    totalBookings: 0,
    upcomingBookings: 0,
    completedBookings: 0,
    favoriteVenues: 0,
  });

  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [favoriteFacilities, setFavoriteFacilities] = useState<FavoriteFacility[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data for demonstration - replace with actual API calls
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Mock data
        setStats({
          totalBookings: 24,
          upcomingBookings: 3,
          completedBookings: 21,
          favoriteVenues: 5,
        });

        setRecentBookings([
          {
            id: '1',
            facilityName: 'Elite Sports Complex',
            courtName: 'Court 1',
            date: '2024-01-15',
            time: '18:00 - 20:00',
            status: 'upcoming',
            amount: 2500,
          },
          {
            id: '2',
            facilityName: 'Metro Badminton Center',
            courtName: 'Court 3',
            date: '2024-01-12',
            time: '16:00 - 18:00',
            status: 'completed',
            amount: 1800,
          },
          {
            id: '3',
            facilityName: 'Champions Tennis Club',
            courtName: 'Court 2',
            date: '2024-01-10',
            time: '14:00 - 16:00',
            status: 'completed',
            amount: 3200,
          },
        ]);

        setFavoriteFacilities([
          {
            id: '1',
            name: 'Elite Sports Complex',
            location: 'Andheri, Mumbai',
            rating: 4.8,
            courts: 8,
          },
          {
            id: '2',
            name: 'Metro Badminton Center',
            location: 'Bandra, Mumbai',
            rating: 4.6,
            courts: 6,
          },
          {
            id: '3',
            name: 'Champions Tennis Club',
            location: 'Powai, Mumbai',
            rating: 4.9,
            courts: 4,
          },
        ]);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-700';
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const statsCards = [
    {
      title: 'Total Bookings',
      value: stats.totalBookings,
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Upcoming Games',
      value: stats.upcomingBookings,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      title: 'Games Played',
      value: stats.completedBookings,
      icon: Trophy,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Favorite Venues',
      value: stats.favoriteVenues,
      icon: Heart,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
  ];

  if (isLoading) {
    return (
      <AuthGuard requiredRole={UserRole.USER}>
        <DashboardLayout>
          <div className='flex h-full items-center justify-center'>
            <div className='h-8 w-8 animate-spin rounded-full border-b-2 border-orange-500'></div>
          </div>
        </DashboardLayout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requiredRole={UserRole.USER}>
      <DashboardLayout>
        <div className='space-y-6 p-6'>
          {/* Header */}
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>Welcome back, {session?.user?.name}! 👋</h1>
              <p className='mt-1 text-gray-600'>Ready for your next game? Let&apos;s find the perfect court!</p>
            </div>
            <div className='flex gap-3'>
              <Button className='bg-orange-500 hover:bg-orange-600'>
                <Search className='mr-2 h-4 w-4' />
                Find Courts
              </Button>
              <Button variant='outline'>
                <Users className='mr-2 h-4 w-4' />
                Find Players
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
            {statsCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card>
                    <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                      <CardTitle className='text-sm font-medium'>{stat.title}</CardTitle>
                      <div className={`rounded-full p-2 ${stat.bgColor}`}>
                        <Icon className={`h-4 w-4 ${stat.color}`} />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className='text-2xl font-bold'>{stat.value}</div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          <div className='grid gap-6 md:grid-cols-2'>
            {/* Recent Bookings */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Activity className='h-5 w-5' />
                  Recent Bookings
                </CardTitle>
                <CardDescription>Your latest court bookings and game history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {recentBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className='flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-gray-50'
                    >
                      <div className='flex-1'>
                        <h4 className='font-medium'>{booking.facilityName}</h4>
                        <p className='text-sm text-gray-600'>{booking.courtName}</p>
                        <div className='mt-1 flex items-center gap-2 text-xs text-gray-500'>
                          <Calendar className='h-3 w-3' />
                          {new Date(booking.date).toLocaleDateString()}
                          <Clock className='ml-2 h-3 w-3' />
                          {booking.time}
                        </div>
                      </div>
                      <div className='text-right'>
                        <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                        <p className='mt-1 text-sm font-medium'>₹{booking.amount}</p>
                      </div>
                    </div>
                  ))}
                  {recentBookings.length === 0 && (
                    <div className='py-6 text-center text-gray-500'>
                      <Calendar className='mx-auto mb-2 h-8 w-8 opacity-50' />
                      <p>No bookings yet</p>
                      <p className='text-sm'>Book your first court to get started!</p>
                    </div>
                  )}
                </div>
                <Button variant='outline' className='mt-4 w-full'>
                  View All Bookings
                </Button>
              </CardContent>
            </Card>

            {/* Favorite Facilities */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Heart className='h-5 w-5' />
                  Favorite Venues
                </CardTitle>
                <CardDescription>Your preferred sports facilities and courts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {favoriteFacilities.map((facility) => (
                    <div
                      key={facility.id}
                      className='flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-gray-50'
                    >
                      <Avatar className='h-10 w-10'>
                        <AvatarImage src={facility.imageUrl} />
                        <AvatarFallback>{facility.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className='flex-1'>
                        <h4 className='font-medium'>{facility.name}</h4>
                        <div className='flex items-center gap-2 text-sm text-gray-600'>
                          <MapPin className='h-3 w-3' />
                          {facility.location}
                        </div>
                        <div className='mt-1 flex items-center gap-2'>
                          <div className='flex items-center gap-1'>
                            <Star className='h-3 w-3 fill-yellow-400 text-yellow-400' />
                            <span className='text-xs'>{facility.rating}</span>
                          </div>
                          <span className='text-xs text-gray-500'>{facility.courts} courts</span>
                        </div>
                      </div>
                      <Button size='sm' variant='outline'>
                        Book
                      </Button>
                    </div>
                  ))}
                  {favoriteFacilities.length === 0 && (
                    <div className='py-6 text-center text-gray-500'>
                      <Heart className='mx-auto mb-2 h-8 w-8 opacity-50' />
                      <p>No favorites yet</p>
                      <p className='text-sm'>Add facilities to your favorites!</p>
                    </div>
                  )}
                </div>
                <Button variant='outline' className='mt-4 w-full'>
                  Explore Facilities
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Target className='h-5 w-5' />
                Quick Actions
              </CardTitle>
              <CardDescription>Jump into action with these popular features</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid gap-4 md:grid-cols-3'>
                <Button className='h-20 flex-col gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'>
                  <Search className='h-6 w-6' />
                  Find Courts Near Me
                </Button>
                <Button variant='outline' className='h-20 flex-col gap-2 hover:border-orange-200 hover:bg-orange-50'>
                  <Users className='h-6 w-6 text-orange-600' />
                  Find Playing Partners
                </Button>
                <Button variant='outline' className='h-20 flex-col gap-2 hover:border-green-200 hover:bg-green-50'>
                  <TrendingUp className='h-6 w-6 text-green-600' />
                  View My Progress
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}
