
"use client";
import { useEffect, useState } from "react";
import { AnalyticsService, AnalyticsStats } from "@/services/analytics.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid } from "recharts";
import { Loader2 } from "lucide-react";

const COLORS = ["#6366f1", "#f59e42", "#10b981", "#f43f5e", "#a21caf", "#fbbf24"];

import { jsPDF } from 'jspdf';

export default function AnalyticsPage() {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [sports, setSports] = useState<{ name: string; bookingCount: number }[]>([]);

  useEffect(() => {
    AnalyticsService.getStats().then((data) => {
      setStats(data);
      setLoading(false);
    });
    fetch("/api/sports/popular")
      .then((res) => res.json())
      .then((data) => setSports(data));
  }, []);

  // Chart data
  const bookingsPie = [
    { name: "Confirmed", value: stats?.confirmedBookings ?? 0 },
    { name: "Cancelled", value: stats?.cancelledBookings ?? 0 },
  ];
  const monthlyBookings = stats?.monthlyBookings ?? [];

  const handleExportPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    doc.setFontSize(22);
    doc.text('Platform Analytics', 40, 60);
    let y = 100;
    if (stats) {
      doc.setFontSize(14);
      doc.text(`Total Users: ${stats.totalUsers ?? 'No data'}`, 40, y);
      y += 20;
      doc.text(`Total Facilities: ${stats.totalFacilities ?? 'No data'}`, 40, y);
      y += 20;
      doc.text(`Total Bookings: ${stats.totalBookings ?? 'No data'}`, 40, y);
      y += 20;
      doc.text(`Total Revenue: ₹${stats.totalRevenue?.toLocaleString() ?? 'No data'}`, 40, y);
      y += 20;
      doc.text(`Avg. Booking Value: ₹${stats.averageBookingValue?.toLocaleString() ?? 'No data'}`, 40, y);
      y += 30;
      doc.text('Most Active Sports:', 40, y);
      y += 20;
      if (sports.length > 0) {
        sports.forEach((s, i) => {
          doc.text(`${i + 1}. ${s.name}: ${s.bookingCount}`, 60, y);
          y += 18;
        });
      } else {
        doc.text('No data', 60, y);
        y += 18;
      }
      y += 10;
      doc.text('Monthly Bookings:', 40, y);
      y += 20;
      if (stats.monthlyBookings && stats.monthlyBookings.length > 0) {
        stats.monthlyBookings.forEach((m) => {
          doc.text(`${m.month}: ${m.bookings}`, 60, y);
          y += 18;
        });
      } else {
        doc.text('No data', 60, y);
        y += 18;
      }
    } else {
      doc.text('No data', 40, y);
    }
    doc.save('analytics.pdf');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 py-8 px-2 md:px-8">
      <div className="mx-auto max-w-7xl space-y-10">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-4xl font-extrabold text-primary tracking-tight">Platform Analytics</h1>
          <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={handleExportPDF}>
            Export to PDF
          </Button>
        </div>
        <div id="analytics-content">
        {/* Stat Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-primary text-primary-foreground shadow-xl">
            <CardHeader>
              <CardTitle>Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-extrabold">{loading ? <Loader2 className="animate-spin" /> : stats?.totalUsers}</div>
            </CardContent>
          </Card>
          <Card className="bg-secondary text-secondary-foreground shadow-xl">
            <CardHeader>
              <CardTitle>Total Facilities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-extrabold">{loading ? <Loader2 className="animate-spin" /> : stats?.totalFacilities}</div>
            </CardContent>
          </Card>
          <Card className="bg-primary text-primary-foreground shadow-xl">
            <CardHeader>
              <CardTitle>Total Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-extrabold">{loading ? <Loader2 className="animate-spin" /> : stats?.totalBookings}</div>
            </CardContent>
          </Card>
          <Card className="bg-secondary text-secondary-foreground shadow-xl">
            <CardHeader>
              <CardTitle>Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-extrabold">₹{loading ? <Loader2 className="animate-spin" /> : stats?.totalRevenue.toLocaleString()}</div>
              <div className="text-xs mt-2 text-secondary-foreground/80">Avg. Booking Value: ₹{stats?.averageBookingValue?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
            </CardContent>
          </Card>
        </div>

        {/* Booking Activity Over Time (SimpleLineChart) */}
        <Card className="bg-primary/10 shadow-lg">
          <CardHeader>
            <CardTitle>Booking Activity Over Time</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
              {monthlyBookings.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">No data</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyBookings} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="bookings" stroke="#6366f1" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
          </CardContent>
        </Card>

  {/* User Registration Trends (removed, no real data) */}

  {/* Facility Approval Trend (removed, no real data) */}

        {/* Most Active Sports */}
        <Card className="bg-secondary/10 shadow-lg">
          <CardHeader>
            <CardTitle>Most Active Sports</CardTitle>
          </CardHeader>
          <CardContent className="h-80 flex items-center justify-center">
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : sports.length === 0 ? (
              <div className="text-muted-foreground">No data</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sports} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 0 }}>
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis dataKey="name" type="category" width={120} />
                  <Tooltip />
                  <Bar dataKey="bookingCount" fill="#a21caf" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

  {/* Earnings Simulation Chart (removed, no real data) */}

        {/* Booking Status Pie Chart */}
        <Card className="bg-secondary/10 shadow-lg">
          <CardHeader>
            <CardTitle>Booking Status</CardTitle>
          </CardHeader>
          <CardContent className="h-80 flex items-center justify-center">
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : bookingsPie.every(b => b.value === 0) ? (
              <div className="text-muted-foreground">No data</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={bookingsPie}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    label
                  >
                    {bookingsPie.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}