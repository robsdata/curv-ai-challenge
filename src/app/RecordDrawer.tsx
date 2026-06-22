'use client';

import { useState, useEffect } from 'react';
import { Drawer, Box, Typography, TextField, MenuItem, Button, Stack, IconButton, Divider } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { UI } from './palette';

export interface FieldDef {
  key: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'date' | 'multiline' | 'select';
  options?: readonly string[];
  display?: (v: string) => string;
}

// A spacious side-panel form for editing one record's free-text / number / date
// fields — far more usable than cramped inline cells, with proper labels and a
// clear Save / Cancel. Categorical fields stay as inline dropdowns in the table.
export function RecordDrawer({
  open, title, subtitle, fields, values, onClose, onSave,
}: {
  open: boolean;
  title: string;
  subtitle?: string;
  fields: FieldDef[];
  values: Record<string, unknown> | null;
  onClose: () => void;
  onSave: (v: Record<string, unknown>) => void;
}) {
  const [draft, setDraft] = useState<Record<string, unknown>>({});

  useEffect(() => {
    if (values) setDraft({ ...values });
  }, [values]);

  const set = (k: string, v: unknown) => setDraft((d) => ({ ...d, [k]: v }));

  return (
    <Drawer anchor="right" open={open} onClose={onClose} slotProps={{ paper: { sx: { width: { xs: '100%', sm: 440 }, bgcolor: UI.surface, backgroundImage: 'none' } } }}>
      <Box sx={{ p: 3 }}>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>{title}</Typography>
            {subtitle && <Typography variant="body2" sx={{ color: UI.muted }}>{subtitle}</Typography>}
          </Box>
          <IconButton onClick={onClose} sx={{ color: UI.muted }}><CloseIcon /></IconButton>
        </Stack>
        <Divider sx={{ borderColor: UI.line, mb: 3 }} />

        <Stack sx={{ gap: 2.5 }}>
          {fields.map((f) =>
            f.type === 'select' ? (
              <TextField key={f.key} select label={f.label} value={String(draft[f.key] ?? '')} onChange={(e) => set(f.key, e.target.value)} fullWidth size="small">
                {f.options!.map((o) => <MenuItem key={o} value={o}>{f.display ? f.display(o) : o}</MenuItem>)}
              </TextField>
            ) : (
              <TextField
                key={f.key}
                label={f.label}
                type={f.type === 'multiline' || f.type === 'email' ? 'text' : f.type}
                multiline={f.type === 'multiline'}
                minRows={f.type === 'multiline' ? 3 : undefined}
                value={String(draft[f.key] ?? '')}
                onChange={(e) => set(f.key, f.type === 'number' ? Number(e.target.value) : e.target.value)}
                fullWidth
                size="small"
                slotProps={f.type === 'date' ? { inputLabel: { shrink: true } } : undefined}
              />
            ),
          )}
        </Stack>

        <Stack direction="row" sx={{ gap: 1.5, mt: 4 }}>
          <Button fullWidth variant="outlined" onClick={onClose} sx={{ borderColor: UI.line, color: UI.muted }}>Cancel</Button>
          <Button fullWidth variant="contained" onClick={() => onSave(draft)}>Save</Button>
        </Stack>
      </Box>
    </Drawer>
  );
}
