import styles from "./progressBar.module.scss";
import { totalCompleted, structureProps } from "../../../../contexts/Store";
import clsx from "clsx";

type ProgressBarProps = {
  completed: totalCompleted;
  structure?: structureProps;
  indicator?: boolean;
};

export function ProgressBar({
  completed,
  structure,
  indicator,
}: ProgressBarProps) {
  console.log(completed);

  return (
    <div
      className={clsx(
        styles["progress-bar-container"],
        structure ? styles["side-menu"] : styles["questionnaire"]
      )}>
      {structure ? (
        <p className={clsx(styles["progress-headline"], "paragraph_18")}>
          {structure?.sidebar?.["progress-bar-headline"]}
        </p>
      ) : !indicator ? (
        <p className={clsx(styles["progress-count"], "paragraph_18")}>
          {`${
            completed.filter((step) => step.completed === step.total).length
          }/${completed.length}`}
        </p>
      ) : (
        <p className={clsx(styles["progress-indicator"], "paragraph_14")}>
          {`שלב ${
            completed.filter((step) => step.completed === step.total).length
          } מ-${completed.length}`}
        </p>
      )}

      <ul className={styles["progress-bar-steps"]}>
        {completed.map((step, index) => (
          <li className={styles["progress-bar-item"]} key={index}>
            <div
              className={styles["progress-bar-item-indicator"]}
              style={{
                width: `${(step.completed / step.total) * 100}%`,
              }}></div>
          </li>
        ))}
      </ul>
    </div>
  );
}
