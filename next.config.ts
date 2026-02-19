import type { NextConfig } from "next";
import path from "path";

const threePath = path.join(process.cwd(), "node_modules", "three");

const nextConfig: NextConfig = {
  transpilePackages: ["react-globe.gl", "globe.gl", "three-globe"],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        three$: path.join(threePath, "build", "three.module.js"),
        "three/webgpu$": path.join(threePath, "build", "three.webgpu.js"),
        "three/tsl$": path.join(threePath, "build", "three.tsl.js"),
        "three/addons": path.join(threePath, "examples", "jsm"),
      };

      // Ensure three/examples/jsm/* is resolvable
      config.resolve.modules = [
        ...(config.resolve.modules || []),
        path.join(threePath, ".."),
      ];

      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }
    return config;
  },
};

export default nextConfig;
