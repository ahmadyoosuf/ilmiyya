import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/api/',
                    '/_next/',
                    '/private/',
                    '/*.json$',
                ],
            },
            {
                // Googlebot specific rules
                userAgent: 'Googlebot',
                allow: '/',
                disallow: ['/api/', '/_next/'],
            },
            {
                // Bingbot specific rules
                userAgent: 'Bingbot',
                allow: '/',
                disallow: ['/api/', '/_next/'],
            },
            {
                // Yandex bot for Russian/Middle East traffic
                userAgent: 'Yandex',
                allow: '/',
                disallow: ['/api/', '/_next/'],
            },
        ],
        sitemap: 'https://ilmiyya.com/sitemap.xml',
        host: 'https://ilmiyya.com',
    }
}
