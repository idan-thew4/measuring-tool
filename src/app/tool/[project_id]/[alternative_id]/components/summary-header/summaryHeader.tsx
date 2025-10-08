import clsx from "clsx";
import styles from "./summary-header.module.scss";
import { structureProps, ScoreType } from "@/contexts/Store";

export function formatDate(timestamp: number) {
  const date = new Date(timestamp);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

export function SummaryHeader({
  title,
  structure,
  scoreObject,
  children,
}: {
  title: string;
  structure: structureProps;
  scoreObject: ScoreType;
  children?: React.ReactNode;
}) {
  return (
    <div className={styles["summary-header"]}>
      <h1 className={clsx(styles["title"], "headline_small")}>{title}</h1>
      <div className={styles["summary-main"]}>
        <div className={styles["summary-details"]}>
          <p className="paragraph_15">
            <span className="bold">
              {`${structure?.summary.header["summary-details"][0]}: `}
            </span>
            {`${
              scoreObject["project-details"].projectCreationDate &&
              formatDate(scoreObject["project-details"].projectCreationDate)
            }`}
          </p>
          <p className="paragraph_15">
            <span className="bold">
              {`${structure?.summary.header["summary-details"][1]}: `}
            </span>
            {scoreObject["project-details"].projectName}
          </p>
        </div>

        <div className={styles["summary-buttons"]}>{children}</div>
      </div>
    </div>
  );
}
