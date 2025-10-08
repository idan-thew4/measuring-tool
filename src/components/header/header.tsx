"use client";

import styles from "./header.module.scss";
import Image from "next/image";
import { useStore } from "../../contexts/Store";
import Link from "next/link";

export function Header() {
  const { structure, loggedInChecked, setLoginPopup } = useStore();

  async function logOut() {}

  if (!structure) return null;

  return (
    <header className={styles["header-container"]}>
      <div className={styles["user-options"]}>
        <Image
          alt="Slil logo"
          src="/logo.svg"
          width={219}
          height={60}
          className={styles["logo"]}
        />
        {loggedInChecked ? (
          <>
            <button onClick={() => logOut()}>
              {structure?.header.user[2]}
            </button>
            <Link href={"/tool/user-dashboard"}>
              {structure?.header.user[1]}
            </Link>
          </>
        ) : (
          <button onClick={() => setLoginPopup(true)}>
            {structure?.header.user[0]}
          </button>
        )}
      </div>
    </header>
  );
}
