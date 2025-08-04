import type { Metadata } from "next";
import { Header } from "@/components/header/header";
import styles from "./layout.module.scss";
import "../styles/globals.scss";
import { Store } from "../contexts/Store";
import { RegistrationPopup } from "@/components/registrationPopup/registrationPopup";
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
      <body>
        <div className={styles.layoutContainer}>
          <Store>
            <Header />
            <main className={styles.main}>{children}</main>
            <RegistrationPopup />
          </Store>
        </div>
      </body>
    </html>
  );
}
