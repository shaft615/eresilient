import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  // Pin the root to this folder. Without it, a lockfile in a parent directory
  // makes Turbopack resolve modules (e.g. tailwindcss) from the wrong place.
  turbopack: { root: __dirname },
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  poweredByHeader: false,
  async redirects() {
    return [
      { source: "/about-us", destination: "/about", permanent: true },
      { source: "/contact-us", destination: "/contact", permanent: true },
      // /about/karl was an early founder bio page; site is now firm-presented.
      { source: "/about/karl", destination: "/about", permanent: true },
    ];
  },
};

const withMDX = createMDX({
  options: {
    // String form is required for Turbopack (Next 16 default).
    remarkPlugins: [["remark-gfm", {}]],
  },
});

export default withMDX(nextConfig);
