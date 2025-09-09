"use client";

import { useStore } from "@/contexts/Store";
import { SummaryTableHeader } from "./summaryHeader/SummaryTableHeader";
import { Table } from "./table/table";
import styles from "./summary.module.scss";
import clsx from "clsx";

export default function Summary() {
  const { structure, scoreObject } = useStore();

  return (
    <div className={clsx(styles["summary"], "main-container")}>
      {structure && (
        <SummaryTableHeader structure={structure} scoreObject={scoreObject} />
      )}
      <div className={styles["tables-container"]}>
        {structure?.questionnaire.content.map((chapter) => {
          return (
            <Table
              key={chapter["chapter-number"]}
              chapterNumber={chapter["chapter-number"]}
              title={chapter["chapter-title"]}
              content={chapter["chapter-content"]}
            />
          );
        })}
      </div>
    </div>
  );
}
