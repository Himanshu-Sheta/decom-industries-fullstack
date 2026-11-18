/** @type {import('next').NextConfig} */
const backendOrigin =
  process.env.BACKEND_INTERNAL_URL || 'http://127.0.0.1:4000';

const nextConfig = {
  images: {
    unoptimized: true,
  },
  // Same-origin Reverse Proxy:
  // Forwards /api/* and /uploads/* from port 3000 -> Express port 4000
  // so ONE public HTTPS link (e.g. Cloudflare Tunnel) serves UI, API, cookies & all photos!
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${backendOrigin}/api/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${backendOrigin}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
