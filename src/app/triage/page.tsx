'use client';

import { useMemo, useState } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Button, Skeleton, Stack, Tooltip, IconButton, Snackbar, Alert,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import inquiriesData from '../../../data/inquiries.json';
import { UI, VIZ, PRIORITY_COLORS, STATUS_COLORS, STATUSES, PRIORITIES, REGIONS, CHANNELS, titleCase } from '../palette';
import { StatCard, BreakdownCard, ColorSelect, fmtNum } from '../ui';
import { RecordDrawer, FieldDef } from '../RecordDrawer';
import { useEditable } from '../useEditable';

interface Inquiry {
  id: string;
  cafe_name: string;
  contact_name: string;
  email: string;
  region: string;
  channel: string;
  requested_volume_lbs_month: number;
  message: string;
  received_date: string;
  status: string;
  priority?: string;
  [k: string]: unknown;
}

function priorityFor(volume: number): 'Hot' | 'Warm' | 'Cold' {
  if (volume > 200) return 'Hot';
  if (volume >= 100) return 'Warm';
  return 'Cold';
}

const STATUS_RANK: Record<string, number> = { new: 0, contacted: 1, qualified: 2, closed: 3 };
const neutral = () => ({ bg: UI.field, text: UI.text });

const DRAWER_FIELDS: FieldDef[] = [
  { key: 'cafe_name', label: 'Café', type: 'text' },
  { key: 'contact_name', label: 'Contact name', type: 'text' },
  { key: 'email', label: 'Email', type: 'email' },
  { key: 'requested_volume_lbs_month', label: 'Requested volume (lbs/mo)', type: 'number' },
  { key: 'received_date', label: 'Received date', type: 'date' },
  { key: 'message', label: 'Message', type: 'multiline' },
];

export default function LeadsPage() {
  const seed = useMemo(
    () =>
      [...(inquiriesData as Inquiry[])].sort(
        (a, b) =>
          (STATUS_RANK[a.status] ?? 9) - (STATUS_RANK[b.status] ?? 9) ||
          b.requested_volume_lbs_month - a.requested_volume_lbs_month,
      ),
    [],
  );

  const { records, mounted, commitField, updateRecord, reset } = useEditable<Inquiry>('northwind_inquiries', seed);
  const [editId, setEditId] = useState<string | null>(null);
  const [snack, setSnack] = useState(false);

  const effPriority = (r: Inquiry) => (r.priority as string) ?? priorityFor(Number(r.requested_volume_lbs_month));

  const summary = useMemo(() => {
    const open = records.filter((r) => r.status !== 'closed');
    const openVolume = open.reduce((s, r) => s + Number(r.requested_volume_lbs_month), 0);
    const newOnes = records.filter((r) => r.status === 'new');
    const newHot = newOnes.filter((r) => effPriority(r) === 'Hot').length;
    const byStatus = STATUSES.map((s) => ({ label: titleCase(s), value: records.filter((r) => r.status === s).length, color: STATUS_COLORS[s].bg }));
    return { openCount: open.length, openVolume, newCount: newOnes.length, newHot, byStatus };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [records]);

  const editing = editId ? records.find((r) => r.id === editId) ?? null : null;

  return (
    <Box>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-end', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>Leads</Typography>
          <Typography variant="body2" sx={{ color: UI.muted, mt: 0.5 }}>
            Cafés that asked to buy coffee — biggest orders are &quot;Hot&quot;, untouched ones sit on top.
          </Typography>
        </Box>
        <Stack direction="row" sx={{ gap: 1 }}>
          <Button variant="outlined" startIcon={<RestartAltIcon />} onClick={reset} sx={{ borderColor: UI.line, color: UI.muted }}>Reset</Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setSnack(true)}>Add Lead</Button>
        </Stack>
      </Stack>

      {/* Action-oriented summary */}
      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', mb: 2 }}>
        <StatCard label="Open Pipeline" value={`${fmtNum(summary.openVolume)} lbs/mo`} sub={`${summary.openCount} open leads`} />
        <StatCard label="Needs First Contact" value={String(summary.newCount)} sub={`${summary.newHot} are hot · act now`} valueColor={summary.newHot > 0 ? VIZ.red : UI.acc} />
        <BreakdownCard title="Pipeline by Status" items={summary.byStatus} />
      </Box>

      {!mounted ? (
        <Skeleton variant="rectangular" height={480} />
      ) : (
        <TableContainer component={Paper} sx={{ border: `1px solid ${UI.line}` }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ '& th': { borderColor: UI.line } }}>
                {['', 'Café', 'Priority', 'Status', 'Volume', 'Region', 'Channel', 'Contact', 'Email', 'Date', 'Message'].map((h, i) => (
                  <TableCell key={i} align={i === 0 ? 'left' : 'center'} sx={{ fontWeight: 700, color: UI.muted, whiteSpace: 'nowrap' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {records.map((row) => (
                <TableRow key={row.id} hover sx={{ '& td': { borderColor: UI.line } }}>
                  <TableCell>
                    <Tooltip title="Edit details" arrow>
                      <IconButton size="small" onClick={() => setEditId(row.id)} sx={{ color: UI.muted, '&:hover': { color: UI.acc } }}><EditIcon fontSize="small" /></IconButton>
                    </Tooltip>
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>{row.cafe_name}</TableCell>
                  <TableCell align="center"><ColorSelect value={effPriority(row)} options={PRIORITIES} colorFor={(v) => PRIORITY_COLORS[v]} onChange={(v) => commitField(row.id, 'priority', v)} minWidth={96} /></TableCell>
                  <TableCell align="center"><ColorSelect value={row.status} options={STATUSES} colorFor={(v) => STATUS_COLORS[v] ?? STATUS_COLORS.new} display={titleCase} onChange={(v) => commitField(row.id, 'status', v)} minWidth={128} /></TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>{row.requested_volume_lbs_month}</TableCell>
                  <TableCell align="center"><ColorSelect value={row.region} options={REGIONS} colorFor={neutral} onChange={(v) => commitField(row.id, 'region', v)} minWidth={150} /></TableCell>
                  <TableCell align="center"><ColorSelect value={row.channel} options={CHANNELS} colorFor={neutral} display={titleCase} onChange={(v) => commitField(row.id, 'channel', v)} minWidth={140} /></TableCell>
                  <TableCell align="center">{row.contact_name}</TableCell>
                  <TableCell align="center" sx={{ color: UI.muted }}>{row.email}</TableCell>
                  <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>{row.received_date}</TableCell>
                  <TableCell align="center" sx={{ maxWidth: 220 }}>
                    <Tooltip title={row.message} arrow placement="top">
                      <Box sx={{ maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: UI.muted, cursor: 'help', mx: 'auto' }}>{row.message}</Box>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <RecordDrawer
        open={editId !== null}
        title="Edit Lead"
        subtitle={editing?.cafe_name}
        fields={DRAWER_FIELDS}
        values={editing}
        onClose={() => setEditId(null)}
        onSave={(v) => { if (editId) updateRecord(editId, v); setEditId(null); }}
      />

      <Snackbar open={snack} autoHideDuration={3500} onClose={() => setSnack(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="info" variant="filled" onClose={() => setSnack(false)}>Adding new leads is planned for a future iteration.</Alert>
      </Snackbar>
    </Box>
  );
}
