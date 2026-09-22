/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "d1n5xguust3bkl.cloudfront.net",
        pathname: "/products/**",
      },
    ],
  },
};

export default nextConfig;
