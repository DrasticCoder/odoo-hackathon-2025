'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { OwnerService } from '@/services/owner.service';
import type { OwnerDashboardStats, BookingTrend, EarningsSummary, PeakHours, Facility } from '@/types/owner.types';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  FileText,
  FileSpreadsheet,
  Calendar as CalendarIcon,
  Filter,
  BarChart3,
  Database,
  FlaskConical,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from 'recharts';

type DateRange = { from?: Date; to?: Date };

export default function OwnerAnalyticsPage() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [stats, setStats] = useState<OwnerDashboardStats | null>(null);
  const [bookingTrends, setBookingTrends] = useState<BookingTrend[]>([]);
  const [earningsSummary, setEarningsSummary] = useState<EarningsSummary[]>([]);
  const [, setPeakHours] = useState<PeakHours[]>([]);

  const [selectedFacility, setSelectedFacility] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [dateRange, setDateRange] = useState<DateRange>({});
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [useTestData, setUseTestData] = useState<boolean>(false);

  // Load facilities for filters
  const loadFacilities = useCallback(async () => {
    if (useTestData) return;
    const res = await OwnerService.getFacilities({ sort: 'name,asc' });
    const items = Array.isArray(res.data?.data) ? (res.data!.data as Facility[]) : [];
    setFacilities(items);
  }, [useTestData]);

  const facilityIdParam = useMemo(
    () => (selectedFacility !== 'all' ? selectedFacility : undefined),
    [selectedFacility]
  );

  const queryParams = useMemo(() => {
    const params: Record<string, string> = { period: selectedPeriod };
    if (dateRange.from) params.startDate = format(dateRange.from, 'yyyy-MM-dd');
    if (dateRange.to) params.endDate = format(dateRange.to, 'yyyy-MM-dd');
    if (facilityIdParam) params.facilityId = facilityIdParam;
    return params;
  }, [selectedPeriod, dateRange, facilityIdParam]);

  const loadAnalytics = useCallback(async () => {
    if (useTestData) return;
    setIsLoading(true);
    try {
      const [statsRes, trendsRes, earningsRes, peakRes] = await Promise.all([
        OwnerService.getDashboardStats(queryParams),
        OwnerService.getBookingTrends(queryParams),
        OwnerService.getEarningsSummary(queryParams),
        OwnerService.getPeakHours(queryParams),
      ]);

      if (statsRes.data) setStats(statsRes.data);
      if (trendsRes.data) setBookingTrends(trendsRes.data);
      if (earningsRes.data) setEarningsSummary(earningsRes.data);
      if (peakRes.data) setPeakHours(peakRes.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  }, [queryParams, useTestData]);

  useEffect(() => {
    loadFacilities();
  }, [loadFacilities]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  // Regions derived from facilities shortLocation
  const regions = useMemo(() => {
    const set = new Set<string>();
    const list = Array.isArray(facilities) ? facilities : [];
    list.forEach((f) => {
      if (f.shortLocation) set.add(f.shortLocation);
    });
    return ['all', ...Array.from(set)];
  }, [facilities]);

  const facilityById = useMemo(() => {
    const map = new Map<string, Facility>();
    facilities.forEach((f) => map.set(f.id, f));
    return map;
  }, [facilities]);

  const filteredEarnings = useMemo(() => {
    if (selectedRegion === 'all') return earningsSummary;
    return earningsSummary.filter((e) => {
      const fac = facilityById.get(e.facilityId);
      return fac?.shortLocation === selectedRegion;
    });
  }, [earningsSummary, selectedRegion, facilityById]);

  const bookingTrendsChartData = useMemo(() => {
    return bookingTrends
      .slice()
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((t) => ({
        period: t.period,
        date: new Date(t.date).toISOString().split('T')[0],
        bookings: t.bookings,
        earnings: t.earnings,
      }));
  }, [bookingTrends]);

  const earningsBarData = useMemo(() => {
    return filteredEarnings
      .slice()
      .sort((a, b) => b.earnings - a.earnings)
      .map((e) => ({
        name: e.facilityName,
        bookings: e.bookings,
        earnings: e.earnings,
      }));
  }, [filteredEarnings]);

  // Dummy data toggling
  const applyDummyData = () => {
    const dummyFacilities: Facility[] = [
      {
        id: 'fac-1',
        ownerId: 'owner-1',
        name: 'Metro Sports Arena',
        description: 'Indoor multi-sport center',
        address: '123 Main St',
        shortLocation: 'Downtown',
        status: 'APPROVED',
        amenities: null,
        about: null,
        avgRating: 4.5 as unknown as number, // acceptable mock
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        startingPrice: 20,
        sportTypes: ['Badminton', 'Tennis'],
        courtsCount: 5,
        reviewsCount: 42,
      },
      {
        id: 'fac-2',
        ownerId: 'owner-1',
        name: 'Greenfield Turf',
        description: 'Outdoor turf ground',
        address: '456 Elm Ave',
        shortLocation: 'Uptown',
        status: 'APPROVED',
        amenities: null,
        about: null,
        avgRating: 4.2 as unknown as number,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        startingPrice: 35,
        sportTypes: ['Football'],
        courtsCount: 2,
        reviewsCount: 18,
      },
      {
        id: 'fac-3',
        ownerId: 'owner-1',
        name: 'Riverside Courts',
        description: 'Tennis and table tennis',
        address: '789 River Rd',
        shortLocation: 'Riverside',
        status: 'APPROVED',
        amenities: null,
        about: null,
        avgRating: 4.7 as unknown as number,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        startingPrice: 25,
        sportTypes: ['Tennis', 'Table Tennis'],
        courtsCount: 6,
        reviewsCount: 27,
      },
    ];

    const dummyStats: OwnerDashboardStats = {
      totalBookings: 128,
      activeCourts: 11,
      totalEarnings: 5432,
      totalFacilities: 3,
      pendingBookings: 7,
      confirmedBookings: 96,
      cancelledBookings: 25,
      averageBookingValue: 42.5,
      thisMonthEarnings: 1234,
      lastMonthEarnings: 1100,
      growthPercentage: 12.2,
    };

    const today = new Date();
    const dummyTrends: BookingTrend[] = Array.from({ length: 14 }).map((_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (13 - i));
      return {
        period: d.toISOString().split('T')[0],
        bookings: Math.floor(5 + Math.random() * 15),
        earnings: Math.floor(100 + Math.random() * 400),
        date: d.toISOString(),
      };
    });

    const dummyEarnings: EarningsSummary[] = [
      { facilityId: 'fac-1', facilityName: 'Metro Sports Arena', bookings: 54, earnings: 2120 },
      { facilityId: 'fac-2', facilityName: 'Greenfield Turf', bookings: 31, earnings: 1750 },
      { facilityId: 'fac-3', facilityName: 'Riverside Courts', bookings: 43, earnings: 1562 },
    ];

    const dummyPeak: PeakHours[] = [
      { hour: 18, dayOfWeek: 5, bookings: 12, hourLabel: '6 PM', dayLabel: 'Friday' },
      { hour: 19, dayOfWeek: 6, bookings: 15, hourLabel: '7 PM', dayLabel: 'Saturday' },
      { hour: 20, dayOfWeek: 6, bookings: 9, hourLabel: '8 PM', dayLabel: 'Saturday' },
    ];

    setFacilities(dummyFacilities);
    setStats(dummyStats);
    setBookingTrends(dummyTrends);
    setEarningsSummary(dummyEarnings);
    setPeakHours(dummyPeak);
    setIsLoading(false);
  };

  const toggleTestData = () => {
    if (useTestData) {
      // switch back to live
      setUseTestData(false);
      setIsLoading(true);
      loadFacilities();
      loadAnalytics();
    } else {
      setUseTestData(true);
      applyDummyData();
    }
  };

  const handleExportExcel = async () => {
    try {
      const xlsx = await import('xlsx');
      const wb = xlsx.utils.book_new();

      const trendsSheet = xlsx.utils.json_to_sheet(bookingTrendsChartData);
      xlsx.utils.book_append_sheet(wb, trendsSheet, 'Booking_Trends');

      const earningsSheet = xlsx.utils.json_to_sheet(
        earningsSummary.map((e) => ({
          Facility: e.facilityName,
          Region: facilityById.get(e.facilityId)?.shortLocation || '-',
          Bookings: e.bookings,
          Earnings: e.earnings,
        }))
      );
      xlsx.utils.book_append_sheet(wb, earningsSheet, 'Earnings_By_Facility');

      xlsx.writeFile(wb, 'owner-analytics.xlsx');
      toast.success('Exported to Excel');
    } catch (e) {
      console.error(e);
      toast.error('Failed to export Excel');
    }
  };

  const handleExportPdf = async () => {
    try {
      const jsPDF = (await import('jspdf')).default;
      const autoTable = (await import('jspdf-autotable')).default;
      const doc = new jsPDF({ orientation: 'landscape' });

      doc.setFontSize(16);
      doc.text('Owner Analytics', 14, 16);

      // Earnings table
      const earningsRows = earningsSummary.map((e) => [
        e.facilityName,
        facilityById.get(e.facilityId)?.shortLocation || '-',
        e.bookings.toString(),
        e.earnings.toFixed(2),
      ]);
      autoTable(doc, {
        head: [['Facility', 'Region', 'Bookings', 'Earnings']],
        body: earningsRows,
        startY: 24,
      });

      doc.save('owner-analytics.pdf');
      toast.success('Exported to PDF');
    } catch (e) {
      console.error(e);
      toast.error('Failed to export PDF');
    }
  };

  return (
    <div className='space-y-6 p-6'>
      <div className='flex flex-col justify-between gap-4 md:flex-row md:items-center'>
        <div>
          <h1 className='text-2xl font-semibold tracking-tight'>Analytics</h1>
          <p className='text-muted-foreground'>
            Explore bookings, earnings, and peak hours. Filter by date, period, facility, and region.
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Button variant={useTestData ? 'default' : 'outline'} onClick={toggleTestData}>
            {useTestData ? (
              <>
                <Database className='mr-2 h-4 w-4' /> Use Live Data
              </>
            ) : (
              <>
                <FlaskConical className='mr-2 h-4 w-4' /> Use Test Data
              </>
            )}
          </Button>
          <Button variant='outline' onClick={handleExportExcel}>
            <FileSpreadsheet className='mr-2 h-4 w-4' /> Export Excel
          </Button>
          <Button variant='outline' onClick={handleExportPdf}>
            <FileText className='mr-2 h-4 w-4' /> Export PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Filter className='h-5 w-5' /> Filters
          </CardTitle>
          <CardDescription>Refine analytics with date range, period, facility, and region.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
            <div>
              <label className='mb-2 block text-sm font-medium'>Date Range</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant='outline' className='w-full justify-start text-left font-normal'>
                    <CalendarIcon className='mr-2 h-4 w-4' />
                    {dateRange.from ? (
                      dateRange.to ? (
                        <span>
                          {format(dateRange.from, 'LLL dd, y')} - {format(dateRange.to, 'LLL dd, y')}
                        </span>
                      ) : (
                        <span>{format(dateRange.from, 'LLL dd, y')}</span>
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-auto p-0' align='start'>
                  <Calendar
                    mode='range'
                    selected={{ from: dateRange.from, to: dateRange.to }}
                    onSelect={(range) => setDateRange(range as DateRange)}
                    initialFocus
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <label className='mb-2 block text-sm font-medium'>Period</label>
              <Select value={selectedPeriod} onValueChange={(v) => setSelectedPeriod(v as typeof selectedPeriod)}>
                <SelectTrigger>
                  <SelectValue placeholder='Select period' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='daily'>Daily</SelectItem>
                  <SelectItem value='weekly'>Weekly</SelectItem>
                  <SelectItem value='monthly'>Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className='mb-2 block text-sm font-medium'>Facility</label>
              <Select value={selectedFacility} onValueChange={setSelectedFacility}>
                <SelectTrigger>
                  <SelectValue placeholder='All facilities' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All facilities</SelectItem>
                  {facilities.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className='mb-2 block text-sm font-medium'>Region</label>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger>
                  <SelectValue placeholder='All regions' />
                </SelectTrigger>
                <SelectContent>
                  {regions.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r === 'all' ? 'All regions' : r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      {!isLoading && stats && (
        <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
          <Card>
            <CardHeader>
              <CardDescription>Total Bookings</CardDescription>
              <CardTitle>{stats.totalBookings.toLocaleString()}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Active Courts</CardDescription>
              <CardTitle>{stats.activeCourts.toLocaleString()}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Total Earnings</CardDescription>
              <CardTitle>
                {stats.totalEarnings.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Growth</CardDescription>
              <CardTitle>
                <span className={stats.growthPercentage >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {stats.growthPercentage.toFixed(1)}%
                </span>
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
      )}

      {/* Charts */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <BarChart3 className='h-5 w-5' /> Booking Trends
            </CardTitle>
            <CardDescription>Bookings and earnings over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                bookings: { label: 'Bookings', color: 'hsl(var(--primary))' },
                earnings: { label: 'Earnings', color: 'hsl(var(--muted-foreground))' },
              }}
            >
              <ResponsiveContainer>
                <LineChart data={bookingTrendsChartData} margin={{ left: 8, right: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='date' tick={{ fontSize: 12 }} />
                  <YAxis yAxisId='left' tick={{ fontSize: 12 }} />
                  <YAxis yAxisId='right' orientation='right' tick={{ fontSize: 12 }} />
                  <RechartsTooltip content={<ChartTooltipContent />} />
                  <Line
                    yAxisId='left'
                    type='monotone'
                    dataKey='bookings'
                    stroke='var(--color-bookings)'
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    yAxisId='right'
                    type='monotone'
                    dataKey='earnings'
                    stroke='var(--color-earnings)'
                    strokeWidth={2}
                    dot={false}
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Earnings by Facility</CardTitle>
            <CardDescription>Top earning facilities in selected range</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{ earnings: { label: 'Earnings', color: 'hsl(var(--primary))' } }}>
              <ResponsiveContainer>
                <BarChart data={earningsBarData} margin={{ left: 8, right: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='name' tick={{ fontSize: 12 }} interval={0} angle={-15} height={60} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey='earnings' fill='var(--color-earnings)' radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Earnings by Facility (Table)</CardTitle>
          <CardDescription>Region-aware summary for advanced analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Facility</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead className='text-right'>Bookings</TableHead>
                  <TableHead className='text-right'>Earnings</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEarnings.map((e) => (
                  <TableRow key={e.facilityId}>
                    <TableCell>{e.facilityName}</TableCell>
                    <TableCell>{facilityById.get(e.facilityId)?.shortLocation || '-'}</TableCell>
                    <TableCell className='text-right'>{e.bookings.toLocaleString()}</TableCell>
                    <TableCell className='text-right'>
                      {e.earnings.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}
                    </TableCell>
                  </TableRow>
                ))}
                {filteredEarnings.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className='text-muted-foreground text-center'>
                      No data for selected filters
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
