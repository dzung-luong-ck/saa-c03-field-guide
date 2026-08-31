import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SAA-C03 Field Guide — Ôn thi trong 7 ngày',
  description:
    'Cheatsheet AWS Solutions Architect Associate SAA-C03 bằng tiếng Việt, chia theo lộ trình 7 ngày.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
