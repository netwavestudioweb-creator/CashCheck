import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/BottomNav";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CashCheck",
  description: "Application CashCheck",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full font-sans bg-gray-50 text-foreground selection:bg-accent selection:text-white pb-[70px] md:pb-0">
        <main className="w-full min-h-screen bg-white relative overflow-x-hidden flex flex-col md:max-w-[440px] md:mx-auto md:my-10 md:min-h-[calc(100vh-5rem)] md:rounded-[40px] md:shadow-[0_8px_30px_rgb(0,0,0,0.06)] md:border md:border-gray-100 animate-fade-in">
          {children}
          <BottomNav />
        </main>
      </body>
    </html>
  );
}
