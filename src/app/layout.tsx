import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import { Header } from "@/components/header/header";
import styles from "./layout.module.scss";
import "../styles/globals.scss";
import { Store } from "../contexts/Store";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  title: "Slil",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="heb" dir="rtl">
      <body
      // className={`${geistSans.variable} ${geistMono.variable}`}
      >
        <div className={styles.layoutContainer}>
          <Store>
            <Header />
            <main className={styles.main}>{children}</main>
          </Store>
        </div>
      </body>
    </html>
  );
}
