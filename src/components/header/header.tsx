"use client";

import styles from "./header.module.scss";
import Image from "next/image";
import { useStore } from "../../contexts/Store";

export function Header() {
  const { structure } = useStore();

  return (
    <header className={styles["header-container"]}>
      <Image
        alt="Slil logo"
        src="/logo.svg"
        width={219}
        height={60}
        className={styles["logo"]}
      />
      <nav>
        {/* {structure?.header["about-section"].map((link, index) => (
          <div key={index}>{link}</div>
        ))} */}
      </nav>
    </header>
  );
}
