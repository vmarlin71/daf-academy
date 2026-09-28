import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'DAF Academy',
    short_name: 'DAF Academy',
    description: 'Apprendre la finance, du niveau débutant au rôle de DAF.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f6f7fb',
    theme_color: '#111827',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' }
    ]
  }
}
