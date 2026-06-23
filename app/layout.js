import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthProvider } from "../context/AuthContext";
import QueryProvider from "@/components/providers/QueryProvider";
import ProfileGuard from "@/components/ProfileGuard";

// Google Fonts
const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-be-vietnam-pro",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata = {
  metadataBase: new URL("https://www.sosign.in"),
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
    url: "https://www.sosign.in",
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
  alternates: {
    canonical: "/",
  },
};


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${beVietnamPro.variable} antialiased min-h-screen flex flex-col`}>
        <AuthProvider>
          <QueryProvider>
            <ProfileGuard>
              <Navbar />
              <main className="flex-grow">{children}</main>
              <Footer />
            </ProfileGuard>
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
