import clsx from "clsx";
import styles from "./summary-header.module.scss";
import { useStore } from "@/contexts/Store";

function formatDate(timestamp: number) {
  const date = new Date(timestamp);
  const day = date.getDate();
  const month = date.getMonth() + 1; // Months are zero-based
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

export function SummaryHeader() {
  const { structure, scoreObject } = useStore();

  return (
    <div className={styles["summary-header"]}>
      <h1 className={clsx(styles["title"], "headline_small")}>
        {structure?.summary.header.title}
      </h1>
      <div className={styles["summary-main"]}>
        <div className={styles["summary-details"]}>
          <p className="paragraph_15">
            <span className="bold">
              {`${structure?.summary.header["summary-details"][0]}: `}
            </span>
            {`${formatDate(scoreObject["personal-details"].date)}`}
          </p>
          <p className="paragraph_15">
            <span className="bold">
              {`${structure?.summary.header["summary-details"][1]}: `}
            </span>
            {scoreObject["personal-details"].projectName}
          </p>
        </div>

        <div className={styles["summary-buttons"]}>
          <button
            className={clsx(
              styles["download"],
              "basic-button with-icon outline"
            )}>
            {structure?.summary.header["buttons-copy"][0]}
          </button>
          <button
            className={clsx(styles["print"], "basic-button with-icon outline")}>
            {structure?.summary.header["buttons-copy"][1]}
          </button>
        </div>
      </div>
    </div>
  );
}
