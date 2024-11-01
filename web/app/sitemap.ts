import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
   return [
      {
         url: 'https://mariwano.dev',
         lastModified: new Date(),
         changeFrequency: 'monthly',
         priority: 1,
      },
      {
         url: 'https://mariwano.dev/commands',
         lastModified: new Date(),
         changeFrequency: 'monthly',
         priority: 0.8,
      },
      {
         url: 'https://mariwano.dev/commands/admin',
         lastModified: new Date(),
         changeFrequency: 'monthly',
         priority: 0.7,
      },
      {
         url: 'https://mariwano.dev/commands/economy',
         lastModified: new Date(),
         changeFrequency: 'monthly',
         priority: 0.7,
      },
      {
         url: 'https://mariwano.dev/commands/fun',
         lastModified: new Date(),
         changeFrequency: 'monthly',
         priority: 0.7,
      },
      {
         url: 'https://mariwano.dev/commands/general',
         lastModified: new Date(),
         changeFrequency: 'monthly',
         priority: 0.7,
      },
      {
         url: 'https://mariwano.dev/commands/moderation',
         lastModified: new Date(),
         changeFrequency: 'monthly',
         priority: 0.7,
      },
      {
         url: 'https://mariwano.dev/commands/music',
         lastModified: new Date(),
         changeFrequency: 'monthly',
         priority: 0.7,
      },
      {
         url: 'https://mariwano.dev/community',
         lastModified: new Date(),
         changeFrequency: 'monthly',
         priority: 0.6,
      },
   ];
}
