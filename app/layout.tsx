import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TRAFFIC SIGHT - Live Network Traffic Dashboard",
  description:
    "Real-time network traffic monitoring dashboard with 3D globe visualization and threat detection",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body suppressHydrationWarning className={`${jetbrainsMono.variable} font-mono antialiased bg-cyber-bg text-matrix-green`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
