"use client";

import { useStore, AssessmentProps } from "@/contexts/Store";
import styles from "./self-assessment.module.scss";
import clsx from "clsx";
import { SummaryHeader } from "../components/summary-header/summaryHeader";
import { RadarGraph } from "../summary-report/graphs/graph/radar/radar";
import { useEffect, useState } from "react";
import { ScoreData } from "../summary-report/page";

export default function SelfAssessment() {
  const { structure, scoreObject } = useStore();
  const [scores, setScores] = useState<{
    chapters: ScoreData[];
    secondChapter: ScoreData[];
  }>({
    chapters: [],
    secondChapter: [],
  });

  useEffect(() => {
    if (scoreObject && structure) {
      //Chapters //
      const chaptersScoresTemp: ScoreData[] = scoreObject.data.assessment.map(
        (chapter, index) => {
          const subject =
            structure?.questionnaire.content?.[index]?.["chapter-title"] ?? "";
          let questionnaire = 0;
          if (index !== 1) {
            questionnaire = scoreObject.data.assessment[index]["chapter-score"];
          } else {
            const subChapter =
              scoreObject.data.assessment[index]["sub-chapters"];

            console.log(subChapter, "subChapter");
            const avg =
              subChapter && subChapter.length > 0
                ? subChapter.reduce(
                    (sum, sc) => sum + sc["sub-chapter-score"],
                    0
                  ) / subChapter.length
                : 0;

            questionnaire = avg;
          }
          return {
            subject,
            questionnaire: questionnaire,
          };
        }
      );

      setScores({
        chapters: chaptersScoresTemp,
        secondChapter: [],
      });
    }
  }, [scoreObject, structure]);

  useEffect(() => {
    console.log("scores", scores);
  }, [scores]);

  return (
    <div className={clsx(styles["main-container"], "main-container")}>
      {structure && (
        <>
          <SummaryHeader
            title={structure?.["self-assessment"]["summary-title"]}
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
                          : scores.chapters
                      }
                      key={index}
                      headline={graph.title}
                      structure={structure}
                      imageGridURL={`/pages/graphs/radar_grid_${graph.data}.svg`}
                    />
                  );
                  break;
              }
            })}
          </div>
        </>
      )}
    </div>
  );
}
