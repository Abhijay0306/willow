import { Luckiest_Guy, Courier_Prime } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const luckiestGuy = Luckiest_Guy({ 
  weight: '400',
  subsets: ["latin"],
  variable: "--font-heading"
});

const courier = Courier_Prime({ 
  weight: ['400', '700'],
  subsets: ["latin"],
  variable: "--font-body"
});

export const metadata = {
  title: "Wishing Willow",
  description: "Make a wish, but beware the consequences... A dark, twisted Wishing Willow experience.",
  keywords: ["wishing willow", "willow", "obsession", "monkey's paw", "dark wishes", "twisted wishes", "AI wishing well", "creepy AI"],
  openGraph: {
    title: "Wishing Willow",
    description: "Dare to make your own wish?",
    url: "https://willow.doodle2dollars.com",
    siteName: "Wishing Willow",
    images: [
      {
        url: "https://willow.doodle2dollars.com/share-image.png",
        width: 1200,
        height: 630,
        alt: "Wishing Willow"
      }
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Wishing Willow",
    description: "Dare to make your own wish?",
    images: ["https://willow.doodle2dollars.com/share-image.png"]
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning className={`${luckiestGuy.variable} ${courier.variable}`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
