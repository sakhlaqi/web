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
    config, { isServer, dir }
  ) => {
    // if ( !isServer) {
    //    // Fixes npm packages that depend on `fs` module
    //   config.resolve.fallback = { fs: false, path: false };
    // }

    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      include: dir,
      exclude: /(node_modules)/,
      use: [
        "next-swc-loader",
        {
          loader: "@svgr/webpack",
          options: {
            // prettier: false,
            // svgo: true,
            // svgoConfig: {
            //   plugins: [{ removeViewBox: false }],
            // },
            // titleProp: true,
            babel: false,
          },
        },
      ],
    })

    // Important: return the modified config
    return config
  },
}


