import { Luckiest_Guy, Courier_Prime } from "next/font/google";
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
  description: "Make a wish, but beware the consequences...",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning className={`${luckiestGuy.variable} ${courier.variable}`}>
        {children}
      </body>
    </html>
  );
}
