import type { Metadata } from 'next'

// SEO Metadata for download page
export const metadata: Metadata = {
    title: "تحميل التطبيق | Download App - بديل الشاملة للويندوز",
    description: "حمّل تطبيق المكتبة العلمية مجاناً للويندوز. بديل حديث للمكتبة الشاملة مع واجهة سهلة ومحرك بحث قوي للأحاديث النبوية. Download Ilmiyya desktop app for Windows - modern Shamela alternative with intuitive interface and powerful hadith search engine. Free Islamic library software.",
    keywords: [
        // Arabic download keywords
        "تحميل المكتبة العلمية", "تحميل الشاملة", "بديل الشاملة للويندوز",
        "برنامج الحديث", "برنامج إسلامي مجاني", "تحميل كتب الحديث",
        "المكتبة الشاملة تحميل", "برنامج البحث في الأحاديث",
        "تحميل صحيح البخاري", "برنامج مكتبة إسلامية",
        // English download keywords
        "download ilmiyya", "download shamela", "shamela alternative windows",
        "hadith software", "free islamic software", "download hadith books",
        "shamela download", "hadith search software", "islamic library software",
        "download sahih bukhari", "islamic desktop app", "hadith app windows"
    ],
    openGraph: {
        title: "تحميل التطبيق | Download Ilmiyya App",
        description: "حمّل تطبيق المكتبة العلمية مجاناً - بديل الشاملة الحديث",
        url: "https://ilmiyya.com/download",
        type: "website",
    },
    twitter: {
        card: "summary",
        title: "تحميل التطبيق | Download App",
        description: "Free Islamic library desktop app - بديل الشاملة مجاني"
    },
    alternates: {
        canonical: "https://ilmiyya.com/download",
    },
}

export default function DownloadLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
}
