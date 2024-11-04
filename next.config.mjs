/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "example.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "zrkselfyyqkkqcmxhjlt.supabase.co",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
