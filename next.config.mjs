/** @type {import('next').NextConfig} */
const nextConfig = {
  rewrites: async () => [
    {
      source: "/anthropic/:path*",
      destination: "https://api.anthropic.com/:path*"
    },
  ],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: "gxyledrbyotyvjrgsdpj.supabase.co"
      },
      {
        protocol: 'https',
        hostname: "i.scdn.co"
      }
    ]
  }
};

export default nextConfig;
