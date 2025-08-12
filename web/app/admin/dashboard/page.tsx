'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  Building2,
  Calendar,
  Shield,
  TrendingUp,
  TrendingDown,
  UserCheck,
  Flag,
  BarChart3,
  AlertTriangle,
} from 'lucide-react';

// Mock data - replace with actual API calls
const mockAdminStats = {
  totalUsers: 1247,
  totalOwners: 89,
  totalFacilities: 156,
  totalBookings: 8934,
  pendingApprovals: 12,
  activeReports: 5,
  userGrowth: 12.5,
  facilityGrowth: 8.3,
  bookingGrowth: 15.2,
};

const mockPendingApprovals = [
  {
    id: '1',
    facilityName: 'SportZone Arena',
    ownerName: 'John Smith',
    submittedAt: '2 hours ago',
    type: 'New Facility',
  },
  {
    id: '2',
    facilityName: 'Elite Courts',
    ownerName: 'Sarah Johnson',
    submittedAt: '5 hours ago',
    type: 'Facility Update',
  },
  {
    id: '3',
    facilityName: 'Prime Sports',
    ownerName: 'Mike Davis',
    submittedAt: '1 day ago',
    type: 'New Facility',
  },
];

const mockRecentReports = [
  {
    id: '1',
    type: 'Facility Issue',
    description: 'Court maintenance required at Downtown Courts',
    reportedBy: 'User123',
    status: 'Open',
    timeAgo: '30 minutes ago',
  },
  {
    id: '2',
    type: 'User Behavior',
    description: 'Inappropriate behavior reported',
    reportedBy: 'User456',
    status: 'Under Review',
    timeAgo: '2 hours ago',
  },
];

const mockRecentActivity = [
  {
    id: '1',
    description: 'New facility "SportZone Arena" submitted for approval',
    timeAgo: '2 hours ago',
    type: 'approval',
  },
  {
    id: '2',
    description: 'User "john_doe" account suspended',
    timeAgo: '4 hours ago',
    type: 'moderation',
  },
  {
    id: '3',
    description: 'Facility "Elite Courts" approved',
    timeAgo: '6 hours ago',
    type: 'approval',
  },
];

export default function AdminDashboardPage() {
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Dashboard error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return <TrendingUp className='h-4 w-4 text-green-600' />;
    if (growth < 0) return <TrendingDown className='h-4 w-4 text-red-600' />;
    return null;
  };

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return 'destructive';
      case 'under review':
        return 'secondary';
      case 'resolved':
        return 'default';
      default:
        return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <div className='space-y-6 p-6'>
        <div className='space-y-2'>
          <div className='bg-muted h-8 w-64 animate-pulse rounded'></div>
          <div className='bg-muted h-4 w-96 animate-pulse rounded'></div>
        </div>
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className='space-y-2'>
                <div className='bg-muted h-4 w-24 animate-pulse rounded'></div>
                <div className='bg-muted h-8 w-16 animate-pulse rounded'></div>
              </CardHeader>
              <CardContent>
                <div className='bg-muted h-3 w-24 animate-pulse rounded'></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6 p-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-foreground text-3xl font-bold'>Admin Dashboard</h1>
          <p className='text-muted-foreground mt-1'>System overview and management tools</p>
        </div>
        <div className='flex gap-3'>
          <Button asChild variant='outline'>
            <Link href='/admin/approvals'>
              <UserCheck className='mr-2 h-4 w-4' />
              Pending Approvals
              {mockAdminStats.pendingApprovals > 0 && <Badge className='ml-2'>{mockAdminStats.pendingApprovals}</Badge>}
            </Link>
          </Button>
          <Button asChild>
            <Link href='/admin/analytics'>
              <BarChart3 className='mr-2 h-4 w-4' />
              System Analytics
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Users</CardTitle>
            <Users className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{mockAdminStats.totalUsers.toLocaleString()}</div>
            <div className='text-muted-foreground flex items-center text-xs'>
              {getGrowthIcon(mockAdminStats.userGrowth)}
              <span className='ml-1'>+{mockAdminStats.userGrowth}% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Facility Owners</CardTitle>
            <Shield className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{mockAdminStats.totalOwners}</div>
            <div className='text-muted-foreground flex items-center text-xs'>
              <span>managing {mockAdminStats.totalFacilities} facilities</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Bookings</CardTitle>
            <Calendar className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{mockAdminStats.totalBookings.toLocaleString()}</div>
            <div className='text-muted-foreground flex items-center text-xs'>
              {getGrowthIcon(mockAdminStats.bookingGrowth)}
              <span className='ml-1'>+{mockAdminStats.bookingGrowth}% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Pending Actions</CardTitle>
            <AlertTriangle className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{mockAdminStats.pendingApprovals + mockAdminStats.activeReports}</div>
            <div className='text-muted-foreground flex items-center text-xs'>
              <span>
                {mockAdminStats.pendingApprovals} approvals, {mockAdminStats.activeReports} reports
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue='overview' className='space-y-4'>
        <TabsList>
          <TabsTrigger value='overview'>Overview</TabsTrigger>
          <TabsTrigger value='approvals'>Pending Approvals</TabsTrigger>
          <TabsTrigger value='reports'>Reports</TabsTrigger>
          <TabsTrigger value='activity'>System Activity</TabsTrigger>
        </TabsList>

        <TabsContent value='overview' className='space-y-4'>
          <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common administrative tasks</CardDescription>
              </CardHeader>
              <CardContent className='space-y-3'>
                <Button asChild variant='outline' className='w-full justify-start'>
                  <Link href='/admin/users'>
                    <Users className='mr-2 h-4 w-4' />
                    Manage Users
                  </Link>
                </Button>
                <Button asChild variant='outline' className='w-full justify-start'>
                  <Link href='/admin/facilities'>
                    <Building2 className='mr-2 h-4 w-4' />
                    Manage Facilities
                  </Link>
                </Button>
                <Button asChild variant='outline' className='w-full justify-start'>
                  <Link href='/admin/approvals'>
                    <UserCheck className='mr-2 h-4 w-4' />
                    Review Approvals
                    {mockAdminStats.pendingApprovals > 0 && (
                      <Badge className='ml-auto'>{mockAdminStats.pendingApprovals}</Badge>
                    )}
                  </Link>
                </Button>
                <Button asChild variant='outline' className='w-full justify-start'>
                  <Link href='/admin/reports'>
                    <Flag className='mr-2 h-4 w-4' />
                    Handle Reports
                    {mockAdminStats.activeReports > 0 && (
                      <Badge variant='destructive' className='ml-auto'>
                        {mockAdminStats.activeReports}
                      </Badge>
                    )}
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* System Health */}
            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
                <CardDescription>Current system status and metrics</CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm'>User Growth</span>
                  <div className='flex items-center space-x-2'>
                    {getGrowthIcon(mockAdminStats.userGrowth)}
                    <span className='text-sm font-medium'>+{mockAdminStats.userGrowth}%</span>
                  </div>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm'>Facility Growth</span>
                  <div className='flex items-center space-x-2'>
                    {getGrowthIcon(mockAdminStats.facilityGrowth)}
                    <span className='text-sm font-medium'>+{mockAdminStats.facilityGrowth}%</span>
                  </div>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm'>Booking Growth</span>
                  <div className='flex items-center space-x-2'>
                    {getGrowthIcon(mockAdminStats.bookingGrowth)}
                    <span className='text-sm font-medium'>+{mockAdminStats.bookingGrowth}%</span>
                  </div>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm'>System Status</span>
                  <Badge variant='default'>Operational</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='approvals' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Pending Facility Approvals</CardTitle>
              <CardDescription>Facilities waiting for review and approval</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {mockPendingApprovals.map((approval) => (
                  <div key={approval.id} className='flex items-center justify-between rounded-lg border p-4'>
                    <div className='space-y-1'>
                      <p className='font-medium'>{approval.facilityName}</p>
                      <p className='text-muted-foreground text-sm'>
                        by {approval.ownerName} • {approval.submittedAt}
                      </p>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <Badge variant='secondary'>{approval.type}</Badge>
                      <Button size='sm'>Review</Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button asChild variant='outline' className='mt-4 w-full'>
                <Link href='/admin/approvals'>View All Approvals</Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='reports' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Active Reports</CardTitle>
              <CardDescription>User reports requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {mockRecentReports.map((report) => (
                  <div key={report.id} className='flex items-center justify-between rounded-lg border p-4'>
                    <div className='space-y-1'>
                      <p className='font-medium'>{report.type}</p>
                      <p className='text-muted-foreground text-sm'>{report.description}</p>
                      <p className='text-muted-foreground text-xs'>
                        Reported by {report.reportedBy} • {report.timeAgo}
                      </p>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <Badge variant={getStatusVariant(report.status)}>{report.status}</Badge>
                      <Button size='sm'>Handle</Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button asChild variant='outline' className='mt-4 w-full'>
                <Link href='/admin/reports'>View All Reports</Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='activity' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Recent System Activity</CardTitle>
              <CardDescription>Latest administrative actions and system events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {mockRecentActivity.map((activity) => (
                  <div key={activity.id} className='flex items-start space-x-3 rounded-lg border p-4'>
                    <div className='flex-1'>
                      <p className='text-sm'>{activity.description}</p>
                      <p className='text-muted-foreground mt-1 text-xs'>{activity.timeAgo}</p>
                    </div>
                    <Badge variant='outline'>{activity.type}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
