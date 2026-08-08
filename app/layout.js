import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthProvider } from "../context/AuthContext";
import QueryProvider from "@/components/providers/QueryProvider";
import ProfileGuard from "@/components/ProfileGuard";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import Script from "next/script";

// Google Fonts
const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-be-vietnam-pro",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata = {
  metadataBase: new URL("https://sosign.in"),
  title: {
    default: "SoSign | Start & Sign Petitions for Change",
    template: "%s | SoSign",
  },
  description:
    "SoSign is India's leading verified petition and crowdfunding platform. Start a petition, gather verified signatures via Aadhaar, and launch crowdfunding campaigns to create lasting social impact.",
  openGraph: {
    title: "SoSign | Start & Sign Petitions for Change",
    description:
      "Start a petition, gather verified signatures via Aadhaar, and launch crowdfunding campaigns to create lasting social impact on SoSign.",
    url: "https://sosign.in",
    siteName: "SoSign",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SoSign | Start & Sign Petitions for Change",
    description:
      "Start a petition, gather verified signatures via Aadhaar, and launch crowdfunding campaigns to create lasting social impact on SoSign.",
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "google6dfd75c23da0a8f2",
    other: {
      "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION || "",
    },
  },
};


export default function RootLayout({ children }) {
  const jsonLdWebsite = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "SoSign",
    "url": "https://sosign.in/",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://sosign.in/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };

  const jsonLdOrg = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "SoSign",
    "url": "https://sosign.in",
    "logo": "https://sosign.in/logo.png",
    "sameAs": [
      "https://www.facebook.com/sosign",
      "https://twitter.com/sosign",
      "https://www.instagram.com/sosign"
    ]
  };

  return (
    <html lang="en">
      <head>
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        )}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
          integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Caveat:wght@600&family=Fira+Code:wght@400;600&family=Inter:wght@400;600;700&family=Merriweather:ital,wght@0,400;0,700;1,400&family=Montserrat:wght@400;600;700&family=Outfit:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,800;1,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${beVietnamPro.variable} antialiased min-h-screen flex flex-col`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebsite) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrg) }}
        />
        <AuthProvider>
          <QueryProvider>
            <ProfileGuard>
              <Navbar />
              <main className="flex-grow">{children}</main>
              <FloatingWhatsApp />
              <Footer />
            </ProfileGuard>
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
