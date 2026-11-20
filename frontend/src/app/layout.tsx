import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/authContext';
import { AppShell } from '@/components/AppShell';

export const metadata: Metadata = {
  title: 'DeFi Yield Optimizer & Risk-Scoring Dashboard | AegisDeFi',
  description:
    'Institutional-grade DeFi analytics platform assessing smart contract code audits, liquidity risks, APY volatility, and multi-protocol portfolio optimization.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans bg-[#0B0F19] text-slate-100 antialiased selection:bg-emerald-500/30 selection:text-emerald-300">
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
