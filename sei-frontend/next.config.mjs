/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ], // Add multiple domains as needed
  },
  async redirects() {
    return [
      {
        source: "/my-account",
        destination: "/my-account/user-details",
        permanent: true,
      },
    ];
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...config.externals, "canvas"];
    }
    return config;
  },
};

export default nextConfig;
