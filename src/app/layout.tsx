import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "ADHD 자가진단 테스트",
    template: "%s | ADHD 자가진단"
  },
  description: "성인 ADHD 성향을 알아보는 자가진단 테스트입니다. 18개 문항으로 구성된 간단하고 신뢰할 수 있는 온라인 테스트를 통해 10-15분 내에 결과를 확인하세요.",
  keywords: [
    "ADHD",
    "성인ADHD", 
    "주의력 결핍",
    "과잉행동",
    "자가진단",
    "집중력",
    "충동성",
    "주의력 장애",
    "온라인 테스트",
    "정신건강"
  ],
  authors: [{ name: "ADHD 자가진단 테스트" }],
  creator: "ADHD 자가진단 테스트",
  publisher: "ADHD 자가진단 테스트",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "https://adhd-test.example.com",
    siteName: "ADHD 자가진단 테스트",
    title: "ADHD 자가진단 테스트 - 간단한 성인 ADHD 진단",
    description: "성인 ADHD 성향을 알아보는 신뢰할 수 있는 온라인 자가진단 테스트로 정확한 결과를 확인하세요",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "ADHD 자가진단 테스트",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ADHD 자가진단 테스트 - 간단한 성인 ADHD 진단",
    description: "성인 ADHD 성향을 알아보는 신뢰할 수 있는 온라인 자가진단 테스트로 정확한 결과를 확인하세요",
    images: ["/og-image.jpg"],
  },
  alternates: {
    canonical: "https://adhd-test.example.com",
  },
  category: "health",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="scroll-smooth">
      <head>
        <link
          rel="preload"
          as="style"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
        
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        
        <meta name="format-detection" content="telephone=no" />
        <meta name="theme-color" content="#3b82f6" />
        
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "ADHD 자가진단 테스트",
              "description": "성인 ADHD 성향을 알아보는 자가진단 테스트",
              "applicationCategory": "HealthApplication",
              "operatingSystem": "Web",
              "inLanguage": "ko-KR",
              "isAccessibleForFree": true,
              "accessibilityFeature": [
                "alternativeText",
                "longDescription",
                "readingOrder"
              ]
            })
          }}
        />
      </head>
      <body 
        className="font-sans antialiased min-h-screen"
        suppressHydrationWarning={true}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:shadow-lg"
        >
          메인 콘텐츠로 건너뛰기
        </a>
        
        <main id="main-content">
          {children}
        </main>
        
        <div
          id="announcements"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        />
      </body>
    </html>
  );
}