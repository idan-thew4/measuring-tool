"use client";
import clsx from "clsx";
import styles from "./pop-up-container.module.scss";
import { useState } from "react";

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
  const [exitAnimation, setExitAnimation] = useState(false);
  return (
    <div
      className={clsx(
        styles["pop-up-container"],
        exitAnimation && styles["exit-animation"]
      )}
      onClick={() => {
        setExitAnimation(true);
        setTimeout(closeButton, 300);
      }}
    >
      <div className={styles["pop-up"]} onClick={(e) => e.stopPropagation()}>
        <button
          className={styles["close-button"]}
          onClick={() => {
            setExitAnimation(true);
            setTimeout(closeButton, 300);
          }}
        ></button>
        <div className={styles["headline-container"]}>
          {navArrows !== undefined && navArrows > 1 && goToPrevSlide && (
            <button
              onClick={() => goToPrevSlide && goToPrevSlide()}
              className={styles["nav-arrow"]}
            ></button>
          )}
          <h2 className="headline_medium-big">{headline}</h2>
        </div>
        {children}
      </div>
    </div>
  );
}
