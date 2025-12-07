import type { Metadata } from 'next'

// SEO Metadata for topics page
export const metadata: Metadata = {
    title: "المواضيع الشرعية | Islamic Topics - تصفح الأحاديث حسب الموضوع",
    description: "تصفح الأحاديث النبوية حسب المواضيع الشرعية - العقيدة، الفقه، الأخلاق، السيرة وأكثر. شجرة مواضيع تفاعلية لسهولة التصفح. Browse hadith by Islamic topics - Aqeedah, Fiqh, Akhlaq, Seerah and more. Interactive topic tree for easy navigation. Similar to Shamela topic browsing.",
    keywords: [
        // Arabic topic keywords
        "المواضيع الإسلامية", "تصفح الأحاديث", "العقيدة", "الفقه",
        "الأخلاق", "السيرة النبوية", "العبادات", "المعاملات",
        "الأذكار", "الدعاء", "الصلاة", "الزكاة", "الصيام", "الحج",
        "شجرة المواضيع", "تصنيف الأحاديث", "فهرس الأحاديث",
        // English topic keywords
        "islamic topics", "hadith by topic", "aqeedah", "fiqh", "akhlaq",
        "seerah", "worship", "transactions", "adhkar", "dua", "prayer",
        "zakat", "fasting", "hajj", "topic tree", "hadith classification",
        "hadith index", "browse hadith topics", "shamela topics"
    ],
    openGraph: {
        title: "المواضيع الشرعية | Islamic Topics - Ilmiyya",
        description: "تصفح الأحاديث النبوية حسب المواضيع الشرعية",
        url: "https://ilmiyya.com/topics",
        type: "website",
    },
    twitter: {
        card: "summary",
        title: "المواضيع الشرعية | Islamic Topics",
        description: "Browse hadith by Islamic topics - تصفح الأحاديث حسب الموضوع"
    },
    alternates: {
        canonical: "https://ilmiyya.com/topics",
    },
}

export default function TopicsLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
}
