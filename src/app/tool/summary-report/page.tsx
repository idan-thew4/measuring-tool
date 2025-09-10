"use client";

import { useStore, ChapterPoints } from "@/contexts/Store";
import { RadarGraph } from "./graphs/graph/radar/radar";
import { StackedBar } from "./graphs/graph/stackedBar/stackedBar";
import { useEffect, useState } from "react";
import styles from "./summary-report.module.scss";
import { SummaryHeader } from "../components/summary-header/summaryHeader";
import clsx from "clsx";

export type ScoreData = {
  subject?: string;
  name?: string;
} & {
  [key: string]: number | string | null;
};

type CalcParameters = {
  chapter: number;
  "sub-chapter"?: number;
  "general-score": number;
  "max-score"?: number;
  "net-zero-impact": number;
  type?: string;
};

export default function SummaryReport() {
  const { structure, scoreObject } = useStore();
  const [scores, setScores] = useState<{
    chapters: ScoreData[];
    secondChapter: ScoreData[];
    subChapters: ScoreData[];
  }>({
    chapters: [],
    secondChapter: [],
    subChapters: [],
  });

  function calculateScores(data: ChapterPoints[], graph: string, type: string) {
    let index = 0;
    let calcParameters: CalcParameters[] = [];
    let subChapterObj: CalcParameters;

    data?.forEach((chapter, chapterIndex) => {
      if (graph === "chapters") {
        index = chapterIndex;
        calcParameters.push({
          chapter: chapterIndex,
          "general-score": 0,
          "net-zero-impact": 0,
          type: type,
        });
      }
      chapter["chapter-data"].forEach((subChapterData, subChapterIndex) => {
        if (graph === "subchapters") {
          index = subChapterIndex;
          subChapterObj = {
            chapter: chapterIndex,
            "sub-chapter": subChapterIndex,
            "general-score": 0,
            "max-score": 0,
            "net-zero-impact": 0,
            type: type,
          };
        }

        subChapterData.principles.forEach((principle, principleIndex) => {
          if (typeof principle.choice === "number" && principle.choice >= 0) {
            const structurePrinciple =
              structure?.questionnaire.content?.[chapterIndex]?.[
                "chapter-content"
              ]?.[subChapterIndex]?.["principles"]?.[principleIndex];

            const generalScore =
              structurePrinciple?.choices?.[principle.choice - 1];
            const netZeroImpactScore = structurePrinciple?.choices?.[3];
            const maxScore = structurePrinciple?.choices?.[4];

            if (generalScore && typeof generalScore.score === "number") {
              if (graph === "chapters") {
                calcParameters[index]["general-score"] += generalScore.score;
                calcParameters[index]["net-zero-impact"] +=
                  netZeroImpactScore?.score ?? 0;
              } else if (
                graph === "subchapters" &&
                subChapterObj &&
                typeof subChapterObj["max-score"] === "number"
              ) {
                subChapterObj["general-score"] += generalScore.score;
                subChapterObj["net-zero-impact"] +=
                  netZeroImpactScore?.score ?? 0;
                subChapterObj["max-score"] += maxScore?.score ?? 0;
              }
            }
          }
        });
        if (graph === "subchapters") {
          calcParameters.push(subChapterObj);
        }
      });
    });

    return calcParameters;
  }

  useEffect(() => {
    // chapters //

    let questionnaireParams = [] as CalcParameters[];

    questionnaireParams = calculateScores(
      scoreObject.data.questionnaire ?? [],
      "chapters",
      "questionnaire"
    );

    let assessmentParams = [] as CalcParameters[];

    if (scoreObject.data.assessment.length > 0) {
      assessmentParams = calculateScores(
        scoreObject.data.assessment ?? [],
        "chapters",
        "assessment"
      );
    }

    const chaptersScoresTemp: ScoreData[] = questionnaireParams.map(
      (chapter, index) => {
        const subject =
          structure?.questionnaire.content?.[index]?.["chapter-title"] ?? "";

        const questionnaire = Math.round(
          (chapter["general-score"] / chapter["net-zero-impact"]) * 100
        );

        const hasAssessment =
          assessmentParams.length > 0 &&
          assessmentParams[index] &&
          typeof assessmentParams[index]["general-score"] === "number" &&
          typeof assessmentParams[index]["net-zero-impact"] === "number" &&
          assessmentParams[index]["net-zero-impact"] !== 0;

        return {
          subject,
          questionnaire,
          ...(hasAssessment
            ? {
                assessment: Math.round(
                  (assessmentParams[index]["general-score"] /
                    assessmentParams[index]["net-zero-impact"]) *
                    100
                ),
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

    if (scoreObject.data.assessment.length > 0) {
      assessmentParams = calculateScores(
        scoreObject.data.assessment ?? [],
        "subchapters",
        "assessment"
      );
    }

    const filteredQuestionnaireParams = questionnaireParams.filter(
      (chapter) => chapter["chapter"] === 1
    );

    const secondChapterTemp: ScoreData[] = filteredQuestionnaireParams.map(
      (subChapter, index) => {
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

        const hasAssessment =
          assessmentParams.length > 0 &&
          assessmentParams[index] &&
          typeof assessmentParams[index]["general-score"] === "number" &&
          typeof assessmentParams[index]["net-zero-impact"] === "number" &&
          assessmentParams[index]["net-zero-impact"] !== 0;

        return {
          subject,
          questionnaire,
          ...(hasAssessment
            ? {
                assessment: Math.round(
                  (assessmentParams[index]["general-score"] /
                    assessmentParams[index]["net-zero-impact"]) *
                    100
                ),
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

  return (
    <div className={clsx(styles["main-container"], "main-container")}>
      {structure && (
        <>
          <SummaryHeader structure={structure} scoreObject={scoreObject} />
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
