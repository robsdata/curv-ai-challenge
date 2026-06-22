'use client';

import { AppBar, Toolbar, Typography, Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import SpaceDashboardIcon from '@mui/icons-material/SpaceDashboard';
import MoveToInboxIcon from '@mui/icons-material/MoveToInbox';
import StorefrontIcon from '@mui/icons-material/Storefront';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UI } from './palette';

const DRAWER_WIDTH = 230;

// Plain-language labels so anyone can understand the navigation.
const navItems = [
  { label: 'Dashboard', href: '/', icon: <SpaceDashboardIcon /> },
  { label: 'Leads', href: '/triage', icon: <MoveToInboxIcon /> },
  { label: 'Accounts', href: '/accounts', icon: <StorefrontIcon /> },
  { label: 'Contacts', href: '/contacts', icon: <PeopleAltIcon /> },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: (t) => t.zIndex.drawer + 1,
          bgcolor: UI.surface,
          borderBottom: `1px solid ${UI.line}`,
        }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap sx={{ fontWeight: 700 }}>
            <Box component="span" sx={{ color: UI.acc }}>☕ Northwind Coffee</Box>
            <Box component="span" sx={{ color: UI.muted, fontWeight: 400 }}>  ·  Command Center</Box>
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            bgcolor: UI.surface,
            borderRight: `1px solid ${UI.line}`,
          },
        }}
      >
        <Toolbar />
        <List sx={{ px: 1, pt: 1 }}>
          {navItems.map((item) => {
            const selected = pathname === item.href;
            return (
              <ListItemButton
                key={item.href}
                component={Link}
                href={item.href}
                selected={selected}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  color: selected ? UI.acc : UI.text,
                  '& .MuiListItemIcon-root': { color: selected ? UI.acc : UI.muted },
                  '&.Mui-selected': { bgcolor: 'rgba(226,165,60,0.12)' },
                  '&.Mui-selected:hover': { bgcolor: 'rgba(226,165,60,0.18)' },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={<Typography sx={{ fontWeight: selected ? 700 : 500 }}>{item.label}</Typography>} />
              </ListItemButton>
            );
          })}
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, minWidth: 0, p: 3, mt: 8, bgcolor: UI.bg, minHeight: '100vh' }}>
        {children}
      </Box>
    </Box>
  );
}
