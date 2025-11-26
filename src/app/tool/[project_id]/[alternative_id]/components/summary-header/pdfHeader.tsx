import {
  ProjectType,
  structureProps,
  alternativeType,
  formatDate,
} from "@/contexts/Store";

import { Text, View, StyleSheet, Image } from "@react-pdf/renderer";

export const PDFstyles = StyleSheet.create({
  page: {
    fontFamily: "Noto Sane Hebrew Regular",
    direction: "rtl",
    display: "flex",
  },
  section: {
    // margin: 20,
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 20,
    paddingRight: 20,
    // flexGrow: 1,
  },
  header: {
    display: "flex",
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "flex-start",
    fontFamily: "Noto Sane Hebrew Regular",
  },
  summaryHeader: {
    display: "flex",
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    paddingBottom: 5,
    borderBottom: "2px solid #000",
  },

  columnsHeader: {
    borderBottom: "1px solid #000",
  },

  columns: {
    display: "flex",
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "flex-start",
    textAlign: "right",
    gap: 3,
  },
  pointsBubble: {
    color: "white",
    backgroundColor: "#5B6771",
    paddingBottom: 2,
    paddingTop: 2,
    paddingLeft: 4,
    paddingRight: 4,
    fontSize: 9,
    borderRadius: "12px",
    margin: "4px auto auto auto",
    textAlign: "center",
    width: "60%",
    alignItems: "center",
  },
});
export function PDFheader({
  structure,
  current,
  PDFstyles,
  children,
}: {
  structure: structureProps;
  current: { project: ProjectType; alternative: alternativeType } | null;
  PDFstyles: ReturnType<typeof StyleSheet.create>;
  children?: React.ReactNode;
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
      {children}
    </View>
  );
}
