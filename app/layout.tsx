import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://saa-c03-field-guide-vn.ltdunggg.chatgpt.site'),
  title: 'SAA-C03 Field Guide — Ôn thi trong 7 ngày',
  description:
    'Cheatsheet AWS Solutions Architect Associate SAA-C03 bằng tiếng Việt, chia theo lộ trình 7 ngày.',
  openGraph: {
    title: 'SAA-C03 Field Guide',
    description: 'Ôn trọng tâm AWS Solutions Architect Associate trong 7 ngày.',
    type: 'website',
    locale: 'vi_VN',
    url: '/',
    images: [{ url: '/og.png', width: 1536, height: 1024, alt: 'SAA-C03 Field Guide — Ôn trọng tâm trong 7 ngày' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SAA-C03 Field Guide',
    description: 'Ôn trọng tâm AWS Solutions Architect Associate trong 7 ngày.',
    images: ['/og.png'],
  },
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
