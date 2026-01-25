const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  // experimental: {
  //   swcPlugins: [
  //     ["@swc/plugin-legacy-decorators", {}]
  //   ]
  // },
  images: {
    unoptimized: true,
  },
  webpack: (config) => {
    config.resolve.alias["@colyseus/schema"] = path.resolve(
      __dirname,
      "node_modules/@colyseus/schema"
    );

    return config;
  },
};

module.exports = nextConfig;