import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ReactQueryProvider } from "@/components/providers/react-query-provider";
import { Web3Provider } from "@/components/providers/web3-provider";
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
          <ReactQueryProvider>
            <Web3Provider>{children}</Web3Provider>
          </ReactQueryProvider>
          <Toaster />
        </CDPProvider>
      </body>
    </html>
  );
}
