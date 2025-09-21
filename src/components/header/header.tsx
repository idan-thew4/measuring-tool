"use client";

import styles from "./header.module.scss";
import Image from "next/image";
import { useStore } from "../../contexts/Store";
import { useRouter } from "next/navigation";

export function Header() {
  const { structure } = useStore();
  const router = useRouter();

  return (
    <header className={styles["header-container"]}>
      <Image
        alt="Slil logo"
        src="/logo.svg"
        width={219}
        height={60}
        className={styles["logo"]}
      />
      {/* TO DO: remove "clear data" button */}

      <button
        onClick={() => {
          document.cookie = `office@tdfmail.com=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
          router.push("/tool/self-assessment");
        }}
        className="basic-button outline negative">
        התחל שאלון חדש
      </button>
      {/* TO DO: unmark <nav> */}

      {/* <nav> */}
      {/* {structure?.header["about-section"].map((link, index) => (
          <div key={index}>{link}</div>
        ))} */}
      {/* </nav> */}
    </header>
  );
}
