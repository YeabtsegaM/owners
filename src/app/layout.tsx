import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shop Owner",
  description: "Shop Owner Portal for Bingo 2025 Gaming System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
