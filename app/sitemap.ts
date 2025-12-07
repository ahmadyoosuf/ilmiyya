import { MetadataRoute } from 'next'

// Base URL for the website
const BASE_URL = 'https://ilmiyya.com'

// Generate sitemap for SEO
export default function sitemap(): MetadataRoute.Sitemap {
    const currentDate = new Date().toISOString()

    // Static pages with high priority
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: BASE_URL,
            lastModified: currentDate,
            changeFrequency: 'daily',
            priority: 1.0,
        },
        {
            url: `${BASE_URL}/search`,
            lastModified: currentDate,
            changeFrequency: 'daily',
            priority: 0.95,
        },
        {
            url: `${BASE_URL}/books`,
            lastModified: currentDate,
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${BASE_URL}/topics`,
            lastModified: currentDate,
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${BASE_URL}/download`,
            lastModified: currentDate,
            changeFrequency: 'monthly',
            priority: 0.85,
        },
        {
            url: `${BASE_URL}/about`,
            lastModified: currentDate,
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${BASE_URL}/donate`,
            lastModified: currentDate,
            changeFrequency: 'monthly',
            priority: 0.6,
        },
    ]

    // Semantic/keyword-rich URLs for SEO (virtual pages that could be created)
    // These help with keyword targeting even if they redirect to main pages
    const seoPages: MetadataRoute.Sitemap = [
        // Arabic keyword pages
        {
            url: `${BASE_URL}/search?q=صحيح%20البخاري`,
            lastModified: currentDate,
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${BASE_URL}/search?q=صحيح%20مسلم`,
            lastModified: currentDate,
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${BASE_URL}/search?q=السنة%20النبوية`,
            lastModified: currentDate,
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${BASE_URL}/search?q=الأحاديث%20النبوية`,
            lastModified: currentDate,
            changeFrequency: 'weekly',
            priority: 0.8,
        },
    ]

    return [...staticPages, ...seoPages]
}
