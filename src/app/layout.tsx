import type { Metadata } from 'next';
import ThemeRegistry from './ThemeRegistry';
import AppShell from './AppShell';

export const metadata: Metadata = {
  title: 'Northwind Coffee — Command Center',
  description: 'Internal dashboard for Northwind Coffee operations',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeRegistry>
          <AppShell>{children}</AppShell>
        </ThemeRegistry>
      </body>
    </html>
  );
}
