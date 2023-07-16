/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  swcMinify: true,
  i18n: {
    locales: ['en'],
    defaultLocale: 'en',
  },

  images: {
    domains: ['www.tilastopaja.eu'],
  },
};
export default config;
