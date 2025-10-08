"use client";

import styles from "./header.module.scss";
import Image from "next/image";
import { structureProps, useStore } from "../../contexts/Store";
import Link from "next/link";
import clsx from "clsx";
import { useRouter } from "next/navigation";

type logOutResponse = {
  success: boolean;
  data: string;
};

export function Header() {
  const {
    structure,
    loggedInChecked,
    setLoginPopup,
    projects,
    url,
    setLoggedInChecked,
  } = useStore();
  const router = useRouter();

  async function logOut(
    structure: structureProps
  ): Promise<logOutResponse | void> {
    try {
      const response = await fetch(`${url}/log-out`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        setLoggedInChecked(false);
        router.push(
          `/tool/0/0/${structure.questionnaire.content[1]["chapter-slug"]}/1/1`
        );
      }
    } catch (error) {
      console.error("Error creating new user:", error);
    }
  }

  console.log(loggedInChecked);

  return (
    <header className={styles["header-container"]}>
      <div className={clsx(styles["right-side"], styles["flex-h-align"])}>
        <Image
          alt="Slil logo"
          src="/logo.svg"
          width={219}
          height={60}
          className={styles["logo"]}
        />

        {loggedInChecked ? (
          loggedInChecked ? (
            <div className={styles["flex-h-align"]}>
              <Link href={"/tool/user-dashboard"}>
                {structure?.header.user[1]}
              </Link>
              <button onClick={() => logOut(structure)}>
                {structure?.header.user[2]}
              </button>
            </div>
          ) : (
            <button onClick={() => setLoginPopup(true)}>
              {structure?.header.user[0]}
            </button>
          )
        ) : null}
      </div>
      {loggedInChecked !== undefined && loggedInChecked && (
        <div className={styles["left-side"]}></div>
      )}
    </header>
  );
}
