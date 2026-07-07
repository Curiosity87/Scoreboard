import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Krävs för den slimmade Docker-imagen (kopierar .next/standalone).
  output: "standalone",
};

export default nextConfig;
