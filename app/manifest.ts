import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'PitchReady Cricket',
    short_name: 'PitchReady',
    description: 'Cricket player performance tracker',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#34C759',
    orientation: 'portrait',
    icons: [
      { src: '/apple-icon', sizes: '180x180', type: 'image/png' },
      { src: '/icon', sizes: '32x32', type: 'image/png' },
    ],
  }
}
