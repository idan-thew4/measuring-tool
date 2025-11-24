import {
  ProjectType,
  structureProps,
  alternativeType,
  formatDate,
} from "@/contexts/Store";

import { Text, View, StyleSheet, Image } from "@react-pdf/renderer";

export function PDFheader({
  structure,
  current,
  PDFstyles,
}: {
  structure: structureProps;
  current: { project: ProjectType; alternative: alternativeType } | null;
  PDFstyles: ReturnType<typeof StyleSheet.create>;
}) {
  return (
    <View style={PDFstyles.section} fixed>
      <View style={PDFstyles.header}>
        <Image
          src="/logo.png"
          style={{
            width: 196.43,
            height: 50,
          }}
        />
        <View>
          <Text
            style={{
              fontSize: 9,
            }}
            render={({ pageNumber, totalPages }) =>
              ` ${pageNumber} / ${totalPages}`
            }
          />
        </View>
      </View>
      <View style={{ ...PDFstyles.summaryHeader, ...PDFstyles.columns }}>
        <View
          style={{
            flexDirection: "row-reverse",
            alignItems: "center",
          }}>
          <Text
            style={{
              fontSize: 16,
              fontFamily: "Noto Sane Hebrew Bold",
              textAlign: "right",
              direction: "rtl",
              paddingLeft: 50,
            }}>
            סיכום
          </Text>
          <View
            style={{
              fontSize: 12,
              flexDirection: "row-reverse",
              gap: 1,
            }}>
            <Text
              style={{ fontFamily: "Noto Sane Hebrew Bold", paddingLeft: 2 }}>
              ,שם המיזם
            </Text>
            <Text style={{ fontFamily: "Noto Sane Hebrew Regular" }}>
              {current?.project.project_name ?? ""} |{" "}
              {current?.alternative.alternative_name ?? ""}
            </Text>
          </View>
        </View>
        <Text style={{ fontSize: 12 }}>
          {current?.project.project_created_date_timestamp
            ? formatDate(current?.project.project_created_date_timestamp)
            : ""}
        </Text>
      </View>
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
    </View>
  );
}
