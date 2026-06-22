'use client';

import { useMemo } from 'react';
import { Card, CardContent, Typography, Box, Skeleton } from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import { LineChart } from '@mui/x-charts/LineChart';
import PaidIcon from '@mui/icons-material/Paid';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import StorefrontIcon from '@mui/icons-material/Storefront';
import salesData from '../../data/sales.json';
import inquiriesData from '../../data/inquiries.json';
import accountsData from '../../data/accounts.json';
import { UI, VIZ } from './palette';
import { SectionLabel, StatCard, fmtUSD, fmtK, fmtPrice } from './ui';
import { useMounted } from './useMounted';

interface Sale {
  region: string;
  product: string;
  revenue: number;
  units_lbs: number;
  date: string;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Monday that starts the week containing `dateStr`.
function weekStart(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00Z');
  const offset = (d.getUTCDay() + 6) % 7; // Mon = 0 (UTC-based so server & client agree)
  d.setUTCDate(d.getUTCDate() - offset);
  return d.toISOString().slice(0, 10);
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardContent>
        <SectionLabel>{title}</SectionLabel>
        {subtitle && <Typography variant="caption" sx={{ color: UI.muted, display: 'block', mb: 0.5 }}>{subtitle}</Typography>}
        <Box sx={{ mt: 1 }}>{children}</Box>
      </CardContent>
    </Card>
  );
}

// Horizontal bars are the best choice for ranking a few named categories:
// the labels read left-to-right and the values sit at the end of each bar.
function RankedBars({ categories, values, color, axisWidth = 150 }: { categories: string[]; values: number[]; color: string; axisWidth?: number }) {
  return (
    <BarChart
      layout="horizontal"
      height={Math.max(180, categories.length * 46)}
      yAxis={[{ scaleType: 'band', data: categories, disableLine: true, disableTicks: true, width: axisWidth, tickLabelStyle: { fill: UI.text, fontSize: 12 } }]}
      xAxis={[{ position: 'none' }]}
      series={[{
        data: values,
        color,
        barLabel: (item) => (item.value != null ? fmtK(item.value) : ''),
        barLabelPlacement: 'outside',
      }]}
      slotProps={{ barLabel: { style: { fill: UI.text, fontWeight: 700, fontSize: 12 } } }}
      margin={{ top: 6, right: 52, bottom: 6, left: 6 }}
    />
  );
}

// Compact 2x2 of volume-weighted average price per lb for each region. Prices
// cluster in a narrow band, so exact figures read better than length-based bars.
function PriceByRegionCard({ items }: { items: { region: string; price: number }[] }) {
  return (
    <Card>
      <CardContent>
        <SectionLabel>Avg Price / lb by Region</SectionLabel>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.25, mt: 1.5 }}>
          {items.map((it) => (
            <Box key={it.region}>
              <Typography variant="caption" sx={{ color: UI.muted, display: 'block', lineHeight: 1.3 }}>{it.region}</Typography>
              <Typography variant="h6" sx={{ fontWeight: 800, color: UI.acc, lineHeight: 1.2 }}>{fmtPrice(it.price)}</Typography>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const stats = useMemo(() => {
    const sales = salesData as Sale[];
    const totalRevenue = sales.reduce((sum, s) => sum + s.revenue, 0);
    const newLeads = (inquiriesData as { status: string }[]).filter((i) => i.status === 'new').length;
    const totalInquiries = (inquiriesData as unknown[]).length;
    const accounts = accountsData as { status: string }[];
    const activeAccounts = accounts.filter((a) => a.status === 'active').length;
    const pausedAccounts = accounts.length - activeAccounts;

    // Revenue + units by region (revenue sorted high -> low; price = revenue / lbs)
    const regionRev: Record<string, number> = {};
    const regionUnits: Record<string, number> = {};
    sales.forEach((s) => {
      regionRev[s.region] = (regionRev[s.region] || 0) + s.revenue;
      regionUnits[s.region] = (regionUnits[s.region] || 0) + s.units_lbs;
    });
    const regions = Object.entries(regionRev).sort((a, b) => b[1] - a[1]);
    const priceByRegion = Object.keys(regionRev)
      .map((r) => ({ region: r, price: regionRev[r] / regionUnits[r] }))
      .sort((a, b) => b.price - a.price);

    // Revenue by product (sorted high -> low)
    const productMap: Record<string, number> = {};
    sales.forEach((s) => { productMap[s.product] = (productMap[s.product] || 0) + s.revenue; });
    const products = Object.entries(productMap).sort((a, b) => b[1] - a[1]);

    // Revenue trend by week (proper time series)
    const weekMap: Record<string, number> = {};
    sales.forEach((s) => { const w = weekStart(s.date); weekMap[w] = (weekMap[w] || 0) + s.revenue; });
    const weekKeys = Object.keys(weekMap).sort();
    const weekLabels = weekKeys.map((w) => { const d = new Date(w + 'T00:00:00'); return `${MONTHS[d.getMonth()]} ${d.getDate()}`; });
    const weekValues = weekKeys.map((w) => Math.round(weekMap[w]));

    return {
      totalRevenue, newLeads, totalInquiries, activeAccounts, pausedAccounts,
      regions, products, weekLabels, weekValues, priceByRegion,
    };
  }, []);

  // Charts render client-only: MUI X Charts measure the container, which differs
  // between server and client and would otherwise trip React hydration.
  const mounted = useMounted();

  if (!salesData.length) {
    return <Typography sx={{ color: UI.muted }}>No data available.</Typography>;
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>Dashboard</Typography>
      <Typography variant="body2" sx={{ color: UI.muted, mb: 3 }}>
        Sales over the last 90 days, plus where new demand is coming from.
      </Typography>

      {/* Headline numbers */}
      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', mb: 2 }}>
        <StatCard label="Total Revenue" value={fmtUSD(stats.totalRevenue)} sub="Last 90 days" icon={<PaidIcon fontSize="large" />} />
        <StatCard label="New Leads" value={String(stats.newLeads)} sub={`of ${stats.totalInquiries} inquiries`} icon={<GroupAddIcon fontSize="large" />} />
        <StatCard label="Active Accounts" value={String(stats.activeAccounts)} sub={`${stats.pausedAccounts} paused`} icon={<StorefrontIcon fontSize="large" />} />
        <PriceByRegionCard items={stats.priceByRegion} />
      </Box>

      {/* Trend over time — a line chart is the right tool for a time series */}
      <Box sx={{ mb: 2 }}>
        <ChartCard title="Weekly Revenue Trend" subtitle="Total wholesale revenue per week">
          {!mounted ? <Skeleton variant="rectangular" height={300} /> : <LineChart
            height={300}
            xAxis={[{ scaleType: 'point', data: stats.weekLabels, tickLabelStyle: { fill: UI.muted, fontSize: 11 } }]}
            yAxis={[{ valueFormatter: (v: number) => fmtK(v), tickLabelStyle: { fill: UI.muted, fontSize: 11 }, width: 52 }]}
            series={[{ data: stats.weekValues, color: VIZ.gold, area: true, showMark: true, curve: 'monotoneX', valueFormatter: (v) => (v != null ? fmtUSD(v) : '') }]}
            grid={{ horizontal: true }}
            margin={{ top: 16, right: 20, bottom: 24, left: 8 }}
            sx={{
              '& .MuiAreaElement-root': { fillOpacity: 0.12 },
              '& .MuiChartsAxis-line, & .MuiChartsAxis-tick': { stroke: UI.line },
              '& .MuiChartsGrid-line': { stroke: UI.line, strokeDasharray: '3 3' },
            }}
          />}
        </ChartCard>
      </Box>

      {/* Category comparisons — sorted horizontal bars */}
      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
        <ChartCard title="Revenue by Region">
          {!mounted ? <Skeleton variant="rectangular" height={200} /> : <RankedBars categories={stats.regions.map((r) => r[0])} values={stats.regions.map((r) => r[1])} color={VIZ.teal} axisWidth={140} />}
        </ChartCard>
        <ChartCard title="Revenue by Product">
          {!mounted ? <Skeleton variant="rectangular" height={250} /> : <RankedBars categories={stats.products.map((p) => p[0])} values={stats.products.map((p) => p[1])} color={VIZ.gold} axisWidth={160} />}
        </ChartCard>
      </Box>
    </Box>
  );
}
