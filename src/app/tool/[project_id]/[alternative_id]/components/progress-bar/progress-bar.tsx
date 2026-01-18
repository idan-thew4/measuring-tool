import styles from "./progressBar.module.scss";
import {
  totalCompleted,
  structureProps,
} from "../../../../../../contexts/Store";
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
  console.log("completed", completed);
  console.log("structure", structure);
  console.log("indicator", indicator);

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
            completed.filter((chapter) => chapter.completed === chapter.total)
              .length
          }/${completed.length}`}
        </p>
      ) : (
        <p className={clsx(styles["progress-indicator"], "paragraph_14")}>
          {`שלב ${
            completed.filter((chapter) => chapter.completed === chapter.total)
              .length
          } מ-${completed.length}`}
        </p>
      )}

      <ul className={styles["progress-bar-chapters"]}>
        {completed.map((chapter, index) => (
          <li className={styles["progress-bar-item"]} key={index}>
            <div
              className={clsx(
                styles["progress-bar-item-indicator"],
                !structure && chapter.skipped && styles["skipped"],
                structure &&
                  chapter.skipped === chapter.total &&
                  styles["skipped"]
              )}
              style={{
                width: `${(chapter.completed / chapter.total) * 100}%`,
              }}></div>
          </li>
        ))}
      </ul>
    </div>
  );
}
