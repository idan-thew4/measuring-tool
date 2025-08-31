"use client";

import { useStore } from "@/contexts/Store";
import { RadarGraph } from "./graphs/radar/radar";
import { useEffect, useState } from "react";

export type ScoreData = {
  subject: string;
} & {
  [key: string]: number | string;
};

export default function SummaryReport() {
  const { structure, scoreObject } = useStore();
  const [scores, setScores] = useState<{
    chapters: ScoreData[];
    subChapters: ScoreData[];
  }>({
    chapters: [],
    subChapters: [],
  });

  useEffect(() => {
    let calcParameters: {
      chapter: number;
      "sub-chapter"?: number;
      "general-score": number;
      "max-score": number;
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
              calcParameters[chapterIndex]["general-score"] +=
                generalScore.score;
              calcParameters[chapterIndex]["max-score"] += maxScore?.score ?? 0;
              calcParameters[chapterIndex]["net-zero-impact"] +=
                netZeroImpactScore?.score ?? 0;
              calcParameters[chapterIndex]["improved"][0] +=
                improvedScore?.score ?? 0;
              calcParameters[chapterIndex]["improved"][1] +=
                improvedScoreTotal ?? 0;
              calcParameters[chapterIndex]["significant-improvement"][0] +=
                significantImprovementScore?.score ?? 0;
              calcParameters[chapterIndex]["significant-improvement"][1] +=
                significantImprovementScoreTotal ?? 0;
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
        A: Math.round(
          (chapter["max-score"] / chapter["net-zero-impact"]) * 100
        ),
        B: Math.round(
          (chapter["net-zero-impact"] / chapter["net-zero-impact"]) * 100
        ),
        C: Math.round(
          (chapter["improved"][0] /
            chapter["improved"][1] /
            chapter["net-zero-impact"]) *
            100
        ),
        D: Math.round(
          (chapter["significant-improvement"][0] /
            chapter["significant-improvement"][1] /
            chapter["net-zero-impact"]) *
            100
        ),
        E: Math.round(
          (chapter["general-score"] / chapter["net-zero-impact"]) * 100
        ),
      });
    });

    ///////

    calcParameters = [];

    scoreObject?.data?.forEach((chapter, chapterIndex) => {
      chapter?.["chapter-data"]?.forEach((subChapterData, subChapterIndex) => {
        calcParameters.push({
          chapter: chapterIndex,
          "sub-chapter": subChapterIndex,
          "general-score": 0,
          "max-score": 0,
          "net-zero-impact": 0,
          improved: [0, 0],
          "significant-improvement": [0, 0],
        });

        subChapterData.principles.forEach((principle, principleIndex) => {
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
              calcParameters[subChapterIndex]["general-score"] +=
                generalScore.score;
              calcParameters[subChapterIndex]["max-score"] +=
                maxScore?.score ?? 0;
              calcParameters[subChapterIndex]["net-zero-impact"] +=
                netZeroImpactScore?.score ?? 0;
              calcParameters[subChapterIndex]["improved"][0] +=
                improvedScore?.score ?? 0;
              calcParameters[subChapterIndex]["improved"][1] +=
                improvedScoreTotal ?? 0;
              calcParameters[subChapterIndex]["significant-improvement"][0] +=
                significantImprovementScore?.score ?? 0;
              calcParameters[subChapterIndex]["significant-improvement"][1] +=
                significantImprovementScoreTotal ?? 0;
            }
          }
        });
      });
    });

    let subChapterScoresTemp: ScoreData[] = [];

    calcParameters.forEach((subChapter, index) => {
      subChapterScoresTemp.push({
        subject:
          structure?.questionnaire.content?.[subChapter.chapter]?.[
            "chapter-content"
          ][subChapter["sub-chapter"]]["sub-chapter-title"] ?? "",
        A: Math.round(
          (subChapter["max-score"] / subChapter["net-zero-impact"]) * 100
        ),
        B: Math.round(
          (subChapter["net-zero-impact"] / subChapter["net-zero-impact"]) * 100
        ),
        C: Math.round(
          (subChapter["improved"][0] /
            subChapter["improved"][1] /
            subChapter["net-zero-impact"]) *
            100
        ),
        D: Math.round(
          (subChapter["significant-improvement"][0] /
            subChapter["significant-improvement"][1] /
            subChapter["net-zero-impact"]) *
            100
        ),
        E: Math.round(
          (subChapter["general-score"] / subChapter["net-zero-impact"]) * 100
        ),
      });
    });

    setScores({
      chapters: chaptersScoresTemp,
      subChapters: subChapterScoresTemp,
    });
  }, [structure, scoreObject]);

  return (
    <div>
      {structure && (
        <>
          <RadarGraph parameters={scores.chapters} structure={structure} />
          {/* <RadarGraph parameters={scores.subChapters} structure={structure} /> */}
        </>
      )}
    </div>
  );
}
