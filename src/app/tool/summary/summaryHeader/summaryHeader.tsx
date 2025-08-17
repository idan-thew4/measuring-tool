import clsx from "clsx";
import styles from "./summary-header.module.scss";
import { structureProps, ScoreType } from "@/contexts/Store";
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

export function SummaryHeader({
  structure,
  scoreObject,
}: {
  structure: structureProps;
  scoreObject: ScoreType;
}) {
  return (
    <div className={styles["summary-header"]}>
      {/* <PDFViewer width="100%" height={600} style={{ border: "none" }}>
        <MyDocument structure={structure} scoreObject={scoreObject} />
      </PDFViewer> */}
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
          <PDFDownloadLink
            document={
              <MyDocument structure={structure} scoreObject={scoreObject} />
            }
            fileName={`${
              scoreObject["personal-details"].projectName
            }-${formatDate(Date.now())}.pdf`}
            className={clsx(styles["print"], "basic-button with-icon outline")}>
            {structure?.summary.header["buttons-copy"][1]}
          </PDFDownloadLink>
        </div>
      </div>
    </div>
  );
}
