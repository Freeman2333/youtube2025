import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import "./globals.css";
import { TRPCProvider } from "@/trpc/client";
import { ToasterProvider } from "@/components/providers/toaster-provider";

export const metadata: Metadata = {
  title: "Youtube",
  description:
    "A simple youtube clone built with Next.js, TRPC, and Clerk for authentication.",
};

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <TRPCProvider>
            <ToasterProvider />
            {children}
            {process.env.NODE_ENV === "development" && (
              <ReactQueryDevtools initialIsOpen={false} />
            )}
          </TRPCProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
