import clsx from "clsx";
import styles from "./summary-header.module.scss";
import { structureProps, ScoreType } from "@/contexts/Store";
import { useStore, formatDate } from "@/contexts/Store";

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
  const { current } = useStore();
  return (
    <div className={styles["summary-header"]}>
      <h1 className={clsx(styles["title"], "headline_small")}>{title}</h1>
      <div className={styles["summary-main"]}>
        <div className={styles["summary-details"]}>
          <p className="paragraph_15">
            <span className="bold">
              {`${structure?.summary.header["summary-details"][0]}: `}
            </span>
            {formatDate(current?.project.project_created_date_timestamp ?? 0)}
          </p>
          <p className="paragraph_15">
            <span className="bold">
              {`${structure?.summary.header["summary-details"][1]}: `}
            </span>
            {`${current?.project.project_name ?? 0}, ${
              current?.alternative.alternative_name ?? 0
            }`}
          </p>
        </div>

        <div className={clsx(styles["summary-buttons"], "paragraph_18")}>
          {children}
        </div>
      </div>
    </div>
  );
}
