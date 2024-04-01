/** @type {import('next').NextConfig} */
const nextConfig = {
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
