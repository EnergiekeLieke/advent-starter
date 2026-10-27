import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async headers() {
    return [
      // De kalender mag overal ingebed worden (Kennis Shop, eigen website)
      {
        source: '/',
        headers: [{ key: 'Content-Security-Policy', value: 'frame-ancestors *' }],
      },
      // De editor mag alleen binnen deze site in een iframe (voor het voorbeeld)
      {
        source: '/beheer/:path*',
        headers: [{ key: 'Content-Security-Policy', value: "frame-ancestors 'self'" }],
      },
    ];
  },
};

export default nextConfig;
