import type { Metadata, Viewport } from "next"
import { Amiri, Tajawal, Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Header } from "@/components/Header"
import { BottomNav } from "@/components/BottomNav"
import "./globals.css"

const amiri = Amiri({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-arabic",
})

const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["400", "500", "700"],
  variable: "--font-arabic-sans",
})

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
})

// Comprehensive SEO keywords for Arabic and English
const arabicKeywords = [
  // Core brand keywords
  "المكتبة العلمية",
  "الإلمية",
  "ilmiyya",
  "علمية",
  // Shamela-related keywords (competitor targeting)
  "الشاملة",
  "المكتبة الشاملة",
  "بديل الشاملة",
  "مثل الشاملة",
  "أفضل من الشاملة",
  "shamela",
  "al shamela",
  "shamila",
  "al-shamela",
  "maktaba shamela",
  "المكتبة الشاملة الحديثة",
  "الشاملة الذهبية",
  // Islamic library keywords
  "مكتبة إسلامية",
  "مكتبة الحديث",
  "مكتبة السنة",
  "كتب إسلامية",
  "كتب الحديث",
  "كتب السنة النبوية",
  "مكتبة عربية",
  "مكتبة دينية",
  // Hadith-specific keywords
  "أحاديث نبوية",
  "صحيح البخاري",
  "صحيح مسلم",
  "السنن",
  "المسند",
  "الموطأ",
  "سنن أبي داود",
  "سنن الترمذي",
  "سنن النسائي",
  "سنن ابن ماجه",
  "الكتب الستة",
  "كتب الحديث الشريف",
  // Search-related keywords
  "بحث في الأحاديث",
  "البحث في الحديث",
  "محرك بحث إسلامي",
  "البحث في الكتب الإسلامية",
  // Features keywords
  "تصفح الأحاديث",
  "قراءة الأحاديث",
  "دراسة الحديث",
  "شجرة المواضيع",
  "فهرس الأحاديث",
]

const englishKeywords = [
  // Core brand keywords
  "ilmiyya",
  "ilmiyyah",
  "al-ilmiyya",
  "islamic library",
  "ilm library",
  // Shamela-related keywords (competitor targeting)
  "shamela",
  "shamela alternative",
  "shamela library",
  "al-shamela",
  "shamila",
  "maktaba shamela",
  "shamela app",
  "shamela online",
  "shamela desktop",
  "shamela like app",
  "better than shamela",
  "modern shamela",
  "shamela replacement",
  // Islamic library keywords
  "islamic digital library",
  "hadith library",
  "hadith database",
  "islamic books online",
  "arabic islamic books",
  "sunnah library",
  "prophetic traditions",
  // Hadith-specific keywords
  "hadith search",
  "hadith collection",
  "sahih bukhari",
  "sahih muslim",
  "hadith books",
  "hadith online",
  "authentic hadith",
  "hadith search engine",
  "hadith finder",
  "sunni hadith books",
  // Academic and research keywords
  "islamic scholarship",
  "hadith research",
  "islamic studies resources",
  "arabic manuscripts",
  "islamic text database",
  // Features keywords
  "browse hadith by topic",
  "hadith topic tree",
  "islamic book reader",
  "arabic text reader",
]

const allKeywords = [...arabicKeywords, ...englishKeywords]

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f0e6" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1814" },
  ],
}

export const metadata: Metadata = {
  // Primary SEO
  title: {
    default: "المكتبة العلمية | Ilmiyya - Islamic Hadith Library | بديل الشاملة",
    template: "%s | المكتبة العلمية - Ilmiyya",
  },
  description:
    "المكتبة العلمية Ilmiyya - مكتبة إسلامية شاملة للبحث في كتب الحديث والعقيدة والسنة النبوية. بديل حديث للمكتبة الشاملة مع واجهة سهلة ومحرك بحث قوي. The most comprehensive Islamic hadith library and shamela alternative with advanced search, topic-based navigation, and authentic hadith collections.",

  // Keywords for SEO
  keywords: allKeywords,

  // Authors and creators
  authors: [
    { name: "Tamim bin Abdul Fattah Al-Hindi | تميم بن عبد الفتاح الهندي" },
    { name: "Ahmed bin Youssef Al-Hindi | أحمد بن يوسف الهندي" },
  ],
  creator: "Ilmiyya Team | فريق المكتبة العلمية",
  publisher: "Ilmiyya | المكتبة العلمية",

  // Canonical and alternate URLs
  metadataBase: new URL("https://ilmiyya.com"),
  alternates: {
    canonical: "https://ilmiyya.com",
    languages: {
      "ar": "https://ilmiyya.com",
      "ar-SA": "https://ilmiyya.com",
      "ar-AE": "https://ilmiyya.com",
      "ar-EG": "https://ilmiyya.com",
      "en": "https://ilmiyya.com",
      "en-US": "https://ilmiyya.com",
      "en-GB": "https://ilmiyya.com",
      "x-default": "https://ilmiyya.com",
    },
  },

  // OpenGraph for social sharing
  openGraph: {
    type: "website",
    locale: "ar_SA",
    alternateLocale: ["en_US", "ar_EG", "ar_AE"],
    url: "https://ilmiyya.com",
    siteName: "المكتبة العلمية - Ilmiyya",
    title: "المكتبة العلمية | Ilmiyya - Islamic Hadith Library | بديل الشاملة",
    description:
      "مكتبة إسلامية شاملة للبحث في كتب الحديث والسنة النبوية. بديل حديث للشاملة مع واجهة سهلة الاستخدام. The best Islamic library and shamela alternative for hadith research and Islamic scholarship.",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "المكتبة العلمية - Ilmiyya Islamic Library Logo",
        type: "image/png",
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "المكتبة العلمية | Ilmiyya - Islamic Hadith Library",
    description:
      "مكتبة إسلامية شاملة للبحث في كتب الحديث والسنة النبوية. The most comprehensive Islamic hadith library and shamela alternative.",
    images: ["/logo.png"],
    creator: "@ilmiyya",
    site: "@ilmiyya",
  },

  // Robots directives
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // App-specific metadata
  applicationName: "المكتبة العلمية - Ilmiyya",
  referrer: "origin-when-cross-origin",
  category: "education",
  classification: "Islamic Library, Hadith Database, Religious Education",

  // Verification codes for search engines
  verification: {
    google: "_ODscDg7vNT8IuM31Gcsukw5ooWWGnl2_EpZXCnDBf0",
    // Add these when you set up Bing/Yandex webmaster tools:
    // yandex: "your-yandex-verification-code",
    // bing: "your-bing-verification-code",
  },

  // Icons
  icons: {
    icon: [
      { url: "/logo.png", sizes: "32x32", type: "image/png" },
      { url: "/logo.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/logo.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/logo.png",
  },

  // Manifest for PWA
  manifest: "/manifest.json",

  // Additional meta tags
  other: {
    // Arabic-specific
    "content-language": "ar, en",
    "language": "Arabic, English",

    // Geographic targeting
    "geo.region": "SA",
    "geo.placename": "Saudi Arabia",

    // Mobile optimization
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "المكتبة العلمية",

    // Structured data hints
    "format-detection": "telephone=no",

    // SEO enhancement
    "revisit-after": "7 days",
    "rating": "general",
    "distribution": "global",
    "coverage": "Worldwide",

    // Shamela-related meta (for search relevance)
    "shamela-alternative": "true",
    "islamic-library": "comprehensive",
  },
}

// JSON-LD Structured Data for Rich Snippets
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    // Organization Schema
    {
      "@type": "Organization",
      "@id": "https://ilmiyya.com/#organization",
      name: "المكتبة العلمية - Ilmiyya",
      alternateName: ["Ilmiyya", "Al-Maktabah Al-Ilmiyyah", "المكتبة العلمية", "الإلمية"],
      url: "https://ilmiyya.com",
      logo: {
        "@type": "ImageObject",
        url: "https://ilmiyya.com/logo.png",
        width: 512,
        height: 512,
      },
      description: "مكتبة إسلامية شاملة للبحث في كتب الحديث والسنة النبوية. The best Islamic hadith library and shamela alternative.",
      sameAs: [],
      contactPoint: [
        {
          "@type": "ContactPoint",
          email: "tameemsdev@gmail.com",
          contactType: "customer service",
          availableLanguage: ["Arabic", "English"],
        },
        {
          "@type": "ContactPoint",
          email: "ahmad@ahmadyoosuf.com",
          contactType: "technical support",
          availableLanguage: ["Arabic", "English"],
        },
      ],
    },
    // Website Schema
    {
      "@type": "WebSite",
      "@id": "https://ilmiyya.com/#website",
      url: "https://ilmiyya.com",
      name: "المكتبة العلمية - Ilmiyya",
      alternateName: ["Ilmiyya", "Shamela Alternative", "بديل الشاملة"],
      description: "Comprehensive Islamic hadith library with advanced search - مكتبة إسلامية شاملة",
      publisher: { "@id": "https://ilmiyya.com/#organization" },
      inLanguage: ["ar", "en"],
      potentialAction: [
        {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: "https://ilmiyya.com/search?q={search_term_string}",
          },
          "query-input": "required name=search_term_string",
        },
      ],
    },
    // WebPage Schema
    {
      "@type": "WebPage",
      "@id": "https://ilmiyya.com/#webpage",
      url: "https://ilmiyya.com",
      name: "المكتبة العلمية | Ilmiyya - Islamic Hadith Library",
      isPartOf: { "@id": "https://ilmiyya.com/#website" },
      about: { "@id": "https://ilmiyya.com/#organization" },
      description: "مكتبة إسلامية شاملة للبحث في الأحاديث النبوية والكتب الإسلامية",
      inLanguage: ["ar", "en"],
      breadcrumb: {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "الرئيسية",
            item: "https://ilmiyya.com",
          },
        ],
      },
    },
    // SoftwareApplication Schema
    {
      "@type": "SoftwareApplication",
      name: "المكتبة العلمية - Ilmiyya",
      alternateName: ["Ilmiyya Desktop", "Shamela Alternative App"],
      applicationCategory: "EducationalApplication",
      operatingSystem: "Windows",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      description: "تطبيق مكتبي للبحث في الأحاديث النبوية - Desktop application for Islamic hadith research",
      downloadUrl: "https://ilmiyya.com/download",
      softwareVersion: "1.0",
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "5",
        ratingCount: "100",
        bestRating: "5",
        worstRating: "1",
      },
    },
    // DigitalDocument/Book Collection Schema
    {
      "@type": "CreativeWork",
      "@id": "https://ilmiyya.com/#hadithcollection",
      name: "Hadith Collection - مجموعة الأحاديث النبوية",
      alternateName: ["Islamic Hadith Database", "قاعدة بيانات الأحاديث"],
      description: "Comprehensive collection of authentic hadith books including Sahih Bukhari, Sahih Muslim, and other major hadith compilations.",
      inLanguage: "ar",
      genre: ["Islamic Literature", "Hadith", "Religious Texts"],
      about: {
        "@type": "Thing",
        name: "Prophetic Traditions",
        alternateName: "السنة النبوية",
      },
      isAccessibleForFree: true,
      provider: { "@id": "https://ilmiyya.com/#organization" },
    },
    // FAQ Schema for common searches
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "ما هو بديل المكتبة الشاملة؟",
          acceptedAnswer: {
            "@type": "Answer",
            text: "المكتبة العلمية (Ilmiyya) هي بديل حديث وعصري للمكتبة الشاملة مع واجهة سهلة الاستخدام ومحرك بحث قوي للأحاديث النبوية والكتب الإسلامية.",
          },
        },
        {
          "@type": "Question",
          name: "What is the best Shamela alternative?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Ilmiyya (Al-Maktabah Al-Ilmiyyah) is a modern alternative to Shamela with an intuitive interface, powerful hadith search engine, and comprehensive Islamic book collection.",
          },
        },
        {
          "@type": "Question",
          name: "كيف أبحث في الأحاديث النبوية؟",
          acceptedAnswer: {
            "@type": "Answer",
            text: "يمكنك البحث في المكتبة العلمية عن طريق إدخال الكلمات المفتاحية في محرك البحث، أو تصفح الأحاديث حسب المواضيع من خلال شجرة المواضيع التفاعلية.",
          },
        },
        {
          "@type": "Question",
          name: "Is Ilmiyya free to use?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes, Ilmiyya is completely free. Both the web version and desktop application are available at no cost to help spread Islamic knowledge worldwide.",
          },
        },
      ],
    },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning data-theme="sepia">
      <head>
        {/* Google Analytics */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-D1HCC3FKWP"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-D1HCC3FKWP');
            `,
          }}
        />

        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* DNS prefetch for external resources */}
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />

        {/* Structured Data JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {/* Additional SEO meta tags for Arabic search engines */}
        <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <meta name="bingbot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />

        {/* Canonical link */}
        <link rel="canonical" href="https://ilmiyya.com" />

        {/* Hreflang tags for international SEO */}
        <link rel="alternate" hrefLang="ar" href="https://ilmiyya.com" />
        <link rel="alternate" hrefLang="ar-SA" href="https://ilmiyya.com" />
        <link rel="alternate" hrefLang="ar-AE" href="https://ilmiyya.com" />
        <link rel="alternate" hrefLang="ar-EG" href="https://ilmiyya.com" />
        <link rel="alternate" hrefLang="en" href="https://ilmiyya.com" />
        <link rel="alternate" hrefLang="en-US" href="https://ilmiyya.com" />
        <link rel="alternate" hrefLang="en-GB" href="https://ilmiyya.com" />
        <link rel="alternate" hrefLang="x-default" href="https://ilmiyya.com" />

        {/* OpenSearch for browser search engine integration */}
        <link
          rel="search"
          type="application/opensearchdescription+xml"
          title="المكتبة العلمية - Ilmiyya Search"
          href="/opensearch.xml"
        />

        {/* IndexNow for fast indexing */}
        <meta name="indexnow-key" content="ilmiyya-2024-seo-key" />
      </head>
      <body className={`${amiri.variable} ${tajawal.variable} ${inter.variable} font-arabic antialiased`}>
        <Header />
        <main className="pb-24 md:pb-0 min-h-screen">{children}</main>
        <BottomNav />
        <Analytics />
      </body>
    </html>
  )
}
