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
import { UI, STATUS_COLORS, STATUSES, REGIONS, CHANNELS, CATEGORY_COLORS, titleCase } from '../palette';
import { StatCard, BreakdownCard, ColorSelect } from '../ui';
import { RecordDrawer, FieldDef } from '../RecordDrawer';
import { useEditable } from '../useEditable';

interface Contact {
  id: string;
  contact_name: string;
  email: string;
  cafe_name: string;
  region: string;
  channel: string;
  received_date: string;
  status: string;
  [k: string]: unknown;
}

const neutral = () => ({ bg: UI.field, text: UI.text });

const DRAWER_FIELDS: FieldDef[] = [
  { key: 'contact_name', label: 'Name', type: 'text' },
  { key: 'email', label: 'Email', type: 'email' },
  { key: 'cafe_name', label: 'Café', type: 'text' },
  { key: 'received_date', label: 'First reached out', type: 'date' },
];

export default function ContactsPage() {
  const seed = useMemo<Contact[]>(() => {
    const seen = new Set<string>();
    return (inquiriesData as Contact[])
      .filter((i) => { const k = i.email.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; })
      .map((i) => ({ id: i.id, contact_name: i.contact_name, email: i.email, cafe_name: i.cafe_name, region: i.region, channel: i.channel, received_date: i.received_date, status: i.status }))
      .sort((a, b) => a.contact_name.localeCompare(b.contact_name));
  }, []);

  const { records, mounted, commitField, updateRecord, reset } = useEditable<Contact>('northwind_contacts', seed);
  const [editId, setEditId] = useState<string | null>(null);
  const [snack, setSnack] = useState(false);

  const summary = useMemo(() => ({
    total: records.length,
    byChannel: CHANNELS.map((c, i) => ({ label: titleCase(c), value: records.filter((r) => r.channel === c).length, color: CATEGORY_COLORS[i % CATEGORY_COLORS.length] })),
    byRegion: REGIONS.map((r, i) => ({ label: r, value: records.filter((x) => x.region === r).length, color: CATEGORY_COLORS[i % CATEGORY_COLORS.length] })),
  }), [records]);

  const editing = editId ? records.find((r) => r.id === editId) ?? null : null;

  return (
    <Box>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-end', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>Contacts</Typography>
          <Typography variant="body2" sx={{ color: UI.muted, mt: 0.5 }}>Everyone who has reached out, and how to get back to them.</Typography>
        </Box>
        <Stack direction="row" sx={{ gap: 1 }}>
          <Button variant="outlined" startIcon={<RestartAltIcon />} onClick={reset} sx={{ borderColor: UI.line, color: UI.muted }}>Reset</Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setSnack(true)}>Add Contact</Button>
        </Stack>
      </Stack>

      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', mb: 2 }}>
        <StatCard label="Total Contacts" value={String(summary.total)} sub="Unique people" />
        <BreakdownCard title="By Acquisition Channel" items={summary.byChannel} />
        <BreakdownCard title="By Region" items={summary.byRegion} />
      </Box>

      {!mounted ? (
        <Skeleton variant="rectangular" height={480} />
      ) : (
        <TableContainer component={Paper} sx={{ border: `1px solid ${UI.line}` }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ '& th': { borderColor: UI.line } }}>
                {['', 'Name', 'Status', 'Region', 'Channel', 'Café', 'Email', 'First Contact'].map((h, i) => (
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
                  <TableCell align="center" sx={{ fontWeight: 600 }}>{row.contact_name}</TableCell>
                  <TableCell align="center"><ColorSelect value={row.status} options={STATUSES} colorFor={(v) => STATUS_COLORS[v] ?? STATUS_COLORS.new} display={titleCase} onChange={(v) => commitField(row.id, 'status', v)} minWidth={128} /></TableCell>
                  <TableCell align="center"><ColorSelect value={row.region} options={REGIONS} colorFor={neutral} onChange={(v) => commitField(row.id, 'region', v)} minWidth={150} /></TableCell>
                  <TableCell align="center"><ColorSelect value={row.channel} options={CHANNELS} colorFor={neutral} display={titleCase} onChange={(v) => commitField(row.id, 'channel', v)} minWidth={140} /></TableCell>
                  <TableCell align="center">{row.cafe_name}</TableCell>
                  <TableCell align="center" sx={{ color: UI.muted }}>{row.email}</TableCell>
                  <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>{row.received_date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <RecordDrawer
        open={editId !== null}
        title="Edit Contact"
        subtitle={editing?.contact_name}
        fields={DRAWER_FIELDS}
        values={editing}
        onClose={() => setEditId(null)}
        onSave={(v) => { if (editId) updateRecord(editId, v); setEditId(null); }}
      />

      <Snackbar open={snack} autoHideDuration={3500} onClose={() => setSnack(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="info" variant="filled" onClose={() => setSnack(false)}>Adding new contacts is planned for a future iteration.</Alert>
      </Snackbar>
    </Box>
  );
}
