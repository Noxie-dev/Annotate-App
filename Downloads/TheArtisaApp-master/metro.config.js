// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add proper MIME type for bundle files
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      // Add proper Content-Type header for bundle files
      if (req.url.endsWith('.bundle')) {
        res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
      }
      return middleware(req, res, next);
    };
  },
};

module.exports = config;
