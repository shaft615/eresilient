import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  poweredByHeader: false,
  experimental: {
    serverActions: {
      // Deliverable uploads in /admin go through a server action; the
      // default 1 MB body limit is too small for real documents.
      bodySizeLimit: "25mb",
    },
  },
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
