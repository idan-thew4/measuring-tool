"use client";

import styles from "./header.module.scss";
import Image from "next/image";
import { useStore } from "../../contexts/Store";

export function Header() {
  const { structure, setRegistrationPopup } = useStore();

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

      <button onClick={() => setRegistrationPopup("new-project")}>test</button>

      <button
        onClick={() => {
          document.cookie = `office@tdfmail.com=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
          window.location.href =
            "/tool/${project_id}/${alternative_id}/${project_id}/${alternative_id}self-assessment";
        }}
        className="basic-button outline negative"
      >
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
