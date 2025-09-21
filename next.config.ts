import type { NextConfig } from "next";
     
// TO DO: remove eslint & typescript ignore flags after fixing all issues
const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
