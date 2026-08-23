import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://bharatrates.pages.dev'),
  title: 'BharatRates — Live Civil Material Prices Across India',
  description:
    'Real-time AI-backed daily prices for steel, cement, sand and aggregates across Indian states.',
  openGraph: {
    title: 'BharatRates — Live Civil Material Prices Across India',
    description:
      'Real-time AI-backed daily prices for steel, cement, sand and aggregates across Indian states.',
    images: [{ url: 'https://bolt.new/static/og_default.png' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: [{ url: 'https://bolt.new/static/og_default.png' }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
