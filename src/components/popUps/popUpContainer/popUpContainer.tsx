"use client";
import styles from "./pop-up-container.module.scss";

export function PopUpContainer({
  closeButton,
  children,
  headline,
}: {
  closeButton: () => void;
  children: React.ReactNode;
  headline: string;
}) {
  console.log("headline", headline);
  return (
    <div className={styles["pop-up-container"]}>
      <div className={styles["pop-up"]}>
        <button
          className={styles["close-button"]}
          onClick={closeButton}
        ></button>

        <h2 className="headline_medium-big">{headline}</h2>
        {children}
      </div>
    </div>
  );
}
