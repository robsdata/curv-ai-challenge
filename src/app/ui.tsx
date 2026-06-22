'use client';

import { Card, CardContent, Typography, Box, Stack, LinearProgress, Select, MenuItem } from '@mui/material';
import { UI, CATEGORY_COLORS } from './palette';

// --- Formatting helpers -----------------------------------------------------

export const fmtUSD = (n: number) => `$${Math.round(n).toLocaleString('en-US')}`;
export const fmtK = (n: number) => (n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${Math.round(n)}`);
export const fmtPrice = (n: number) => `$${n.toFixed(2)}`;
export const fmtNum = (n: number) => Math.round(n).toLocaleString('en-US');

// --- Building blocks --------------------------------------------------------

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Typography variant="overline" sx={{ color: UI.accText, letterSpacing: 1, fontWeight: 700 }}>
      {children}
    </Typography>
  );
}

// A single headline number with an optional sub-line and icon.
export function StatCard({ label, value, sub, icon, valueColor }: { label: string; value: string; sub?: React.ReactNode; icon?: React.ReactNode; valueColor?: string }) {
  return (
    <Card>
      <CardContent>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <SectionLabel>{label}</SectionLabel>
            <Typography variant="h4" sx={{ fontWeight: 800, color: valueColor ?? UI.acc, lineHeight: 1.15, mt: 0.5 }}>
              {value}
            </Typography>
            {sub != null && (
              <Typography variant="body2" sx={{ color: UI.muted, mt: 0.5 }}>{sub}</Typography>
            )}
          </Box>
          {icon && <Box sx={{ color: UI.accDark, opacity: 0.9 }}>{icon}</Box>}
        </Stack>
      </CardContent>
    </Card>
  );
}

// An always-editable dropdown whose background reflects the current value —
// used for the fast inline triage actions (status, priority, region, channel).
export function ColorSelect({
  value, options, colorFor, onChange, display = (v) => v, minWidth = 120,
}: {
  value: string;
  options: readonly string[];
  colorFor: (v: string) => { bg: string; text: string };
  onChange: (v: string) => void;
  display?: (v: string) => string;
  minWidth?: number;
}) {
  const c = colorFor(value);
  return (
    <Select
      size="small"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      sx={{
        minWidth,
        fontWeight: 700,
        color: c.text,
        bgcolor: c.bg,
        '& .MuiSelect-icon': { color: c.text },
        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: c.text },
      }}
    >
      {options.map((o) => <MenuItem key={o} value={o}>{display(o)}</MenuItem>)}
    </Select>
  );
}

export interface BreakdownItem {
  label: string;
  value: number;
  color?: string;
}

// A compact category breakdown: labeled rows with proportional bars.
// Best practice for a handful of categories inside a KPI-sized card.
export function BreakdownCard({ title, items, format }: { title: string; items: BreakdownItem[]; format?: (n: number) => string }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <Card>
      <CardContent>
        <SectionLabel>{title}</SectionLabel>
        <Stack sx={{ gap: 1.1, mt: 1.5 }}>
          {items.map((it, i) => (
            <Box key={it.label}>
              <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.4 }}>
                <Typography variant="body2" sx={{ color: UI.text }}>{it.label}</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{format ? format(it.value) : it.value}</Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={(it.value / max) * 100}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  bgcolor: UI.field,
                  '& .MuiLinearProgress-bar': { backgroundColor: it.color ?? CATEGORY_COLORS[i % CATEGORY_COLORS.length], borderRadius: 3 },
                }}
              />
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
