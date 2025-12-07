import type { Metadata } from 'next'

// SEO Metadata for donate page
export const metadata: Metadata = {
    title: "التبرع والدعم | Donate - ادعم المكتبة العلمية",
    description: "ادعم مشروع المكتبة العلمية للحفاظ على التراث الإسلامي ونشر العلم الشرعي. تبرعك يساعد في تطوير المنصة وإضافة المزيد من الكتب والأحاديث. Support Ilmiyya Islamic Library project to preserve Islamic heritage and spread authentic knowledge.",
    keywords: [
        "التبرع للمكتبة العلمية", "دعم العلم الشرعي", "صدقة جارية",
        "donate islamic library", "support hadith project", "sadaqah jariyah"
    ],
    openGraph: {
        title: "التبرع | Donate to Ilmiyya",
        description: "ادعم مشروع المكتبة العلمية للحديث النبوي",
        url: "https://ilmiyya.com/donate",
        type: "website",
    },
    alternates: {
        canonical: "https://ilmiyya.com/donate",
    },
}

export default function DonateLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
}
