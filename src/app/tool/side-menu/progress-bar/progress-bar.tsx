import styles from "./progressBar.module.scss";
import { useStore } from "../../../../contexts/Store";
import { useState } from "react";
import clsx from "clsx";

export function ProgressBar() {
  const { completedSteps, structure } = useStore();
  const [progress, setProgress] = useState({});

  return (
    <div className={styles["progress-bar-container"]}>
      <p className={clsx(styles["progress-headline"], "paragraph_18")}>
        {structure?.sidebar?.["progress-bar-headline"]}
      </p>
      <ul className={styles["progress-bar-steps"]}>
        {completedSteps.map((step, index) => (
          <li className={styles["progress-bar-item"]} key={index}>
            <div
              className={styles["progress-bar-item-indicator"]}
              style={{ width: `${(step.completedSteps / 4) * 100}%` }}></div>
          </li>
        ))}
      </ul>
      <ul className={styles["side-menu-options"]}>
        {/* {structure?.sidebar?.["bottom-options"].map((option, index) => (
       
        ))} */}
      </ul>
    </div>
  );
}
