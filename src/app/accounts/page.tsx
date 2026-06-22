'use client';

import { useMemo, useState } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Button, Skeleton, Stack, Tooltip, IconButton, Snackbar, Alert,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import accountsData from '../../../data/accounts.json';
import { UI, VIZ, REGIONS, ACCOUNT_STATUSES, ACCOUNT_STATUS_COLORS, CATEGORY_COLORS, titleCase } from '../palette';
import { StatCard, BreakdownCard, ColorSelect, fmtNum } from '../ui';
import { RecordDrawer, FieldDef } from '../RecordDrawer';
import { useEditable } from '../useEditable';

interface Account {
  id: string;
  name: string;
  region: string;
  monthly_volume_lbs: number;
  customer_since: string;
  status: string;
  [k: string]: unknown;
}

const neutral = () => ({ bg: UI.field, text: UI.text });

const DRAWER_FIELDS: FieldDef[] = [
  { key: 'name', label: 'Company name', type: 'text' },
  { key: 'monthly_volume_lbs', label: 'Monthly volume (lbs)', type: 'number' },
  { key: 'customer_since', label: 'Customer since', type: 'date' },
];

export default function AccountsPage() {
  const seed = useMemo(() => [...(accountsData as Account[])].sort((a, b) => b.monthly_volume_lbs - a.monthly_volume_lbs), []);
  const { records, mounted, commitField, updateRecord, reset } = useEditable<Account>('northwind_accounts', seed);
  const [editId, setEditId] = useState<string | null>(null);
  const [snack, setSnack] = useState(false);

  const summary = useMemo(() => {
    const active = records.filter((a) => a.status === 'active');
    const paused = records.filter((a) => a.status === 'paused');
    const sum = (rows: Account[]) => rows.reduce((s, a) => s + Number(a.monthly_volume_lbs), 0);
    const byRegion = REGIONS.map((r, i) => ({ label: r, value: sum(records.filter((a) => a.region === r)), color: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }));
    return { activeCount: active.length, activeVol: sum(active), pausedCount: paused.length, pausedVol: sum(paused), byRegion };
  }, [records]);

  const editing = editId ? records.find((r) => r.id === editId) ?? null : null;

  return (
    <Box>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-end', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>Accounts</Typography>
          <Typography variant="body2" sx={{ color: UI.muted, mt: 0.5 }}>Cafés that already buy from us.</Typography>
        </Box>
        <Stack direction="row" sx={{ gap: 1 }}>
          <Button variant="outlined" startIcon={<RestartAltIcon />} onClick={reset} sx={{ borderColor: UI.line, color: UI.muted }}>Reset</Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setSnack(true)}>Add Account</Button>
        </Stack>
      </Stack>

      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', mb: 2 }}>
        <StatCard label="Monthly Volume" value={`${fmtNum(summary.activeVol)} lbs/mo`} sub={`${summary.activeCount} active accounts`} />
        <StatCard label="Paused — At Risk" value={String(summary.pausedCount)} sub={`${fmtNum(summary.pausedVol)} lbs/mo on hold`} valueColor={summary.pausedCount > 0 ? VIZ.amber : UI.acc} />
        <BreakdownCard title="Volume by Region" items={summary.byRegion} format={(n) => `${fmtNum(n)} lbs`} />
      </Box>

      {!mounted ? (
        <Skeleton variant="rectangular" height={480} />
      ) : (
        <TableContainer component={Paper} sx={{ border: `1px solid ${UI.line}` }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ '& th': { borderColor: UI.line } }}>
                {['', 'Company', 'Status', 'Region', 'Monthly Volume (lbs)', 'Customer Since'].map((h, i) => (
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
                  <TableCell align="center" sx={{ fontWeight: 600 }}>{row.name}</TableCell>
                  <TableCell align="center"><ColorSelect value={row.status} options={ACCOUNT_STATUSES} colorFor={(v) => ACCOUNT_STATUS_COLORS[v] ?? neutral()} display={titleCase} onChange={(v) => commitField(row.id, 'status', v)} minWidth={110} /></TableCell>
                  <TableCell align="center"><ColorSelect value={row.region} options={REGIONS} colorFor={neutral} onChange={(v) => commitField(row.id, 'region', v)} minWidth={150} /></TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>{row.monthly_volume_lbs}</TableCell>
                  <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>{row.customer_since}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <RecordDrawer
        open={editId !== null}
        title="Edit Account"
        subtitle={editing?.name}
        fields={DRAWER_FIELDS}
        values={editing}
        onClose={() => setEditId(null)}
        onSave={(v) => { if (editId) updateRecord(editId, v); setEditId(null); }}
      />

      <Snackbar open={snack} autoHideDuration={3500} onClose={() => setSnack(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="info" variant="filled" onClose={() => setSnack(false)}>Adding new accounts is planned for a future iteration.</Alert>
      </Snackbar>
    </Box>
  );
}
