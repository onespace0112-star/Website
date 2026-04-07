import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/login', '/register', '/reset-password', '/profile', '/uploads/', '/product'],
      },
    ],
    sitemap: 'https://onespacecn.com/sitemap.xml',
  }
}
