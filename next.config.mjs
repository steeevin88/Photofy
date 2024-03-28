/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: "gxyledrbyotyvjrgsdpj.supabase.co"
      }
    ]
  }
};

export default nextConfig;
