"use client";

import {
  CalcParameters,
  ScoreType,
  structureProps,
  useStore,
} from "@/contexts/Store";
import { SummaryHeader } from "../components/summary-header/summaryHeader";
import { Table } from "./table/table";
import styles from "./summary.module.scss";
import tableStyles from "./table/table.module.scss";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { ScoreData } from "../summary-report/page";
import {
  PDFDownloadLink,
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font,
  PDFViewer,
} from "@react-pdf/renderer";

function formatDate(timestamp: number) {
  const date = new Date(timestamp);
  const day = date.getDate();
  const month = date.getMonth() + 1; // Months are zero-based
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

//CSV//

function getFormattedTimestamp() {
  const date = new Date();

  // Get the timezone offset in minutes and convert to hours and minutes
  const timezoneOffset = -date.getTimezoneOffset(); // Negative because getTimezoneOffset returns the opposite sign
  const offsetHours = String(
    Math.floor(Math.abs(timezoneOffset) / 60)
  ).padStart(2, "0");
  const offsetMinutes = String(Math.abs(timezoneOffset) % 60).padStart(2, "0");
  const offsetSign = timezoneOffset >= 0 ? "+" : "-";

  // Format the date as ISO string and append the timezone offset
  const isoString = date.toISOString(); // Example: "2022-03-05T13:55:09.123Z"
  const formattedTimestamp = `${isoString.slice(
    0,
    -1
  )}${offsetSign}${offsetHours}:${offsetMinutes}`;

  return formattedTimestamp;
}

type SummaryRow = {
  [key: string]: string | number | boolean;
};

function flattenAllTables(structure: structureProps, scoreObject: ScoreType) {
  const rows: SummaryRow[] = [];
  structure?.questionnaire.content.forEach((chapter, chapterIdx) => {
    chapter["chapter-content"].forEach((subChapter, subChapterIdx) => {
      subChapter.principles.forEach((principle, principleIdx) => {
        const inputNumber =
          scoreObject.data.questionnaire?.[chapterIdx]?.["chapter-data"]?.[
            subChapterIdx
          ]?.["principles"]?.[principleIdx]?.choice;

        let score: number | undefined = undefined;
        let max_score: number | undefined = undefined;
        let zero_impact_score: number | undefined = undefined;
        let achievement_level: string | undefined = undefined;

        if (inputNumber) {
          score =
            structure?.questionnaire.content[chapterIdx]["chapter-content"][
              subChapterIdx
            ]["principles"][principleIdx]["choices"][inputNumber - 1]?.score;
          achievement_level =
            structure?.questionnaire?.options?.[inputNumber - 1];
        }

        max_score =
          structure?.questionnaire.content[chapterIdx]["chapter-content"][
            subChapterIdx
          ]["principles"][principleIdx]["choices"][4]?.score;
        zero_impact_score =
          structure?.questionnaire.content[chapterIdx]["chapter-content"][
            subChapterIdx
          ]["principles"][principleIdx]["choices"][3]?.score;

        const comment =
          scoreObject.data?.questionnaire?.[chapterIdx]?.["chapter-data"]?.[
            subChapterIdx
          ]?.["principles"]?.[principleIdx]?.comment ?? "";

        // if (inputNumber) {
        rows.push({
          eval_id: "",
          project_name: scoreObject["personal-details"].projectName,
          version_name: "",
          region: scoreObject["personal-details"].localAuthority,
          project_type: scoreObject["personal-details"].projectType,
          sub_type: scoreObject["personal-details"].projectSubType,
          proj_area: scoreObject["personal-details"].projectArea,
          proj_status: scoreObject["personal-details"].projectStatus,
          year_start: scoreObject["personal-details"].projectStartYear,
          year_comp: scoreObject["personal-details"].projectEndYear,
          approve_contact: scoreObject["personal-details"].contactPerson,
          contact: scoreObject["personal-details"].contactPerson,
          email: scoreObject["personal-details"].contactEmail,
          tel: scoreObject["personal-details"].contactPhone,
          criteria_no: "",
          chapter: `${chapter["chapter-number"]}. ${chapter["chapter-title"]}`,
          sub_chapter: `.${subChapterIdx + 1}. ${
            subChapter["sub-chapter-title"]
          }`,
          full_criteria_name: `${chapter["chapter-number"]}.${
            subChapterIdx + 1
          }.${principleIdx + 1}. ${principle["title"]}`,
          score: score ?? "",
          max_score: max_score ?? "",
          zero_impact_score: zero_impact_score ?? "",
          achievement_level: achievement_level ?? "",
          comments: comment,
          eval_timestamp: getFormattedTimestamp(),
        });
        // }
      });
    });
  });
  return rows;
}

function downloadAllCSV(structure: structureProps, scoreObject: ScoreType) {
  const rows = flattenAllTables(structure, scoreObject);
  console.log("Rows:", rows);
  const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
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
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csv], { type: "text/csv" });
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

// PDF Document

Font.register({
  family: "SimplerPro",
  src: "/fonts/SimplerPro-Regular.otf",
  fontStyle: "normal",
  fontWeight: "normal",
});

Font.register({
  family: "SimplerPro-Bold",
  src: "/fonts/SimplerPro-Bold.otf",
  fontStyle: "normal",
  fontWeight: "bold",
});

const PDFstyles = StyleSheet.create({
  page: {
    flexDirection: "row",
    backgroundColor: "#f3f9ed",
    fontFamily: "SimplerPro",
    direction: "rtl",
  },
  section: {
    margin: 20,
    padding: 20,
    flexGrow: 1,
  },
});

const PdfTable = ({
  columns,
  rows,
}: {
  columns: string[];
  rows: SummaryRow[];
}) => (
  <View style={{ display: "flex", flexDirection: "column", width: "100%" }}>
    {/* Table Header */}
    <View
      style={{
        flexDirection: "row",
        backgroundColor: "#7ab51d",
        borderTopLeftRadius: "200px",
        borderTopRightRadius: "200px",
        padding: 4,
      }}>
      {columns.map((col, idx) => (
        <Text
          key={col}
          style={{
            flex: 1,
            fontWeight: "bold",
            padding: 4,
            fontSize: 10,
            // borderRight:
            //   idx < columns.length - 1 ? "1px solid #000" : undefined,
            textAlign: "right",
            direction: "rtl",
            paddingTop: 12,
            paddingBottom: 12,
            paddingRight: 10,
            paddingLeft: 10,
            fontFamily: "SimplerPro-Bold",
          }}>
          {col}
        </Text>
      ))}
    </View>
    {/* Table Rows */}
    {rows.map((row, rowIdx) => (
      <View
        key={rowIdx}
        style={{ flexDirection: "row", borderBottom: "1px solid #ccc" }}>
        {columns.map((col, colIdx) => (
          <Text
            key={colIdx}
            style={{
              flex: 1,
              padding: 4,
              fontSize: 10,
              // borderRight:
              //   colIdx < columns.length - 1 ? "1px solid #ccc" : undefined,
              textAlign: "right",
              direction: "rtl",
              paddingTop: 12,
              paddingBottom: 12,
              backgroundColor: "white",
              paddingRight: 10,
              paddingLeft: 10,
            }}>
            {String(row[col] ?? "")}
          </Text>
        ))}
      </View>
    ))}
  </View>
);

const MyDocument = ({
  structure,
  scoreObject,
}: {
  structure: structureProps;
  scoreObject: ScoreType;
}) => {
  const columns = ["הערות", "ציון", "רמת ביצוע", "קרטריון", "תת-פרק", "פרק"];
  const rows = flattenAllTables(structure, scoreObject);

  return (
    <Document>
      <Page size="A4" style={PDFstyles.page}>
        <View style={PDFstyles.section}>
          <Text
            style={{
              fontSize: 16,
              marginBottom: 10,
              textAlign: "right",
              direction: "rtl",
            }}>
            {`${scoreObject["personal-details"].projectName}-${formatDate(
              Date.now()
            )}`}
          </Text>
          <PdfTable columns={columns} rows={rows} />
        </View>
      </Page>
    </Document>
  );
};

export default function Summary() {
  const { structure, scoreObject, calculateScores } = useStore();
  const [scores, setScores] = useState<{
    chapters: ScoreData[];
    subChapters: { [key: string]: ScoreData[] };
  }>({
    chapters: [],
    subChapters: {},
  });

  //Table//

  useEffect(() => {
    let questionnaireParams = [] as CalcParameters[];

    // Chapters //

    questionnaireParams = calculateScores(
      scoreObject.data.questionnaire ?? [],
      "chapters",
      "questionnaire"
    );

    const chaptersScoresTemp: ScoreData[] = questionnaireParams.map(
      (chapter, index) => {
        const generalScore = chapter["general-score"];

        const percentage = Math.round(
          (chapter["general-score"] / chapter["net-zero-impact"]) * 100
        );

        return {
          generalScore,
          percentage,
        };
      }
    );

    // Sub chapters //

    questionnaireParams = [];

    questionnaireParams = calculateScores(
      scoreObject.data.questionnaire ?? [],
      "subchapters",
      "questionnaire"
    );

    const subChaptersTemp: ScoreData[] = questionnaireParams.map(
      (subChapter, index) => {
        const subChapterIndex =
          typeof subChapter["sub-chapter"] === "number"
            ? subChapter["sub-chapter"]
            : 0;
        const subChapterNumber = `${subChapter.chapter + 1}.${
          subChapterIndex + 1
        }`;

        const generalScore = subChapter["general-score"];

        const percentage = Math.round(
          (subChapter["general-score"] / subChapter["net-zero-impact"]) * 100
        );

        return {
          subChapterNumber,
          generalScore,
          percentage,
        };
      }
    );

    const groupedSubChapters = subChaptersTemp.reduce<
      Record<string, typeof subChaptersTemp>
    >((acc, subChapter) => {
      const chapterNumber = String(subChapter.subChapterNumber)?.split(".")[0]; // Extract chapter number
      if (chapterNumber) {
        if (!acc[chapterNumber]) {
          acc[chapterNumber] = []; // Initialize array for the chapter if it doesn't exist
        }
        acc[chapterNumber].push(subChapter); // Add sub-chapter to the corresponding chapter group
      }
      return acc;
    }, {});

    setScores({
      chapters: chaptersScoresTemp,
      subChapters: groupedSubChapters,
    });
  }, [scoreObject]);

  //Export //

  return (
    <div className={clsx(styles["summary"], "main-container")}>
      {structure && (
        <SummaryHeader
          title={structure?.summary.header.title}
          structure={structure}
          scoreObject={scoreObject}>
          <button
            className={clsx("download", "basic-button with-icon outline")}
            onClick={() => downloadAllCSV(structure, scoreObject)}>
            {structure?.summary.header["buttons-copy"][0]}
          </button>
          {/* <PDFDownloadLink
            document={
              <MyDocument structure={structure} scoreObject={scoreObject} />
            }
            fileName={`${
              scoreObject["personal-details"].projectName
            }-${formatDate(Date.now())}.pdf`}
            className={clsx("print", "basic-button with-icon outline")}>
            {structure?.summary.header["buttons-copy"][1]}
          </PDFDownloadLink> */}
        </SummaryHeader>
      )}

      <div className={styles["tables-container"]}>
        <div
          className={clsx(
            tableStyles["row"],
            "paragraph_15 bold",
            tableStyles["row-titles"],
            tableStyles["row-titles-sticky"]
          )}>
          {structure?.summary?.table?.columns.map(
            (
              column: {
                title: string;
                dataIndex: string;
                key: string;
                "sub-title"?: string;
              },
              index: number
            ) => (
              <p
                key={index}
                className={clsx(
                  column["sub-title"] && tableStyles["score-points"],
                  "paragraph_15 bold"
                )}>
                {column.title}
                {column["sub-title"] && (
                  <span className={tableStyles["percentage-bubble"]}>
                    {column["sub-title"]}
                  </span>
                )}
              </p>
            )
          )}
        </div>
        {structure?.questionnaire.content.map((chapter, index) => {
          return (
            <Table
              key={chapter["chapter-number"]}
              chapterNumber={chapter["chapter-number"]}
              title={chapter["chapter-title"]}
              content={chapter["chapter-content"]}
              chapterScore={scores.chapters[index]}
              subChaptersScores={scores.subChapters[index + 1]}
            />
          );
        })}
      </div>
    </div>
  );
}
