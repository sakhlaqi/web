const { is } = require('date-fns/locale')

/**
 * @type {import('next').NextConfig}
 */
module.exports = {
  images: {
    domains: [
      "res.cloudinary.com",
      "abs.twimg.com",
      "pbs.twimg.com",
      "avatars.githubusercontent.com",
    ],
  },
  env: {
    ROOT_DOMAIN: process.env.ROOT_DOMAIN,
  },
  reactStrictMode: true,
  swcMinify: false, // Required to fix: https://nextjs.org/docs/messages/failed-loading-swc
  // webpack: (config) => {
  //   config.resolve.fallback = { fs: false, path: false, stream: false, constants: false };
  //   return config;
  // },

  webpack: (
    config, { isServer }
  ) => {
    if ( !isServer) {
       // Fixes npm packages that depend on `fs` module
      config.resolve.fallback = { fs: false, path: false };
    }
    // Important: return the modified config
    return config
  },
}