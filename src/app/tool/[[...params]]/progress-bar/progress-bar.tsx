import styles from "./progressBar.module.scss";
import { totalCompleted, structureProps } from "../../../../contexts/Store";
import clsx from "clsx";

type ProgressBarProps = {
  completed: totalCompleted;
  structure?: structureProps;
};

export function ProgressBar({ completed, structure }: ProgressBarProps) {
  return (
    <div className={styles["progress-bar-container"]}>
      {structure && (
        <p className={clsx(styles["progress-headline"], "paragraph_18")}>
          {structure?.sidebar?.["progress-bar-headline"]}
        </p>
      )}
      <ul className={styles["progress-bar-steps"]}>
        {completed.map((step, index) => (
          <li className={styles["progress-bar-item"]} key={index}>
            <div
              className={styles["progress-bar-item-indicator"]}
              style={{ width: `${(step.completed / 4) * 100}%` }}></div>
          </li>
        ))}
      </ul>
    </div>
  );
}
