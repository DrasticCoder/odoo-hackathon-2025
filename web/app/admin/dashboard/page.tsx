'use client';

import { useCurrentUser, useRefreshUser } from '@/hooks';
import AuthGuard from '@/components/auth/AuthGuard';
import { UserRole } from '@/types/auth.type';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Building2, Calendar, TrendingUp, RefreshCw, Shield, Activity, Server } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
  const user = useCurrentUser();
  const refreshUser = useRefreshUser();

  const statsCards = [
    {
      title: 'Total Users',
      value: '1,234',
      description: '+20.1% from last month',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Total Facilities',
      value: '156',
      description: '+12.5% from last month',
      icon: Building2,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Total Bookings',
      value: '3,456',
      description: '+8.2% from last month',
      icon: Calendar,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      title: 'Revenue',
      value: '₹45,231',
      description: '+15.3% from last month',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  return (
    <AuthGuard requiredRole={UserRole.ADMIN}>
      <DashboardLayout>
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user?.name}! 🛡️
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your QuickCourt platform and monitor system health
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Badge className="bg-purple-100 text-purple-700">
                  {user?.role}
                </Badge>
                <Badge className={user?.isVerified ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                  {user?.isVerified ? 'Verified' : 'Unverified'}
                </Badge>
                <Badge className={user?.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                  {user?.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={refreshUser} className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Refresh Profile
              </Button>
              <Button className="bg-orange-500 hover:bg-orange-600">
                <Shield className="h-4 w-4 mr-2" />
                Security Center
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        {stat.title}
                      </CardTitle>
                      <div className={`p-2 rounded-full ${stat.bgColor}`}>
                        <Icon className={`h-4 w-4 ${stat.color}`} />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <p className="text-xs text-gray-600 mt-1">{stat.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activities
                </CardTitle>
                <CardDescription>Latest system activities and events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">New facility approved</p>
                      <p className="text-xs text-gray-600">SportZone Arena - 2 hours ago</p>
                    </div>
                    <Badge className="bg-green-100 text-green-700">Approved</Badge>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">New user registered</p>
                      <p className="text-xs text-gray-600">john@example.com - 4 hours ago</p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-700">New</Badge>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Facility pending approval</p>
                      <p className="text-xs text-gray-600">City Sports Complex - 6 hours ago</p>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-4">
                  View All Activities
                </Button>
              </CardContent>
            </Card>

            {/* System Health */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  System Health
                </CardTitle>
                <CardDescription>Platform performance and health metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="text-sm font-medium">Server Status</span>
                    <Badge className="bg-green-100 text-green-700">Healthy</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="text-sm font-medium">Database</span>
                    <Badge className="bg-green-100 text-green-700">Connected</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="text-sm font-medium">API Response Time</span>
                    <Badge className="bg-yellow-100 text-yellow-700">245ms</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="text-sm font-medium">Active Users</span>
                    <Badge className="bg-blue-100 text-blue-700">89 online</Badge>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-4">
                  View System Logs
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Platform Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Platform Analytics
              </CardTitle>
              <CardDescription>Comprehensive platform performance and growth metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex h-64 items-center justify-center rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-dashed border-purple-200">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 mx-auto text-purple-400 mb-4" />
                  <p className="text-gray-600 font-medium">Advanced Analytics Dashboard</p>
                  <p className="text-sm text-gray-500 mt-1">
                    User growth, revenue trends, and platform insights
                  </p>
                  <Button variant="outline" className="mt-4">
                    View Full Analytics
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}
