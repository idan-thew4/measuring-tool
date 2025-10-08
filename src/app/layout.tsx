import type { Metadata } from "next";
import { Header } from "@/components/header/header";
import styles from "./layout.module.scss";
import "../styles/globals.scss";
import { Store } from "../contexts/Store";
import { RegistrationPopup } from "@/components/popUps/registrationPopup/registrationPopup";
import { LoginPopup } from "@/components/popUps/loginPopup/loginPopup";
import { SelfAssessmentPopup } from "@/components/popUps/selfAssessmentPopup/selfAssessmentPopup";
import { ChangePasswordPopup } from "@/components/popUps/changePasswordPopup/changePasswordPopup";
import { DeletePopup } from "@/components/popUps/deletePopup/deletePopup";
import { AddRenamePopup } from "@/components/popUps/addRenamePopup/addRename";

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
            <LoginPopup />
            <SelfAssessmentPopup />
            <ChangePasswordPopup />
            <DeletePopup />
            <AddRenamePopup />
          </Store>
        </div>
      </body>
    </html>
  );
}
