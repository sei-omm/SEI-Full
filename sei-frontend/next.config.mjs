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
  webpack: (config) => {
    config.externals = {
      canvas: "commonjs canvas", // Ignore 'canvas' for server builds
    };
    config.resolve.fallback = {
      canvas: false, // Prevent Webpack from bundling 'canvas'
    };
    return config;
  },
};

export default nextConfig;
