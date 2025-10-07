"use client";

import { useStore, CalcParameters } from "@/contexts/Store";
import { RadarGraph } from "./graphs/graph/radar/radar";
import { StackedBar } from "./graphs/graph/stackedBar/stackedBar";
import { useEffect, useState } from "react";
import styles from "./summary-report.module.scss";
import { SummaryHeader } from "../components/summary-header/summaryHeader";
import clsx from "clsx";
import { useParams } from "next/navigation";

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
    loader,
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

  useEffect(() => {
    getAlternativeQuestionnaireData(
      params.project_id as string,
      params.alternative_id as string
    );
  }, []);

  useEffect(() => {
    console.log("scoreObject", scoreObject);

    const hasAssessment =
      Array.isArray(scoreObject.data.assessment) &&
      !scoreObject.data.assessment.every(
        (chapter) => chapter["chapter-score"] === 0
      );

    // chapters //

    let questionnaireParams = [] as CalcParameters[];

    questionnaireParams = calculateScores(
      scoreObject.data.questionnaire ?? [],
      "chapters",
      "questionnaire"
    );

    const chaptersScoresTemp: ScoreData[] = questionnaireParams.map(
      (chapter, index) => {
        const subject =
          structure?.questionnaire.content?.[index]?.["chapter-title"] ?? "";

        const questionnaire = Math.round(
          (chapter["general-score"] / chapter["net-zero-impact"]) * 100
        );

        const assessment =
          hasAssessment && scoreObject.data.assessment[index]["chapter-score"];

        return {
          subject,
          questionnaire,
          ...(hasAssessment
            ? {
                assessment: assessment,
              }
            : {}),
        };
      }
    );

    // second-chapters //

    questionnaireParams = [];

    questionnaireParams = calculateScores(
      scoreObject.data.questionnaire ?? [],
      "subchapters",
      "questionnaire"
    );

    const filteredQuestionnaireParams = questionnaireParams.filter(
      (chapter) => chapter["chapter"] === 1
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

        const questionnaire = Math.round(
          (subChapter["general-score"] / subChapter["net-zero-impact"]) * 100
        );

        const assessment =
          scoreObject.data.assessment[1]?.["sub-chapters"]?.[subChapterIndex]?.[
            "sub-chapter-score"
          ];

        return {
          subject,
          questionnaire,
          ...(hasAssessment
            ? {
                assessment: assessment,
              }
            : {}),
        };
      }
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
      }
    );

    setScores({
      chapters: chaptersScoresTemp,
      secondChapter: secondChapterTemp,
      subChapters: subChaptersTemp,
    });
  }, [structure, scoreObject]);

  if (loader) {
    return <div>Loading..</div>;
  }

  return (
    <div className={clsx(styles["main-container"], "main-container")}>
      {structure && (
        <>
          <SummaryHeader
            title={structure?.summary.header.title}
            structure={structure}
            scoreObject={scoreObject}
          />

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
