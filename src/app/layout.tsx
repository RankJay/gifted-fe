import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ReactQueryProvider from "@/hooks/use-react-query";
import { Toaster } from "@/components/ui/sonner";
import { CDPProvider } from "@/components/providers/cdp-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gifted",
  description: "Send gift cards to anyone on earth",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <CDPProvider>
          <ReactQueryProvider>{children}</ReactQueryProvider>
          <Toaster />
        </CDPProvider>
      </body>
    </html>
  );
}
