import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import { Footer } from "./_components/footer";
import { Navbar } from "./_components/navbar";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "TODO",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className="h-full" lang="en">
      <body className={`flex h-full flex-col antialiased ${inter.variable}`}>
        <Suspense>
          <Navbar />
        </Suspense>
        <main className="grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
