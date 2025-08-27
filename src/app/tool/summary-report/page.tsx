"use client";

import { useStore } from "@/contexts/Store";
import { RadarGraph } from "./graphs/radar/radar";
import { useEffect, useState } from "react";

type ScoreData = {
  subject: string;
  fullMark: number;
} & {
  [key: string]: number | string;
};

export default function SummaryReport() {
  const { structure, scoreObject } = useStore();
  const [scores, setScores] = useState<{
    chapter: ScoreData[];
    subChapters: ScoreData[][];
  }>({
    chapter: [],
    subChapters: [],
  });

  useEffect(() => {
    let calcParameters: {
      chapter: number;
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

    let chapterScoresTemp: ScoreData[] = [];

    console.log(calcParameters);

    calcParameters.forEach((chapter, index) => {
      chapterScoresTemp.push({
        subject:
          structure?.questionnaire.content?.[index]?.["chapter-title"] ?? "",
        A: (chapter["max-score"] / chapter["net-zero-impact"]) * 100,
        B: (chapter["net-zero-impact"] / chapter["net-zero-impact"]) * 100,
        C:
          (chapter["improved"][0] /
            chapter["improved"][1] /
            chapter["net-zero-impact"]) *
          100,
        D:
          (chapter["significant-improvement"][0] /
            chapter["significant-improvement"][1] /
            chapter["net-zero-impact"]) *
          100,
        fullMark: (chapter["general-score"] / chapter["net-zero-impact"]) * 100,
      });
    });
    setScores({
      chapter: chapterScoresTemp,
      subChapters: [],
    });
  }, [structure, scoreObject]);

  useEffect(() => {
    console.log(scores);
  }, [scores]);

  return (
    <div>
      <RadarGraph />
    </div>
  );
}
