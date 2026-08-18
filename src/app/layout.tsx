import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'sonner';
import QueryProvider from '@/providers/QueryProvider';
// TT Interphases Pro is disabled until a licensed copy is available — see src/fonts/README.md
// import { ttInterphases, ttInterphasesMono } from '@/fonts';

export const metadata: Metadata = {
  title: 'Dexxify - Crypto Infrastructure API for Africa',
  description:
    'One API to add crypto wallets, Naira settlement, swaps and KYC to your product. Stop integrating 5 vendors. Start building.',
  openGraph: {
    title: 'Dexxify - Crypto Infrastructure API for Africa',
    description:
      'One API to add crypto wallets, Naira settlement, swaps and KYC to your product.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased bg-background text-foreground">
        <QueryProvider>{children}</QueryProvider>
        <Toaster
          theme="light"
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--background)',
              border: '1px solid var(--border)',
              color: 'var(--foreground)',
            },
          }}
        />
      </body>
    </html>
  );
}
