"use client";

import Image from "next/image";
import styles from "./mobileScreenWarning.module.scss";
import clsx from "clsx";
import { useStore } from "../../contexts/Store";
import Link from "next/link";

export function MobileScreenWarning() {
  const { structure } = useStore();
  return (
    <div className={styles["mobile-screen-warning-container"]}>
      <div className={styles["head"]}>
        <Link href={structure?.header["website-url"] || "/"} target="_blank">
          <Image
            alt="Slil logo"
            src="/logo.svg"
            width={219}
            height={60}
            className={styles["logo"]}
          />
        </Link>
      </div>
      <div className={styles["content"]}>
        <Image
          width={367}
          height={129}
          src={"/pages/mobile/mobile-img.svg"}
          alt="mobile-img"
          className={styles.loader}
        />
        <h1 className={clsx(styles["title"], "headline_big")}>
          {structure?.["mobile-notification"].title}
        </h1>
        <Link
          className={clsx(styles["big-button"], "big-button")}
          href={`mailto:${structure?.["mobile-notification"].cta.mail || "#"}`}>
          {structure?.["mobile-notification"].cta.copy}
        </Link>
      </div>
    </div>
  );
}
