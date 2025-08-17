import clsx from "clsx";
import styles from "./summary-header.module.scss";
import { useStore, structureProps, ScoreType } from "@/contexts/Store";

function formatDate(timestamp: number) {
  const date = new Date(timestamp);
  const day = date.getDate();
  const month = date.getMonth() + 1; // Months are zero-based
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

type SummaryRow = {
  פרק: string;
  "תת-פרק": string;
  קרטריון: string;
  "רמת ביצוע": string;
  ציון: number | string;
  הערות: string;
  [key: string]: string | number;
};

function flattenAllTables(structure: structureProps, scoreObject: ScoreType) {
  const rows: SummaryRow[] = [];
  structure?.questionnaire.content.forEach((chapter, chapterIdx) => {
    chapter["chapter-content"].forEach((subChapter, subChapterIdx) => {
      subChapter.principles.forEach((principle, principleIdx) => {
        const inputNumber =
          scoreObject.data?.[chapterIdx]?.["chapter-data"]?.[subChapterIdx]?.[
            "principles"
          ]?.[principleIdx]?.choice;

        let score: number | undefined;
        if (inputNumber) {
          score =
            structure?.questionnaire.content[chapterIdx]["chapter-content"][
              subChapterIdx
            ]["principles"][principleIdx]["choices"][inputNumber - 1]?.score;
        }

        const comment =
          scoreObject.data?.[chapterIdx]?.["chapter-data"]?.[subChapterIdx]?.[
            "principles"
          ]?.[principleIdx]?.comment ?? "";

        if (inputNumber) {
          rows.push({
            פרק: `${chapter["chapter-number"]}. ${chapter["chapter-title"]}`,
            "תת-פרק": `${chapter["chapter-number"]}.${subChapterIdx + 1}. ${
              subChapter["sub-chapter-title"]
            }`,
            קרטריון: `${chapter["chapter-number"]}.${subChapterIdx + 1}.${
              principleIdx + 1
            }. ${principle["title"]}`,
            "רמת ביצוע": structure?.questionnaire?.options?.[inputNumber] ?? "",
            ציון: score ?? "",
            הערות: comment,
          });
        }
      });
    });
  });
  return rows;
}

function downloadAllCSV(structure: structureProps, scoreObject: ScoreType) {
  const rows = flattenAllTables(structure, scoreObject);
  const columns = ["הערות", "ציון", "רמת ביצוע", "קרטריון", "תת-פרק", "פרק"];
  const csv =
    columns.join(",") +
    "\n" +
    rows
      .map((row) =>
        columns
          .map((col) =>
            String(row[col] ?? "")
              .replace(/"/g, '""')
              .replace(/\n/g, " ")
          )
          .map((cell) => `"${cell}"`)
          .join(",")
      )
      .join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `${scoreObject["personal-details"].projectName}-${formatDate(
    Date.now()
  )}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function SummaryHeader({
  structure,
  scoreObject,
}: {
  structure: structureProps;
  scoreObject: ScoreType;
}) {
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
            )}
            onClick={() => downloadAllCSV(structure, scoreObject)}>
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
