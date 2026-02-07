import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const oxanium = localFont({
  src: "../public/fonts/Oxanium-Bold.woff2",
  variable: "--font-oxanium",
});

const jetbrainsMono = localFont({
  src: "../public/fonts/JetBrainsMono-Regular.woff2",
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "WASP AERODYNAMICS",
  description: "High-performance running & track and field gear.",
};

import { CartMenu } from "@/components/commerce/CartMenu";
import { CheckoutModal } from "@/components/commerce/CheckoutModal";
import { HUDNav } from "@/components/layout/HUDNav";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

// ... imports

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${oxanium.variable} ${jetbrainsMono.variable} antialiased bg-canvas text-primary font-mono selection:bg-accent-a selection:text-white`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          storageKey="wasp-theme"
        >
          <main className="min-h-screen relative flex flex-col">
            {children}
          </main>
          <HUDNav />
          <CartMenu />
          <CheckoutModal />
        </ThemeProvider>
      </body>
    </html>
  );
}
