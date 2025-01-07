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
  // async redirects() {
  //   return [
  //     {
  //       source: "/account",
  //       destination: "/account?tab=informations",
  //       permanent: true,
  //     },
  //   ];
  // },
};

export default nextConfig;
