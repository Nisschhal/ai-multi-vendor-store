import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ["img.clerk.com", "ik.imagekit.io"],
  },
  // increase bodysize limit in post api or get api
}

export default nextConfig
