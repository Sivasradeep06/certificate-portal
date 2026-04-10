import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/Providers";
import { ToasterProvider } from "@/components/Toaster";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "CertPortal — VSBEC Certificate Platform",
    template: "%s | CertPortal",
  },
  description:
    "Search, view, and download your event certificates from VSBEC. Powered by CertPortal.",
  keywords: ["certificate", "VSBEC", "event", "download", "college"],
  icons: {
    icon: "/favicon.ico?v=3",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col antialiased bg-background text-foreground">
        <Providers>
          <ToasterProvider>
            {children}
          </ToasterProvider>
        </Providers>
      </body>
    </html>
  );
}
