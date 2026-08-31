import type { NextConfig } from 'next';

const isGitHubPages = process.env.GITHUB_PAGES === 'true';
const [repositoryOwner = 'dzung-luong-ck', repositoryName = 'saa-c03-field-guide'] =
  process.env.GITHUB_REPOSITORY?.split('/') ?? [];
const pagesOrigin = `https://${repositoryOwner}.github.io/${repositoryName}`;

const nextConfig: NextConfig = isGitHubPages
  ? {
      output: 'export',
      assetPrefix: pagesOrigin,
      trailingSlash: true,
    }
  : {};

export default nextConfig;
