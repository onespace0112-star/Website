import { Suspense } from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/LanguageContext";
import { AuthProvider } from "@/lib/AuthContext";
import { QuoteModalProvider } from '@/lib/QuoteModalContext';
import ClientEnhancements from "@/components/ClientEnhancements";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ONE SPACE | 高端住宅一站式交付 | Design · Sourcing · QC · Logistics · Installation",
  description: "ONE SPACE 专注高端住宅一站式交付：把设计语言转成可执行标准与采购清单，出货前QC证据链，里程碑推进，跨境物流与到场/安装协调。服务全球：UAE、欧洲、澳洲、亚洲。",
  keywords: ["高端住宅交付", "家具采购", "QC验货", "跨境物流", "安装协调", "别墅装修", "整屋交付", "ONE SPACE", "furniture sourcing", "quality control", "luxury home delivery"],
  authors: [{ name: "ONE SPACE" }],
  creator: "ONE SPACE",
  publisher: "ONE SPACE",
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  metadataBase: new URL("https://onespacecn.com"),
  alternates: {
    canonical: "/",
    languages: {
      "zh-Hans": "/",
      "en": "/en",
    },
  },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: "https://onespacecn.com",
    siteName: "ONE SPACE",
    title: "ONE SPACE | 高端住宅一站式交付",
    description: "设计语言 → 可采购清单 → QC证据链 → 到场计划 → 安装协调。服务全球高端住宅客户。",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "ONE SPACE - 高端住宅一站式交付",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ONE SPACE | 高端住宅一站式交付",
    description: "设计语言 → 可采购清单 → QC证据链 → 到场计划 → 安装协调",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
};

// JSON-LD Structured Data
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "ONE SPACE",
  description: "高端住宅一站式交付服务：Design · Sourcing · QC · Logistics · Installation",
  url: "https://onespacecn.com",
  logo: "https://onespacecn.com/logo.png",
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+86-18126679031",
    contactType: "customer service",
    availableLanguage: ["Chinese", "English"],
  },
  sameAs: [
    "https://wa.me/8618126679031",
  ],
  areaServed: [
    { "@type": "Country", name: "United Arab Emirates" },
    { "@type": "Country", name: "Spain" },
    { "@type": "Country", name: "France" },
    { "@type": "Country", name: "Italy" },
    { "@type": "Country", name: "Australia" },
    { "@type": "Country", name: "Singapore" },
    { "@type": "Country", name: "Hong Kong" },
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "ONE SPACE Services",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Design Coordination",
          description: "设计对接与标准化",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Sourcing & Procurement",
          description: "采购与供应商整合",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Quality Control",
          description: "质检证据链",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Logistics & Delivery",
          description: "物流与交付",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Installation Coordination",
          description: "安装协调",
        },
      },
    ],
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "ONE SPACE 是卖家具的电商吗？还是服务团队？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "我们是服务型的一站式交付团队。你获得的不是'商品列表'，而是可控交付：设计语言标准、可采购清单、QC证据链、里程碑推进、到场计划与（可选）安装协调。",
      },
    },
    {
      "@type": "Question",
      name: "你们和其他公司/团队相比，有什么不同？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "差异体现在可验证的交付标准：①设计语言→可执行标准与清单；②出货前QC证据链；③里程碑推进；④变更规则；⑤到场计划与安装条件校验。",
      },
    },
    {
      "@type": "Question",
      name: "你们的 QC（验货）具体怎么做？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "按清单与标准检查外观、数量、包装、关键尺寸/工艺点，照片/视频留存，问题闭环处理后再出货。",
      },
    },
    {
      "@type": "Question",
      name: "我人不在中国，如何确保进度与结果可控？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "用里程碑推进与证据链同步：范围确认→清单/规格→下单与生产节点→出货前QC→装柜/出运→到场计划→（可选）安装协调。每个关键节点都有可视化材料与确认点。",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <meta name="geo.region" content="CN" />
        <meta name="geo.placename" content="Shenzhen" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
        {/* Google tag (gtag.js) */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=AW-17898575157"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config','AW-17898575157');
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <LanguageProvider>
          <AuthProvider>
            <QuoteModalProvider>
              {children}
              <Suspense fallback={null}>
                <ClientEnhancements />
              </Suspense>
            </QuoteModalProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
