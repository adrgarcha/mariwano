/** @type {import('next').NextConfig} */
const nextConfig = {
   images: {
      remotePatterns: [
         {
            protocol: 'https',
            hostname: 'cdn.discordapp.com',
            port: '',
            pathname: '/icons/**',
         },
      ],
   },
};

export default nextConfig;
