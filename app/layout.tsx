import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import { headers } from "next/headers";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Eco Checkout SPA",
  description: "Eco Checkout Single Page Application",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersObj = await headers();
  const cookies = headersObj.get("cookie");
  return (
    <html className="h-full" lang="en">
      <body className={`${inter.className} h-full text-primary antialiased`}>
        <Providers cookies={cookies}>{children}</Providers>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
