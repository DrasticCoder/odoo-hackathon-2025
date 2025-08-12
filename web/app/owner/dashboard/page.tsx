'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, TrendingUp, TrendingDown, Users, Building2, DollarSign, BarChart3, Link, Plus } from 'lucide-react';
import AuthGuard from '@/components/auth/AuthGuard';
import { OwnerLayout } from '@/components/OwnerLayout';
import { OwnerService } from '@/services/owner.service';
import { OwnerDashboardStats, UpcomingBooking, RecentActivity, BookingTrend } from '@/types/owner.types';
import { UserRole } from '@/types/auth.type';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useAuthStore } from '@/store';

export default function OwnerDashboardPage() {
  const [stats, setStats] = useState<OwnerDashboardStats | null>(null);
  const [upcomingBookings, setUpcomingBookings] = useState<UpcomingBooking[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [bookingTrends, setBookingTrends] = useState<BookingTrend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const { user } = useAuthStore();

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [statsResponse, upcomingResponse, activityResponse, trendsResponse] = await Promise.all([
        OwnerService.getDashboardStats(),
        OwnerService.getUpcomingBookings(10),
        OwnerService.getRecentActivity(20),
        OwnerService.getBookingTrends({ period: selectedPeriod }),
      ]);

      if (statsResponse.data) setStats(statsResponse.data);
      if (upcomingResponse.data) setUpcomingBookings(upcomingResponse.data);
      if (activityResponse.data) setRecentActivity(activityResponse.data);
      if (trendsResponse.data) setBookingTrends(trendsResponse.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error('Dashboard error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedPeriod]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatTimeUntil = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const getGrowthIcon = (percentage: number) => {
    if (percentage > 0) return <TrendingUp className='text-primary h-4 w-4' />;
    if (percentage < 0) return <TrendingDown className='text-destructive h-4 w-4' />;
    return null;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      case 'completed':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'booking_created':
        return '📅';
      case 'booking_cancelled':
        return '❌';
      case 'facility_updated':
        return '🏢';
      case 'court_added':
        return '🎾';
      default:
        return '📝';
    }
  };

  if (isLoading) {
    return (
      <AuthGuard requiredRole={[UserRole.OWNER]}>
        <OwnerLayout>
          <div className='container mx-auto p-6'>
            <div className='mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <div className='bg-muted h-4 w-20 animate-pulse rounded'></div>
                    <div className='bg-muted h-4 w-4 animate-pulse rounded'></div>
                  </CardHeader>
                  <CardContent>
                    <div className='bg-muted mb-2 h-8 w-16 animate-pulse rounded'></div>
                    <div className='bg-muted h-3 w-24 animate-pulse rounded'></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </OwnerLayout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requiredRole={UserRole.OWNER}>
      <DashboardLayout>
        <div className='bg-background space-y-6 p-6'>
          {/* Header */}
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-bold text-gray-300'>Welcome back, {user?.name}! 🏟️</h1>
              <p className='mt-1 text-gray-400'>Manage your sports facilities and grow your business</p>
            </div>
            <div className='flex gap-3'>
              <Button>
                <Link href='/owner/facilities/add'>
                  <Plus className='mr-2 h-4 w-4' />
                  Add Facility
                </Link>
              </Button>
              <Button variant='outline'>
                <Link href='/owner/analytics'>
                  <BarChart3 className='mr-2 h-4 w-4' />
                  Analytics
                </Link>
              </Button>
            </div>
          </div>

          {/* KPI Cards */}
          <div className='mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>Total Bookings</CardTitle>
                <Calendar className='text-muted-foreground h-4 w-4' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{stats?.totalBookings || 0}</div>
                <p className='text-muted-foreground text-xs'>
                  {stats?.confirmedBookings || 0} confirmed, {stats?.pendingBookings || 0} pending
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>Active Courts</CardTitle>
                <Building2 className='text-muted-foreground h-4 w-4' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{stats?.activeCourts || 0}</div>
                <p className='text-muted-foreground text-xs'>Across {stats?.totalFacilities || 0} facilities</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>Total Earnings</CardTitle>
                <DollarSign className='text-muted-foreground h-4 w-4' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{formatCurrency(stats?.totalEarnings || 0)}</div>
                <p className='text-muted-foreground text-xs'>
                  Avg: {formatCurrency(stats?.averageBookingValue || 0)} per booking
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>Monthly Growth</CardTitle>
                {getGrowthIcon(stats?.growthPercentage || 0)}
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {stats?.growthPercentage ? `${stats.growthPercentage.toFixed(1)}%` : '0%'}
                </div>
                <p className='text-muted-foreground text-xs'>
                  This month: {formatCurrency(stats?.thisMonthEarnings || 0)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue='overview' className='space-y-6'>
            <TabsList>
              <TabsTrigger value='overview'>Overview</TabsTrigger>
              <TabsTrigger value='bookings'>Bookings</TabsTrigger>
              <TabsTrigger value='analytics'>Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value='overview' className='space-y-6'>
              <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                {/* Upcoming Bookings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming Bookings</CardTitle>
                    <CardDescription>Next bookings at your facilities</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-4'>
                      {upcomingBookings.slice(0, 5).map((booking) => (
                        <div key={booking.id} className='flex items-center justify-between rounded-lg border p-3'>
                          <div className='flex-1'>
                            <div className='font-medium'>{booking.userName}</div>
                            <div className='text-muted-foreground text-sm'>
                              {booking.facilityName} - {booking.courtName}
                            </div>
                            <div className='text-muted-foreground text-xs'>
                              {new Date(booking.startDatetime).toLocaleString()}
                            </div>
                          </div>
                          <div className='text-right'>
                            <Badge variant={getStatusColor(booking.status)}>{booking.status}</Badge>
                            <div className='text-muted-foreground mt-1 text-xs'>
                              in {formatTimeUntil(booking.timeUntilBooking)}
                            </div>
                          </div>
                        </div>
                      ))}
                      {upcomingBookings.length === 0 && (
                        <p className='text-muted-foreground py-4 text-center'>No upcoming bookings</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Latest updates from your facilities</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-4'>
                      {recentActivity.slice(0, 5).map((activity) => (
                        <div key={activity.id} className='flex items-start gap-3'>
                          <div className='text-lg'>{getActivityIcon(activity.type)}</div>
                          <div className='flex-1'>
                            <div className='text-sm'>{activity.description}</div>
                            {activity.userName && (
                              <div className='text-muted-foreground text-xs'>by {activity.userName}</div>
                            )}
                            <div className='text-muted-foreground text-xs'>
                              {new Date(activity.timestamp).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      ))}
                      {recentActivity.length === 0 && (
                        <p className='text-muted-foreground py-4 text-center'>No recent activity</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value='bookings' className='space-y-6'>
              <Card>
                <CardHeader>
                  <CardTitle>Booking Overview</CardTitle>
                  <CardDescription>Manage your facility bookings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='py-8 text-center'>
                    <Users className='text-muted-foreground mx-auto mb-4 h-12 w-12' />
                    <h3 className='mb-2 text-lg font-medium'>Booking Management</h3>
                    <p className='text-muted-foreground mb-4'>View and manage all bookings across your facilities</p>
                    <Button>View All Bookings</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='analytics' className='space-y-6'>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between'>
                  <div>
                    <CardTitle>Booking Trends</CardTitle>
                    <CardDescription>Track your booking performance over time</CardDescription>
                  </div>
                  <div className='flex gap-2'>
                    <Button
                      variant={selectedPeriod === 'daily' ? 'default' : 'outline'}
                      size='sm'
                      onClick={() => setSelectedPeriod('daily')}
                    >
                      Daily
                    </Button>
                    <Button
                      variant={selectedPeriod === 'weekly' ? 'default' : 'outline'}
                      size='sm'
                      onClick={() => setSelectedPeriod('weekly')}
                    >
                      Weekly
                    </Button>
                    <Button
                      variant={selectedPeriod === 'monthly' ? 'default' : 'outline'}
                      size='sm'
                      onClick={() => setSelectedPeriod('monthly')}
                    >
                      Monthly
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    {bookingTrends.map((trend, index) => (
                      <div key={index} className='flex items-center justify-between rounded-lg border p-3'>
                        <div>
                          <div className='font-medium'>{trend.period}</div>
                          <div className='text-muted-foreground text-sm'>{trend.bookings} bookings</div>
                        </div>
                        <div className='text-right'>
                          <div className='font-medium'>{formatCurrency(trend.earnings)}</div>
                          <div className='text-muted-foreground text-sm'>
                            {formatCurrency(trend.bookings > 0 ? trend.earnings / trend.bookings : 0)} avg
                          </div>
                        </div>
                      </div>
                    ))}
                    {bookingTrends.length === 0 && (
                      <p className='text-muted-foreground py-4 text-center'>No booking trends data</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}
