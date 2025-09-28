"use client";
import styles from "./pop-up-container.module.scss";

export function PopUpContainer({
  closeButton,
  children,
  headline,
  navArrows,
  goToPrevSlide,
}: {
  closeButton: () => void;
  children: React.ReactNode;
  headline: string;
  navArrows?: number;
  goToPrevSlide?: () => void;
}) {
  return (
    <div className={styles["pop-up-container"]}>
      <div className={styles["pop-up"]}>
        <button
          className={styles["close-button"]}
          onClick={closeButton}
        ></button>
        <div className={styles["headline-container"]}>
          <h2 className="headline_medium-big">{headline}</h2>
          {navArrows !== undefined && navArrows > 1 && goToPrevSlide && (
            <button
              onClick={() => goToPrevSlide && goToPrevSlide()}
              className={styles["nav-arrow"]}
            >
              back
            </button>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}
