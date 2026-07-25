import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Receipts: show the receipts on anything online",
  description:
    "Paste any claim and see how well-supported it actually is: the reasoning, the red flags, what's missing, and where to check. A reasoning aid, not a verdict.",
  openGraph: {
    title: "Receipts: show the receipts on anything online",
    description:
      "See how well-supported any claim is: the reasoning, the red flags, and where to check. Not a verdict.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
