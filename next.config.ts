import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**', // すべてのパスを許可
      },
      {
        protocol: 'https',
        hostname: 'hyidvyqonxepapoidfdf.supabase.co', // エラーメッセージに出ているホスト名
        port: '',
        pathname: '/storage/v1/object/public/**', // Supabaseストレージのパス規則
      },
      {
        protocol: 'https',
        hostname: 'img.clerk.com', // Clerkの画像ドメインを許可
      },
    ],
  },
};
export default nextConfig;
