import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://practiceflux.com'

  // Marketing pages
  const marketingPages = [
    '',
    '/features',
    '/pricing',
    '/about',
    '/contact',
    '/blog',
    '/privacy',
    '/terms',
    '/hipaa',
  ]

  // Feature pages
  const featurePages = [
    '/features/smart-scheduling',
    '/features/soap-notes',
    '/features/e-prescriptions',
    '/features/lab-orders',
    '/features/imaging-orders',
    '/features/patient-engagement',
    '/features/revenue-cycle',
    '/features/ai-assistant',
    '/features/quality-mips',
    '/features/clinical-workflows',
  ]

  // Module pages
  const modulePages = [
    '/modules/clinical',
    '/modules/billing',
    '/modules/ai',
    '/modules/quality',
  ]

  const allPages = [...marketingPages, ...featurePages, ...modulePages]

  return allPages.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'weekly' : 'monthly',
    priority: route === '' ? 1 : route.startsWith('/features') ? 0.8 : 0.7,
  }))
}
