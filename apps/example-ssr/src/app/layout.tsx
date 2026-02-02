import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Adhese SDK - Next.js SSR Example',
  description: 'Server-side ad fetching with client-side hydration and impression tracking',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactNode {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
