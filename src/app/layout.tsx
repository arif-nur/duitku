import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { FinanceProvider } from "@/context/FinanceContext";
import { ToastProvider } from "@/context/ToastContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { PWARegister } from "@/components/PWARegister";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DuitKu — PWA Catatan Keuangan Pribadi",
  description:
    "Aplikasi pencatatan keuangan pribadi modern untuk mengelola pemasukan, pengeluaran harian, saldo otomatis, tabungan impian, dan anggaran bulanan.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "DuitKu",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/icon-192x192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#059669",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          <FinanceProvider>
            <ToastProvider>
              <PWARegister />
              <AppLayout>{children}</AppLayout>
            </ToastProvider>
          </FinanceProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
