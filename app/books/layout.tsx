import type { Metadata } from 'next'

// SEO Metadata for books page
export const metadata: Metadata = {
    title: "كتب الحديث والعقيدة | Islamic Hadith Books - صحيح البخاري ومسلم",
    description: "تصفح مجموعة شاملة من كتب الحديث الشريف والعقيدة الإسلامية. صحيح البخاري، صحيح مسلم، السنن الأربعة، موطأ مالك وأكثر. Browse comprehensive collection of authentic hadith books - Sahih Bukhari, Sahih Muslim, Sunan, Muwatta and more. Best Shamela alternative for Islamic books.",
    keywords: [
        // Arabic book keywords
        "كتب الحديث", "كتب إسلامية", "صحيح البخاري", "صحيح مسلم",
        "سنن أبي داود", "سنن الترمذي", "سنن النسائي", "سنن ابن ماجه",
        "موطأ مالك", "مسند أحمد", "الكتب الستة", "كتب السنة",
        "كتب العقيدة", "كتب الفقه", "مكتبة الشاملة الكتب",
        // English book keywords
        "hadith books", "islamic books", "sahih bukhari", "sahih muslim",
        "sunan abu dawud", "jami al-tirmidhi", "sunan al-nasai", "sunan ibn majah",
        "muwatta malik", "musnad ahmad", "kutub al-sittah", "six books of hadith",
        "authentic hadith books", "islamic book collection", "shamela books"
    ],
    openGraph: {
        title: "كتب الحديث | Islamic Hadith Books - Ilmiyya",
        description: "تصفح مجموعة شاملة من كتب الحديث الشريف - صحيح البخاري، صحيح مسلم وأكثر",
        url: "https://ilmiyya.com/books",
        type: "website",
    },
    twitter: {
        card: "summary",
        title: "كتب الحديث | Islamic Books",
        description: "Browse authentic hadith books - صحيح البخاري ومسلم"
    },
    alternates: {
        canonical: "https://ilmiyya.com/books",
    },
}

export default function BooksLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
}
