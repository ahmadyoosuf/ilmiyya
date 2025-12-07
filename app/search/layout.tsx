import type { Metadata } from 'next'

// SEO Metadata for search page
export const metadata: Metadata = {
    title: "البحث في الأحاديث والكتب | Hadith Search Engine - بديل الشاملة",
    description: "محرك بحث إسلامي متقدم للبحث في الأحاديث النبوية والكتب الإسلامية. ابحث في صحيح البخاري، صحيح مسلم، السنن وجميع كتب الحديث. Advanced Islamic hadith search engine - better than Shamela search. Search authentic hadith from Bukhari, Muslim, and all major hadith collections.",
    keywords: [
        // Arabic search keywords
        "البحث في الأحاديث", "بحث الحديث", "محرك بحث إسلامي", "البحث في صحيح البخاري",
        "البحث في صحيح مسلم", "بحث السنة النبوية", "بحث الشاملة", "بحث المكتبة الشاملة",
        // English search keywords
        "hadith search", "search hadith", "islamic search engine", "hadith finder",
        "search sahih bukhari", "search sahih muslim", "shamela search", "hadith database search",
        "find hadith", "hadith lookup", "prophetic traditions search"
    ],
    openGraph: {
        title: "البحث في الأحاديث | Hadith Search - Ilmiyya",
        description: "محرك بحث إسلامي متقدم للبحث في الأحاديث النبوية والكتب الإسلامية",
        url: "https://ilmiyya.com/search",
        type: "website",
    },
    twitter: {
        card: "summary",
        title: "البحث في الأحاديث | Hadith Search",
        description: "محرك بحث إسلامي متقدم - Advanced Islamic hadith search"
    },
    alternates: {
        canonical: "https://ilmiyya.com/search",
    },
}

export default function SearchLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
}
