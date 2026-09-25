import type { MetadataRoute } from 'next';

import { site } from '@/lib/site';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${site.name} — ${site.tagline}`,
    short_name: site.name,
    description: site.description,
    start_url: '/stream',
    display: 'standalone',
    background_color: '#0B0E0D',
    theme_color: '#0B0E0D',
    orientation: 'portrait',
    icons: [
      { src: '/brand/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      { src: '/brand/e1-4_mark_512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/brand/e1-4_mark_1024.png', sizes: '1024x1024', type: 'image/png', purpose: 'any' },
    ],
  };
}
