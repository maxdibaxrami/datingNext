import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import webpack from 'webpack';

const withNextIntl = createNextIntlPlugin('./src/core/i18n/i18n.ts');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ['localhost:3000', '127.0.0.1:3000', 'your-ngrok-subdomain.ngrok-free.app'],
  webpack(config) {
    // 1) Stub out Mapbox HTML to avoid "Unexpected token" errors
    config.module.rules.push({
      test: /@mapbox[\\/]node-pre-gyp[\\/]lib[\\/]util[\\/]nw-pre-gyp[\\/]index\.html$/,
      loader: 'ignore-loader',
    });

    // 2) Ignore Mapbox dev-only modules
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /mock-aws-s3|node-gyp|npm|nock/, 
        contextRegExp: /@mapbox[\\/]node-pre-gyp/,  
      })
    );

    // 3) Provide resolve fallbacks for missing or dev-only modules
    config.resolve.fallback = {
      ...(config.resolve.fallback || {}),
      // Polyfills or real modules
      encoding: require.resolve('encoding'),
      npmlog: false,

      // Disable unnecessary modules
      'mock-aws-s3': false,
      'aws-sdk': false,
      'nock': false,
      'node-gyp': false,
      npm: false,
    };

    return config;
  },
};

export default withNextIntl(nextConfig);
