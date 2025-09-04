"use client";

import { useStore, ChapterPoints, ScoreVariations } from "@/contexts/Store";
import { RadarGraph } from "./graphs/radar/radar";
import { useEffect, useState } from "react";
import styles from "./summary-report.module.scss";
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
              } else if (graph === "subchapters" && subChapterObj) {
                subChapterObj["general-score"] += generalScore.score;
                subChapterObj["net-zero-impact"] +=
                  netZeroImpactScore?.score ?? 0;
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
    let calcParameters = [] as CalcParameters[];

    const questionnaireParams = calculateScores(
      scoreObject.data.questionnaire ?? [],
      "chapters",
      "questionnaire"
    );
    const assessmentParams = calculateScores(
      scoreObject.data.assessment ?? [],
      "chapters",
      "assessment"
    );

    const chaptersScoresTemp: ScoreData[] = questionnaireParams.map(
      (chapter, index) => {
        const subject =
          structure?.questionnaire.content?.[index]?.["chapter-title"] ?? "";
        const questionnaire = Math.round(
          (chapter["general-score"] / chapter["net-zero-impact"]) * 100
        );
        const assessment = Math.round(
          (assessmentParams[index]["general-score"] /
            assessmentParams[index]["net-zero-impact"]) *
            100
        );

        return {
          subject,
          assessment,
          questionnaire,
        };
      }
    );

    // sub-chapters //

    calcParameters = [];

    let subChapterScoresTemp: ScoreData[] = [];
    let secondChapterTemp: ScoreData[] = [];

    // calcParameters.forEach((subChapter, index) => {
    //   if (subChapter.chapter === 1) {
    //     secondChapterTemp.push({
    //       subject:
    //         subChapter["sub-chapter"] !== undefined
    //           ? structure?.questionnaire.content?.[subChapter.chapter]?.[
    //               "chapter-content"
    //             ]?.[subChapter["sub-chapter"]]?.["sub-chapter-title"] ?? ""
    //           : "",
    //       A:
    //         subChapter["net-zero-impact"] !== 0
    //           ? Math.round(
    //               (subChapter["general-score"] /
    //                 subChapter["net-zero-impact"]) *
    //                 100
    //             )
    //           : 0,
    //     });
    //   }
    // });

    // calcParameters.forEach((subChapter, index) => {
    //   subChapterScoresTemp.push({
    //     name:
    //       subChapter["sub-chapter"] !== undefined
    //         ? structure?.questionnaire.content?.[subChapter.chapter]?.[
    //             "chapter-content"
    //           ]?.[subChapter["sub-chapter"]]?.["sub-chapter-title"] ?? ""
    //         : "",
    //     ["ציון כללי"]: subChapter["net-zero-impact"],
    //     ["ניקוד אפשרי"]: subChapter["max-score"]
    //       ? subChapter["max-score"] - subChapter["general-score"]
    //       : 0,
    //   });
    // });

    setScores({
      chapters: chaptersScoresTemp,
      secondChapter: secondChapterTemp,
      subChapters: subChapterScoresTemp,
    });
  }, [structure, scoreObject]);

  return (
    <div className="main-container">
      <div className={styles["graphs"]}>
        {structure &&
          structure["summary-report"].graphs.map((graph, index) => {
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
                  />
                );
            }
          })}
      </div>
    </div>
  );
}
