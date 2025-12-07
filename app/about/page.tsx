'use client'

import { useState } from 'react'
import { Language, getLanguageByCode } from '@/lib/i18n/types'
import { cn } from '@/lib/utils'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

const CONTACT_EMAILS = ['tameemsdev@gmail.com', 'ahmad@ahmadyoosuf.com']

// JSON-LD for About page - Organization and Person schema
const aboutJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "AboutPage",
      "@id": "https://ilmiyya.com/about",
      name: "عن المكتبة العلمية - About Ilmiyya",
      description: "Learn about the Ilmiyya Islamic Library project - تعرف على مشروع المكتبة العلمية",
      url: "https://ilmiyya.com/about",
      isPartOf: { "@id": "https://ilmiyya.com/#website" },
      inLanguage: ["ar", "en", "ta"]
    },
    {
      "@type": "Organization",
      "@id": "https://ilmiyya.com/#organization",
      name: "المكتبة العلمية - Ilmiyya",
      alternateName: ["Ilmiyya", "Al-Maktabah Al-Ilmiyyah", "علمية"],
      url: "https://ilmiyya.com",
      description: "Islamic hadith library and shamela alternative - مكتبة إسلامية شاملة بديل الشاملة",
      founder: [
        {
          "@type": "Person",
          name: "Tamim bin Abdul Fattah Al-Hindi",
          alternateName: "تميم بن عبد الفتاح الهندي",
          jobTitle: "Founder & Developer"
        },
        {
          "@type": "Person",
          name: "Ahmed bin Youssef Al-Hindi",
          alternateName: "أحمد بن يوسف الهندي",
          jobTitle: "UI/UX Designer"
        }
      ],
      contactPoint: {
        "@type": "ContactPoint",
        email: "tameemsdev@gmail.com",
        contactType: "customer service",
        availableLanguage: ["Arabic", "English", "Tamil"]
      }
    }
  ]
}

interface AboutCopy {
  dir: 'ltr' | 'rtl'
  title: string
  intro: string
  paragraphOne: string
  paragraphTwo: string
  credit: string
  contactSection: {
    title: string
    description: string
    emailLabel: string
  }
}

const ABOUT_CONTENT: Record<Language, AboutCopy> = {
  en: {
    dir: 'ltr',
    title: 'About This Project',
    intro: 'Peace be upon you. In the name of Allah, the Most Gracious, the Most Merciful.',
    paragraphOne:
      'All praise belongs to Allah, and may peace and blessings be upon His Messenger. This application is a humble effort to serve the Prophetic Sunnah. Conceived by Tamim bin Abdul Fattah Al-Hindi, Al-Maktabah Al-Ilmiyyah is a desktop platform for the study and preservation of Hadith literature.',
    paragraphTwo:
      'Built for simplicity and effectiveness, the app offers full Arabic support, JSON-based content management, and an innovative topic tree that organizes Prophetic hadiths by subject, enabling easy navigation for scholars and students.',
    credit:
      'The UI/UX was designed by Engineer Ahmed bin Youssef Al-Hindi. May Allah reward both contributors abundantly.',
    contactSection: {
      title: 'Get in Touch',
      description:
        'For feedback, suggestions, or collaboration opportunities, feel free to reach out.',
      emailLabel: 'Contact Emails',
    },
  },
  ar: {
    dir: 'rtl',
    title: 'عن هذا المشروع',
    intro: 'السلام عليكم ورحمة الله وبركاته. بسم الله الرحمن الرحيم.',
    paragraphOne:
      'الحمد لله والصلاة والسلام على رسول الله. هذا التطبيق جهد متواضع لخدمة السنة النبوية. من فكرة تميم بن عبد الفتاح الهندي، المكتبة العلمية هي منصة مكتبية لدراسة الحديث النبوي والحفاظ عليه.',
    paragraphTwo:
      'صُمم التطبيق ليكون بسيطاً وفعالاً، وهو يوفر دعماً كاملاً للغة العربية، وإدارة محتوى بنظام JSON، وشجرة مواضيع مبتكرة تنظم الأحاديث حسب الموضوع، مما يسهل على الباحثين والطلاب تصفحها.',
    credit:
      'صمم واجهة المستخدم المهندس أحمد بن يوسف الهندي. جزى الله المساهمين خير الجزاء.',
    contactSection: {
      title: 'تواصل معنا',
      description: 'للملاحظات والاقتراحات أو فرص التعاون، يرجى التواصل معنا.',
      emailLabel: 'البريد الإلكتروني للتواصل',
    },
  },
  ta: {
    dir: 'ltr',
    title: 'இத்திட்டம் பற்றி',
    intro: 'அஸ்ஸலாமு அலைக்கும். அளவற்ற அருளாளனும், நிகரற்ற அன்புடையோனுமாகிய அல்லாஹ்வின் பெயரால்.',
    paragraphOne:
      'எல்லாப் புகழும் அல்லாஹ்வுக்கே. அவனது தூதர் மீது அமைதியும் கருணையும் உண்டாகட்டும். இச்செயலி, நபிவழிக்குச் சேவை செய்யும் ஒரு சிறிய முயற்சி. தமீம் பின் அப்துல் ஃபத்தாஹ் அல்-ஹிந்தி அவர்களின் சிந்தனையில் உருவான "அல்-மக்தபா அல்-இல்மிய்யா", ஹதீஸ்களைப் படிக்கவும் பாதுகாக்கவும் உருவாக்கப்பட்ட ஒரு கணினித் தளமாகும்.',
    paragraphTwo:
      'எளிமையையும் செயல்திறனையும் நோக்கமாகக் கொண்டு உருவாக்கப்பட்ட இச்செயலி, அரபி மொழிக்கு முழு ஆதரவு, JSON வழி உள்ளடக்க மேலாண்மை மற்றும் அனைத்து ஹதீஸ்களையும் தலைப்பு வாரியாகப் பிரிக்கும் பொருளடக்கப் பட்டியல் போன்ற அம்சங்களைக் கொண்டுள்ளது. இது ஆய்வாளர்கள் மிக எளிதாக ஹதீஸ்களைக் கையாள உதவுகிறது.',
    credit:
      'இதன் UI/UX வடிவமைப்பை பொறியாளர் அஹ்மத் பின் யூசுஃப் அல்-ஹிந்தி உருவாக்கினார். பங்களித்த இருவருக்கும் அல்லாஹ் நற்கூலி வழங்குவானாக.',
    contactSection: {
      title: 'தொடர்பு கொள்ளுங்கள்',
      description: 'கருத்துகள், பரிந்துரைகள் அல்லது ஒத்துழைப்பு வாய்ப்புகளுக்கு, தயவுசெய்து எங்களை தொடர்பு கொள்ளுங்கள்.',
      emailLabel: 'தொடர்பு மின்னஞ்சல்கள்',
    },
  },
}

export default function AboutPage() {
  const [language, setLanguage] = useState<Language>('ar')
  const content = ABOUT_CONTENT[language]
  const langConfig = getLanguageByCode(language)

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd) }}
      />

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-10 space-y-8 md:py-16">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-3xl md:text-4xl font-bold">{content.title}</h1>
            <LanguageSwitcher currentLanguage={language} onLanguageChange={setLanguage} />
          </div>

          <div
            dir={langConfig.dir}
            className={cn(
              'max-w-4xl mx-auto space-y-6 rounded-3xl border border-border bg-card/80 p-6 md:p-10 shadow-sm',
              langConfig.dir === 'rtl' ? 'text-right' : 'text-left'
            )}
          >
            <p className="text-lg text-muted-foreground">{content.intro}</p>

            <div className="space-y-4 text-base leading-relaxed text-foreground">
              <p>{content.paragraphOne}</p>
              <p>{content.paragraphTwo}</p>
            </div>

            <p className="text-sm text-muted-foreground">{content.credit}</p>

            <div className="space-y-3 rounded-2xl border border-border bg-background/60 p-5">
              <div className="space-y-1">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                  {content.contactSection.title}
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {content.contactSection.description}
                </p>
              </div>

              <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">
                {content.contactSection.emailLabel}
              </p>

              <div className="space-y-2 text-sm font-medium text-foreground">
                {CONTACT_EMAILS.map((email) => (
                  <a
                    key={email}
                    href={`mailto:${email}`}
                    className="block text-accent hover:underline underline-offset-2"
                  >
                    {email}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
