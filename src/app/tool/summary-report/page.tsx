"use client";

import { useStore } from "@/contexts/Store";
import { RadarGraph } from "./graphs/radar/radar";
import { useEffect, useState } from "react";

export type ScoreData = {
  subject?: string;
  name?: string;
} & {
  [key: string]: number | string | null;
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

  useEffect(() => {
    let calcParameters: {
      chapter: number;
      "sub-chapter"?: number;
      "general-score": number;
      "max-score"?: number;
      "net-zero-impact": number;
      improved: number[];
      "significant-improvement": number[];
    }[] = [];

    scoreObject?.data?.forEach((chapter, chapterIndex) => {
      calcParameters.push({
        chapter: chapterIndex,
        "general-score": 0,
        "max-score": 0,
        "net-zero-impact": 0,
        improved: [0, 0],
        "significant-improvement": [0, 0],
      });

      chapter["chapter-data"].forEach((subChapterData, subChapterIndex) => {
        subChapterData.principles.forEach((principle, principleIndex) => {
          if (typeof principle.choice === "number" && principle.choice >= 0) {
            const structurePrinciple =
              structure?.questionnaire.content?.[chapterIndex]?.[
                "chapter-content"
              ]?.[subChapterIndex]?.["principles"]?.[principleIndex];

            const generalScore =
              structurePrinciple?.choices?.[principle.choice - 1];
            const netZeroImpactScore = structurePrinciple?.choices?.[3];

            if (generalScore && typeof generalScore.score === "number") {
              calcParameters[chapterIndex]["general-score"] +=
                generalScore.score;
              calcParameters[chapterIndex]["net-zero-impact"] +=
                netZeroImpactScore?.score ?? 0;
            }
          }
        });
      });
    });

    let chaptersScoresTemp: ScoreData[] = [];

    calcParameters.forEach((chapter, index) => {
      chaptersScoresTemp.push({
        subject:
          structure?.questionnaire.content?.[index]?.["chapter-title"] ?? "",
        A:
          chapter["net-zero-impact"] && chapter["net-zero-impact"] !== 0
            ? Math.round(
                (chapter["general-score"] / chapter["net-zero-impact"]) * 100
              )
            : null,
      });
    });

    ///////

    calcParameters = [];

    scoreObject?.data?.forEach((chapter, chapterIndex) => {
      chapter?.["chapter-data"]?.forEach((subChapterData, subChapterIndex) => {
        const subChapterObj = {
          chapter: chapterIndex,
          "sub-chapter": subChapterIndex,
          "general-score": 0,
          "max-score": 0,
          "net-zero-impact": 0,
          improved: [0, 0],
          "significant-improvement": [0, 0],
        };

        subChapterData.principles.forEach((principle, principleIndex) => {
          console.log(subChapterIndex, principle);
          if (typeof principle.choice === "number" && principle.choice >= 0) {
            const structurePrinciple =
              structure?.questionnaire.content?.[chapterIndex]?.[
                "chapter-content"
              ]?.[subChapterIndex]?.["principles"]?.[principleIndex];
            const generalScore =
              structurePrinciple?.choices?.[principle.choice - 1];
            const maxScore = structurePrinciple?.choices?.[4];
            const netZeroImpactScore = structurePrinciple?.choices?.[3];
            const improvedScore = structurePrinciple?.choices?.[1];
            const improvedScoreTotal = structurePrinciple?.choices?.[1]
              ? +1
              : +0;
            const significantImprovementScore =
              structurePrinciple?.choices?.[2];
            const significantImprovementScoreTotal = structurePrinciple
              ?.choices?.[2]
              ? +1
              : +0;

            if (generalScore && typeof generalScore.score === "number") {
              subChapterObj["general-score"] += generalScore.score;
              subChapterObj["max-score"] += maxScore?.score ?? 0;
              subChapterObj["net-zero-impact"] +=
                netZeroImpactScore?.score ?? 0;
              subChapterObj["improved"][0] += improvedScore?.score ?? 0;
              subChapterObj["improved"][1] += improvedScoreTotal ?? 0;
              subChapterObj["significant-improvement"][0] +=
                significantImprovementScore?.score ?? 0;
              subChapterObj["significant-improvement"][1] +=
                significantImprovementScoreTotal ?? 0;
            }
          }
        });
        calcParameters.push(subChapterObj);
      });
    });

    let subChapterScoresTemp: ScoreData[] = [];
    let secondChapterTemp: ScoreData[] = [];

    calcParameters.forEach((subChapter, index) => {
      if (subChapter.chapter === 1) {
        secondChapterTemp.push({
          subject:
            subChapter["sub-chapter"] !== undefined
              ? structure?.questionnaire.content?.[subChapter.chapter]?.[
                  "chapter-content"
                ]?.[subChapter["sub-chapter"]]?.["sub-chapter-title"] ?? ""
              : "",
          // A: Math.round(
          //   (subChapter["max-score"] / subChapter["net-zero-impact"]) * 100
          // ),
          // B: Math.round(
          //   (subChapter["net-zero-impact"] / subChapter["net-zero-impact"]) *
          //     100
          // ),
          // C: Math.round(
          //   (subChapter["improved"][0] /
          //     subChapter["improved"][1] /
          //     subChapter["net-zero-impact"]) *
          //     100
          // ),
          // D: Math.round(
          //   (subChapter["significant-improvement"][0] /
          //     subChapter["significant-improvement"][1] /
          //     subChapter["net-zero-impact"]) *
          //     100
          // ),
          E: subChapter["net-zero-impact"]
            ? Math.round(
                (subChapter["general-score"] / subChapter["net-zero-impact"]) *
                  100
              )
            : null,
        });
      }
    });

    // calcParameters.forEach((subChapter, index) => {
    //   subChapterScoresTemp.push({
    //     name:
    //       subChapter["sub-chapter"] !== undefined
    //         ? structure?.questionnaire.content?.[subChapter.chapter]?.[
    //             "chapter-content"
    //           ]?.[subChapter["sub-chapter"]]?.["sub-chapter-title"] ?? ""
    //         : "",
    //     ["ציון כללי"]: subChapter["net-zero-impact"],
    //     ["ניקוד אפשרי"]: subChapter["max-score"] - subChapter["general-score"],
    //   });
    // });

    setScores({
      chapters: chaptersScoresTemp,
      secondChapter: secondChapterTemp,
      subChapters: subChapterScoresTemp,
    });
  }, [structure, scoreObject]);

  return (
    <div>
      {structure && (
        <>
          <RadarGraph parameters={scores.chapters} structure={structure} />
          <RadarGraph parameters={scores.secondChapter} structure={structure} />
        </>
      )}
    </div>
  );
}
