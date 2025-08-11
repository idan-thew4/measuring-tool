"use client";

import { useStore } from "@/contexts/Store";
import { SummaryHeader } from "./summaryHeader";
import { Table } from "./table/table";
import styles from "./summary.module.scss";

export default function Summary() {
  const { structure } = useStore();

  return (
    <div className="main-container">
      {/* <SummaryHeader /> */}
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
