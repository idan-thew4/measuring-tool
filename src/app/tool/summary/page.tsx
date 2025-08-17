"use client";

import { useStore } from "@/contexts/Store";
import { SummaryHeader } from "./summaryHeader/summaryHeader";
import { Table } from "./table/table";
import styles from "./summary.module.scss";
import clsx from "clsx";

export default function Summary() {
  const { structure, scoreObject } = useStore();

  //     const rows = flattenTableData(
  //       chapter["chapter-content"],
  //       chapter["chapter-title"],
  //       chapter["chapter-number"]
  //     );
  //     const columns = [
  //       "פרק",
  //       "תת-פרק",
  //       "קרטריון",
  //       "רמת ביצוע",
  //       "ציון",
  //       "הערות",
  //     ];
  //     const csv =
  //       columns.join(",") +
  //       "\n" +
  //       rows
  //         .map((row) =>
  //           columns
  //             .map((col) =>
  //               String(row[col] ?? "")
  //                 .replace(/"/g, '""')
  //                 .replace(/\n/g, " ")
  //             )
  //             .map((cell) => `"${cell}"`)
  //             .join(",")
  //         )
  //         .join("\n");
  //   });
  //         setCsvString(csv);

  // }, [structure]);

  return (
    <div className={clsx(styles["summary"], "main-container")}>
      {structure && (
        <SummaryHeader structure={structure} scoreObject={scoreObject} />
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
