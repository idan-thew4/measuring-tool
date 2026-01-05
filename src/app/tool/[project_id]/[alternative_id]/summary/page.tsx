"use client";

import {
  CalcParameters,
  ProjectType,
  ScoreType,
  structureProps,
  useStore,
  SubChapter,
  getPercentageLabel,
  getScoreLabel,
  alternativeType,
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
  Image,
  pdf,
} from "@react-pdf/renderer";
import { useParams } from "next/navigation";
import { saveAs } from "file-saver";
import { PDFheader, PDFstyles } from "../components/summary-header/pdfHeader";

//CSV//

// function getFormattedTimestamp() {
//   const date = new Date();

//   // Get the timezone offset in minutes and convert to hours and minutes
//   const timezoneOffset = -date.getTimezoneOffset(); // Negative because getTimezoneOffset returns the opposite sign
//   const offsetHours = String(
//     Math.floor(Math.abs(timezoneOffset) / 60)
//   ).padStart(2, "0");
//   const offsetMinutes = String(Math.abs(timezoneOffset) % 60).padStart(2, "0");
//   const offsetSign = timezoneOffset >= 0 ? "+" : "-";

//   // Format the date as ISO string and append the timezone offset
//   const isoString = date.toISOString(); // Example: "2022-03-05T13:55:09.123Z"
//   const formattedTimestamp = `${isoString.slice(
//     0,
//     -1
//   )}${offsetSign}${offsetHours}:${offsetMinutes}`;

//   return formattedTimestamp;
// }

// type SummaryRow = {
//   [key: string]: string | number | boolean | { [key: string]: string };
// };

// function flattenAllTables(structure: structureProps, scoreObject: ScoreType) {
//   const rows: SummaryRow[] = [];
//   let principleCount = 0;
//   structure?.questionnaire.content.forEach((chapter, chapterIdx) => {
//     chapter["chapter-content"].forEach((subChapter, subChapterIdx) => {
//       subChapter.principles.forEach((principle, principleIdx) => {
//         const inputNumber =
//           scoreObject.data.questionnaire?.[chapterIdx]?.["chapter-data"]?.[
//             subChapterIdx
//           ]?.["principles"]?.[principleIdx]?.choice;

//         let score: number | string | undefined = undefined;
//         let max_score: number | undefined = undefined;
//         let zero_impact_score: number | undefined = undefined;
//         let achievement_level: string | undefined = undefined;
//         principleCount++;

//         if (inputNumber) {
//           if (inputNumber === -1) {
//             score = "N/A";
//             achievement_level = "N/A";
//           } else {
//             score =
//               structure?.questionnaire.content[chapterIdx]["chapter-content"][
//                 subChapterIdx
//               ]["principles"][principleIdx]["choices"][inputNumber - 1]?.score;
//             achievement_level =
//               structure?.questionnaire?.options?.[inputNumber - 1];
//           }
//         }

//         max_score =
//           structure?.questionnaire.content[chapterIdx]["chapter-content"][
//             subChapterIdx
//           ]["principles"][principleIdx]["choices"][4]?.score;
//         zero_impact_score =
//           structure?.questionnaire.content[chapterIdx]["chapter-content"][
//             subChapterIdx
//           ]["principles"][principleIdx]["choices"][3]?.score;

//         const comment =
//           scoreObject.data?.questionnaire?.[chapterIdx]?.["chapter-data"]?.[
//             subChapterIdx
//           ]?.["principles"]?.[principleIdx]?.comment ?? "";

//         const date = new Date();
//         const year = date.getFullYear();
//         const month = date.getMonth() + 1;

//         // TO DO: user real ID here//

//         const eval_id = `${year}_${month}_1`;

//         // if (inputNumber) {
//         rows.push({
//           eval_id: eval_id,
//           project_name: scoreObject["project-details"].projectName,
//           version_name: "",
//           region: scoreObject["project-details"].localAuthority,
//           project_type: scoreObject["project-details"].projectType,
//           sub_type: scoreObject["project-details"].projectSubType,
//           proj_area: scoreObject["project-details"].projectArea,
//           proj_status: scoreObject["project-details"].projectStatus,
//           year_start: scoreObject["project-details"].projectStartYear,
//           year_comp: scoreObject["project-details"].projectEndYear,
//           approve_contact: scoreObject["project-details"].contactPerson,
//           contact: scoreObject["project-details"].contactPerson,
//           email: scoreObject["project-details"].contactEmail,
//           tel: scoreObject["project-details"].contactPhone,

//           criteria_no: principleCount,
//           chapter: `${chapter["chapter-number"]}. ${chapter["chapter-title"]}`,
//           sub_chapter: `.${subChapterIdx + 1}. ${
//             subChapter["sub-chapter-title"]
//           }`,
//           full_criteria_name: `${chapter["chapter-number"]}.${
//             subChapterIdx + 1
//           }.${principleIdx + 1}. ${principle["title"]}`,
//           score: score ?? "",
//           max_score: max_score ?? "",
//           zero_impact_score: zero_impact_score ?? "",
//           achievement_level: achievement_level ?? "",
//           comments: comment,
//           eval_timestamp: getFormattedTimestamp(),
//         });
//         // }
//       });
//     });
//   });
//   return rows;
// }

// function downloadAllCSV(structure: structureProps, scoreObject: ScoreType) {
//   const rows = flattenAllTables(structure, scoreObject);
//   const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
//   const csv =
//     columns.join(",") +
//     "\n" +
//     rows
//       .map((row) =>
//         columns
//           .map((col) =>
//             String(row[col] ?? "")
//               .replace(/"/g, '""')
//               .replace(/\n/g, " ")
//           )
//           .map((cell) => `"${cell}"`)
//           .join(",")
//       )
//       .join("\n");
//   const BOM = "\uFEFF";
//   const blob = new Blob([BOM + csv], { type: "text/csv" });
//   const url = URL.createObjectURL(blob);

//   const a = document.createElement("a");
//   a.href = url;
//   a.download = `${scoreObject["project-details"].projectName}-${formatDate(
//     Date.now()
//   )}.csv`;
//   document.body.appendChild(a);
//   a.click();
//   document.body.removeChild(a);
//   URL.revokeObjectURL(url);
// }

// PDF Document

Font.register({
  family: "Noto Sane Hebrew Regular",
  src: "/fonts/NotoSansHebrew-Regular.ttf",
  fontStyle: "normal",
  fontWeight: "normal",
});

Font.register({
  family: "Noto Sane Hebrew Bold",
  src: "/fonts/NotoSansHebrew-Bold.ttf",
  fontStyle: "normal",
  fontWeight: "bold",
});

const PdfTable = ({
  chapterNumber,
  title,
  chapter,
  chapterScore,
  structure,
  subChaptersScores,
  scoreObject,
}: {
  chapterNumber: number;
  title: string;
  chapter: SubChapter[];
  chapterScore: ScoreData;
  structure: structureProps | undefined;
  subChaptersScores: ScoreData[];
  scoreObject: ScoreType;
}) => (
  <View>
    {/* header */}
    <View style={{ ...PDFstyles.columns }}>
      <Text
        style={{
          flex: 3,
          fontFamily: "Noto Sane Hebrew Bold",
          fontSize: 14,
          padding: 4,
        }}>
        {title}
      </Text>
      <Text
        style={{
          flex: 1,
          fontSize: 11,
          textAlign: "right",
          padding: 4,
          height: 35,
        }}>
        {getPercentageLabel(
          chapterScore,
          (value: number) => getScoreLabel(structure, value),
          structure,
          getScoreLabel
        )}
      </Text>
      <View style={{ flex: 1, padding: 4, textAlign: "right" }}>
        <View
          style={{
            display: "flex",
            flexDirection: "row-reverse",
            textAlign: "right",
            gap: 0,
            margin: "auto",
            alignItems: "flex-start",
          }}>
          <Text style={{ flex: 1, fontSize: 11, textAlign: "left" }}>
            {chapterScore.generalScore}
          </Text>
          <View>
            {chapterScore.generalScore && (
              <Text
                style={{
                  flex: 1,
                  fontSize: 11,
                  fontFamily: "Noto Sane Hebrew Regular",
                  textAlign: "left",
                  paddingRight: 2,
                }}>
                <Text>{structure?.summary?.table?.columns[2]?.title}</Text>
              </Text>
            )}
          </View>
        </View>
        {chapterScore.percentage && (
          <Text style={PDFstyles.pointsBubble}>{chapterScore.percentage}%</Text>
        )}
      </View>
      <Text
        style={{
          flex: 3,
          fontSize: 11,
          textAlign: "right",
          padding: 4,
          paddingRight: 20,
        }}></Text>
    </View>
    {structure?.questionnaire.content.map((chapterItem, chapterIdx) => (
      <View
        key={chapterIdx}
        style={{
          border: "2px solid #D5D8D7",
          borderRadius: 15,
          overflow: "hidden",
          marginBottom: 20,
        }}>
        {chapterItem["chapter-content"].map((subChapter, subChapterIdx) => (
          <View key={`${chapterIdx}-${subChapterIdx}`}>
            <View
              style={{
                ...PDFstyles.columns,
                backgroundColor: "#5B6771",
                color: "white",
                height: 42,
                borderTopLeftRadius: subChapterIdx === 0 ? 13 : 0,
                borderTopRightRadius: subChapterIdx === 0 ? 13 : 0,
                paddingLeft: 20,
                paddingRight: 20,
                fontSize: 11,
                alignItems: "center",
              }}>
              <View
                style={{
                  display: "flex",
                  flexDirection: "row-reverse",
                  gap: 3,
                  flex: 3,
                }}>
                <Text style={{ fontFamily: "Noto Sane Hebrew Bold" }}>
                  .{`${chapterIdx + 1}.${subChapterIdx + 1}`}
                </Text>
                <Text style={{ fontFamily: "Noto Sane Hebrew Bold" }}>
                  {subChapter["sub-chapter-title"]}
                </Text>
              </View>
              <Text
                style={{
                  color: "white",
                  flex: 1,
                }}>
                {getPercentageLabel(
                  subChaptersScores,
                  subChapterIdx,
                  structure,
                  getScoreLabel
                )}
              </Text>
              <View style={{ flex: 1, padding: 4, textAlign: "right" }}>
                <View
                  style={{
                    display: "flex",
                    flexDirection: "row-reverse",
                    textAlign: "right",
                    gap: 0,
                    margin: "auto",
                    alignItems: "flex-start",
                  }}>
                  <Text style={{ flex: 1, fontSize: 11, textAlign: "left" }}>
                    {subChaptersScores[subChapterIdx]?.generalScore}
                  </Text>
                  <View>
                    {subChaptersScores[subChapterIdx]?.generalScore &&
                      subChapterIdx && (
                        <Text
                          style={{
                            flex: 1,
                            fontSize: 11,
                            fontFamily: "Noto Sane Hebrew Regular",
                            textAlign: "left",
                            paddingRight: 2,
                          }}>
                          <Text>
                            {structure?.summary?.table?.columns[2]?.title}
                          </Text>
                        </Text>
                      )}
                  </View>
                </View>
                {subChaptersScores[subChapterIdx]?.percentage && (
                  <Text
                    style={{
                      ...PDFstyles.pointsBubble,
                      backgroundColor: "white",
                      color: "#5B6771",
                    }}>
                    {subChaptersScores[subChapterIdx]?.percentage}%
                  </Text>
                )}
              </View>
              <View style={{ flex: 3 }}></View>
            </View>
            {subChapter.principles.map((principle, principleIndex) => {
              const inputNumber =
                scoreObject.data?.questionnaire?.[chapterNumber - 1]?.[
                  "chapter-data"
                ]?.[subChapterIdx]?.["principles"]?.[principleIndex]?.choice;
              let score: number | undefined;

              if (inputNumber) {
                score =
                  structure?.questionnaire.content[chapterNumber - 1][
                    "chapter-content"
                  ][subChapterIdx]["principles"][principleIndex]["choices"][
                    inputNumber - 1
                  ]?.score;
              }
              return (
                <View
                  key={principleIndex}
                  style={{
                    ...PDFstyles.columns,
                    color: "black",
                    paddingTop: 10,
                    paddingBottom: 8,
                    marginLeft: 20,
                    marginRight: 20,
                    fontSize: 11,
                    alignItems: "flex-start",
                    borderBottom:
                      principleIndex !== subChapter.principles.length - 1
                        ? "1px solid #D5D8D7"
                        : undefined,
                  }}>
                  <View
                    style={{
                      display: "flex",
                      flexDirection: "row-reverse",
                      gap: 3,
                      flex: 3,
                    }}>
                    <Text
                      style={{
                        textDecoration:
                          inputNumber === -1 ? "line-through" : "none",
                        color: inputNumber === undefined ? "#A0A0A0" : "black",
                      }}>
                      .
                      {`${chapterNumber}.${subChapterIdx + 1}.${
                        principleIndex + 1
                      }`}
                    </Text>
                    <Text
                      style={{
                        textDecoration:
                          inputNumber === -1 ? "line-through" : "none",
                        color: inputNumber === undefined ? "#A0A0A0" : "black",
                        width: 148,
                      }}>
                      {principle["title"]}
                    </Text>
                  </View>
                  <Text
                    style={{
                      flex: 1,
                    }}>
                    {inputNumber &&
                      structure?.questionnaire?.options?.[inputNumber - 1]}
                  </Text>
                  <Text style={{ flex: 1, padding: 4, textAlign: "center" }}>
                    {score}
                  </Text>
                  <Text style={{ flex: 3 }}>
                    {scoreObject.data?.questionnaire?.[chapterNumber - 1]?.[
                      "chapter-data"
                    ]?.[subChapterIdx]?.["principles"]?.[principleIndex]
                      ?.comment ?? ""}
                    {/* {inputNumber === -1 ? "דילגת על עיקרון זה" : ""} */}
                  </Text>
                </View>
              );
            })}
          </View>
        ))}
      </View>
    ))}
  </View>
);

const MyDocument = ({
  structure,
  scoreObject,
  current,
  scores,
}: {
  structure: structureProps;
  scoreObject: ScoreType;
  current: { project: ProjectType; alternative: alternativeType } | null;
  scores: {
    chapters: ScoreData[];
    subChapters: { [key: string]: ScoreData[] };
  };
}) => {
  // const rows = flattenAllTables(structure, scoreObject);

  return (
    <Document>
      <Page size="A4" style={PDFstyles.page}>
        <PDFheader
          structure={structure}
          current={current}
          PDFstyles={PDFstyles}>
          <View style={{ ...PDFstyles.columnsHeader, ...PDFstyles.columns }}>
            {structure?.summary?.table?.columns.map((col, idx) => (
              <View
                key={idx}
                style={{
                  padding: 4,
                  fontSize: 11,
                  paddingTop: 12,
                  flex: idx === 0 || idx === 3 ? 3 : 1,
                  textAlign: idx === 2 ? "center" : "right",
                  fontFamily: "Noto Sane Hebrew Bold",
                  paddingRight: idx === 3 ? 20 : 4,
                }}>
                <Text>{col.title}</Text>
                {idx === 2 && (
                  <Text style={{ ...PDFstyles.pointsBubble, width: "100%" }}>
                    אחוזי הצלחה
                  </Text>
                )}
              </View>
            ))}
          </View>
        </PDFheader>

        <View style={PDFstyles.section}>
          {structure?.questionnaire.content.map((chapter, chapterIdx) => (
            <PdfTable
              key={chapterIdx}
              chapterNumber={chapter["chapter-number"]}
              title={chapter["chapter-title"]}
              chapter={chapter["chapter-content"]}
              chapterScore={scores.chapters[chapterIdx]}
              subChaptersScores={scores.subChapters[chapterIdx + 1]}
              structure={structure}
              scoreObject={scoreObject}
            />
          ))}
        </View>
      </Page>
    </Document>
  );
};

export default function Summary() {
  const {
    structure,
    scoreObject,
    calculateScores,
    getAlternativeQuestionnaireData,
    isPageChanged,
    current,
    setLoader,
    url,
  } = useStore();
  const [scores, setScores] = useState<{
    chapters: ScoreData[];
    subChapters: { [key: string]: ScoreData[] };
  }>({
    chapters: [],
    subChapters: {},
  });
  const params = useParams();

  const [generatePDF, setGeneratePDF] = useState(false); // State to track PDF generation

  useEffect(() => {
    isPageChanged("summary");
    getAlternativeQuestionnaireData(
      params.project_id as string,
      params.alternative_id as string
    );
  }, []);

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
          (generalScore / chapter["max-score"]) * 100
        );

        console.log("average-score", chapter["average-score"]);

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
        const zeroImpactScore = subChapter["net-zero-impact"];

        const percentage = Math.round(
          (subChapter["general-score"] / subChapter["net-zero-impact"]) * 100
        );

        return {
          subChapterNumber,
          generalScore,
          percentage,
          zeroImpactScore,
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

  const handleDownload = async () => {
    setLoader(true);
    try {
      const blob = await pdf(
        <MyDocument
          structure={structure as structureProps}
          scoreObject={scoreObject}
          current={current}
          scores={scores}
        />
      ).toBlob();
      saveAs(
        blob,
        `${current?.project.project_name}, ${current?.alternative.alternative_name}.pdf`
      );
    } catch (error) {
      console.error("Error generating or downloading the PDF:", error);
    } finally {
      setLoader(false); // Ensure the loader is reset
    }
  };

  const getAlternativeCSV = async (alternative_id: string) => {
    setLoader(true);
    try {
      const response = await fetch(`${url}/create-alternative-csv`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ alternative_id }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      console.log(response);

      // const blob = await response.blob();
      // saveAs(
      //   blob,
      //   `${current?.project.project_name}, ${current?.alternative.alternative_name}.csv`
      // );
    } catch (error) {
      console.error("Error downloading CSV:", error);
    } finally {
      setLoader(false);
    }
  };

  return (
    <div className={clsx(styles["summary"], "main-container")}>
      {structure && current && (
        <SummaryHeader
          title={structure?.summary.header.title}
          structure={structure}
          scoreObject={scoreObject}>
          <button
            className={clsx("download", "basic-button with-icon outline")}
            onClick={() => getAlternativeCSV(params.alternative_id as string)}>
            {structure?.summary.header["buttons-copy"][0]}
          </button>
          <button
            onClick={handleDownload}
            className="basic-button print with-icon outline">
            {structure?.summary.header["buttons-copy"][1]}
          </button>
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
