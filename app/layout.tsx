import type { Metadata } from 'next';
import './globals.css';

const isGitHubPages = process.env.GITHUB_PAGES === 'true';
const [
  repositoryOwner = 'dzung-luong-ck',
  repositoryName = 'saa-c03-field-guide',
] = process.env.GITHUB_REPOSITORY?.split('/') ?? [];
const siteUrl = isGitHubPages
  ? `https://${repositoryOwner}.github.io/${repositoryName}/`
  : 'https://saa-c03-field-guide-vn.ltdunggg.chatgpt.site/';
const socialImageUrl = `${siteUrl}og.png`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'SAA-C03 Field Guide — 14 task cho người mới',
  description:
    'Học AWS Solutions Architect Associate SAA-C03 bằng tiếng Việt, chia theo 14 task Exam Guide và giải thích từ cơ bản.',
  openGraph: {
    title: 'SAA-C03 Field Guide',
    description:
      '14 task SAA-C03 theo Exam Guide, giải thích chi tiết cho người mới.',
    type: 'website',
    locale: 'vi_VN',
    url: siteUrl,
    images: [
      {
        url: socialImageUrl,
        width: 1536,
        height: 1024,
        alt: 'SAA-C03 Field Guide — Ôn trọng tâm trong 7 ngày',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SAA-C03 Field Guide',
    description:
      '14 task SAA-C03 theo Exam Guide, giải thích chi tiết cho người mới.',
    images: [socialImageUrl],
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
