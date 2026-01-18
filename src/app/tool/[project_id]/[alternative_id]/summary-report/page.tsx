"use client";

import {
  ProjectType,
  ScoreType,
  structureProps,
  useStore,
  alternativeType,
  CalcParameters,
} from "@/contexts/Store";
import { RadarGraph } from "./graphs/graph/radar/radar";
import { StackedBar } from "./graphs/graph/stackedBar/stackedBar";
import { useEffect, useState, useRef } from "react";
import styles from "./summary-report.module.scss";
import { SummaryHeader } from "../components/summary-header/summaryHeader";
import clsx from "clsx";
import { useParams } from "next/navigation";
import { Loader } from "@/components/loader/loader";
import { PDFheader, PDFstyles } from "../components/summary-header/pdfHeader";
import {
  Page,
  Text,
  View,
  Document,
  Image,
  Font,
  pdf,
} from "@react-pdf/renderer";
import { saveAs } from "file-saver";

export type ScoreData = {
  subject?: string;
  name?: string;
} & {
  [key: string]: number | string | null | boolean;
};

export default function SummaryReport() {
  const {
    structure,
    scoreObject,
    calculateScores,
    getAlternativeQuestionnaireData,
    isPageChanged,
    getChaptersScores,
    maxValue,
    setLoader,
    current,
    PNGexports,
    setGetGraphsImages,
    getGraphsImages,
    setPNGexports,
    loader,
    activeSideMenu,
    setActiveSideMenu,
  } = useStore();
  const [scores, setScores] = useState<{
    chapters: ScoreData[];
    secondChapter: ScoreData[];
    subChapters: ScoreData[];
  }>({
    chapters: [],
    secondChapter: [],
    subChapters: [],
  });
  const params = useParams();
  const graphRefs = useRef<
    Array<{ capture: () => Promise<string | undefined> } | null>
  >([]);

  const handleClick = async () => {
    // Collect all PNG data URLs from the graph refs
    const images: { name: string; path: string }[] = [];

    for (let i = 0; i < graphRefs.current.length; i++) {
      const ref = graphRefs.current[i];
      if (ref && typeof ref.capture === "function") {
        const dataUrl = await ref.capture();
        if (typeof dataUrl === "string" && dataUrl) {
          images.push({ name: `graph-${i}`, path: dataUrl });
        }
      }
    }

    setPNGexports(images);
  };

  useEffect(() => {
    if (PNGexports.length > 0) {
      handleDownload();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [PNGexports]);

  useEffect(() => {
    isPageChanged("summary");
    getAlternativeQuestionnaireData(
      params.project_id as string,
      params.alternative_id as string,
    );
  }, []);

  useEffect(() => {
    const hasAssessment =
      Array.isArray(scoreObject.data.assessment) &&
      !scoreObject.data.assessment.every(
        (chapter) => chapter["chapter-score"] === 0,
      );

    // chapters //

    let questionnaireParams = [] as CalcParameters[];

    questionnaireParams = calculateScores(
      scoreObject.data.questionnaire ?? [],
      "chapters",
      "questionnaire",
    );

    const chaptersScoresTemp: ScoreData[] = structure
      ? getChaptersScores(
          questionnaireParams,
          structure,
          hasAssessment,
          scoreObject,
        )
      : [];

    // second-chapters //

    questionnaireParams = [];

    questionnaireParams = calculateScores(
      scoreObject.data.questionnaire ?? [],
      "subchapters",
      "questionnaire",
    );

    const filteredQuestionnaireParams = questionnaireParams.filter(
      (chapter) => chapter["chapter"] === 1,
    );

    const secondChapterTemp: ScoreData[] = filteredQuestionnaireParams.map(
      (subChapter) => {
        const subChapterIndex =
          typeof subChapter["sub-chapter"] === "number"
            ? subChapter["sub-chapter"]
            : 0;
        const subject =
          structure?.questionnaire.content?.[subChapter.chapter]?.[
            "chapter-content"
          ]?.[subChapterIndex]?.["sub-chapter-title"] ?? "";

        const questionnaireValue = Math.round(
          (subChapter["general-score"] / subChapter["net-zero-impact"]) * 100,
        );
        const questionnaire = Number.isNaN(questionnaireValue)
          ? 0
          : questionnaireValue;

        const assessment =
          hasAssessment &&
          scoreObject.data.assessment[1]?.["sub-chapters"]?.[subChapterIndex]?.[
            "sub-chapter-score"
          ];

        const averageScore =
          subChapter["average-score"] !== undefined &&
          subChapter["principles-count"] !== undefined &&
          subChapter["principles-count"] !== 0
            ? Math.round(
                subChapter["average-score"] / subChapter["principles-count"],
              )
            : 0;

        return {
          subject,
          questionnaire,
          ...(hasAssessment
            ? {
                assessment: assessment,
              }
            : {}),
          ...(Number.isNaN(averageScore) ? {} : { averageScore }),
        };
      },
    );

    // sub-chapters //

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
        const possibleScore =
          (subChapter["max-score"] ?? 0) - (subChapter["general-score"] ?? 0);

        return {
          subChapterNumber,
          generalScore,
          possibleScore,
        };
      },
    );

    setScores({
      chapters: chaptersScoresTemp,
      secondChapter: secondChapterTemp,
      subChapters: subChaptersTemp,
    });
  }, [structure, scoreObject]);

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

  const MyDocument = ({
    structure,
    current,
    graphs,
  }: {
    structure: structureProps;
    current: { project: ProjectType; alternative: alternativeType } | null;
    graphs: { name: string; path: string }[];
  }) => {
    return (
      <Document>
        {graphs.map((graph, index) => {
          const a4Width = 560;
          const aspectRatio = (graph.name === "graph-2" ? 300 : 450) / 395;
          const imageHeight = a4Width * aspectRatio;

          return (
            <Page size="A4" style={PDFstyles.page} key={index}>
              <PDFheader
                structure={structure}
                current={current}
                PDFstyles={PDFstyles}
              />
              <View
                style={{
                  ...PDFstyles.section,
                  width: "87%",
                  marginLeft: "auto",
                  marginRight: "auto",

                  flexDirection: "row",
                  justifyContent: "flex-start",
                }}
              >
                <Image
                  src={graph.path}
                  style={{
                    width: "100%",
                    height: "100%",
                  }}
                />
              </View>
            </Page>
          );
        })}
      </Document>
    );
  };

  const handleDownload = async () => {
    try {
      const blob = await pdf(
        <MyDocument
          structure={structure as structureProps}
          current={current}
          graphs={PNGexports}
        />,
      ).toBlob();
      saveAs(
        blob,
        `${current?.project.project_name}, ${current?.alternative.alternative_name}.pdf`,
      );
    } catch (error) {
      console.error("Error generating or downloading the PDF:", error);
    } finally {
    }
  };

  useEffect(() => {
    if (!activeSideMenu) {
      setTimeout(() => {
        setActiveSideMenu(true);
      }, 1200);
    }
  }, [activeSideMenu]);

  if (!structure || loader) {
    return <Loader />;
  }

  return (
    <div
      className={clsx(
        styles["main-container"],
        "main-container",
        !loader && "main-container--enter",
      )}
    >
      {structure && (
        <>
          <SummaryHeader
            title={structure?.summary.header.title}
            structure={structure}
            scoreObject={scoreObject}
          >
            <button
              type="button"
              onClick={() => {
                handleClick();
              }}
              className="basic-button print with-icon outline"
            >
              {structure?.summary.header["buttons-copy"][0]}
            </button>
          </SummaryHeader>

          <div className={styles["graphs"]}>
            {structure["summary-report"].graphs.map((graph, index) => {
              switch (graph.type) {
                case "radar":
                  return (
                    <RadarGraph
                      parameters={
                        graph.data === "chapters"
                          ? scores.chapters
                          : scores.secondChapter
                      }
                      key={index}
                      headline={graph.title}
                      filters={graph.filters}
                      structure={structure}
                      imageGridURL={`/pages/graphs/radar_grid_${graph.data}.svg`}
                      maxScore={maxValue}
                      ref={(refObj) => {
                        graphRefs.current[index] = refObj;
                      }}
                    />
                  );
                  break;
                case "barChart":
                  return (
                    <StackedBar
                      parameters={scores.subChapters}
                      key={index}
                      headline={graph.title}
                      structure={structure}
                      filters={graph.filters}
                      ref={(refObj) => {
                        graphRefs.current[index] = refObj;
                      }}
                    />
                  );
              }
            })}
          </div>
        </>
      )}
    </div>
  );
}
