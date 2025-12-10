import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "lh3.googleusercontent.com",
        pathname: "/a/**",
        port: "",
        protocol: "https",
      },
      {
        hostname: "img.clerk.com",
        port: "",
        protocol: "https",
      },
      {
        hostname: "image.mux.com",
        port: "",
        protocol: "https",
      },
    ],
  },
};

export default nextConfig;
