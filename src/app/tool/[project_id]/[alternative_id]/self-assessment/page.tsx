"use client";

import { useStore } from "@/contexts/Store";
import styles from "./self-assessment.module.scss";
import clsx from "clsx";
import { SummaryHeader } from "../components/summary-header/summaryHeader";
import { RadarGraph } from "../summary-report/graphs/graph/radar/radar";
import { useEffect, useState } from "react";
import { ScoreData } from "../summary-report/page";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function SelfAssessment() {
  const { structure, scoreObject } = useStore();
  const [scores, setScores] = useState<{
    chapters: ScoreData[];
    secondChapter: ScoreData[];
  }>({
    chapters: [],
    secondChapter: [],
  });
  const params = useParams();

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

      //Second Chapters //

      const TempSecondChapterScoreValue =
        scoreObject.data.assessment[1]?.["sub-chapters"]?.map(
          (subChapter, index) => {
            const subject =
              structure?.questionnaire.content?.[1]?.["chapter-content"]?.[
                index
              ]["sub-chapter-title"] ?? "";

            const questionnaire =
              scoreObject.data.assessment[1]["sub-chapters"]?.[index][
                "sub-chapter-score"
              ] ?? 0;

            return {
              subject,
              questionnaire,
            };
          }
        ) ?? [];

      setScores({
        chapters: chaptersScoresTemp,
        secondChapter: TempSecondChapterScoreValue,
      });
    }
  }, [scoreObject, structure]);

  return (
    <div className={clsx(styles["main-container"], "main-container")}>
      {structure && (
        <>
          <SummaryHeader
            title={structure?.["self-assessment"]["summary-title"]}
            structure={structure}
            scoreObject={scoreObject}
          >
            <Link
              className="basic-button outline"
              href={`/tool/${params.project_id}/${params.alternative_id}/${structure.questionnaire.content[0]["chapter-slug"]}/1/1`}
            >
              המשך לשאלון
            </Link>
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
                      headline={
                        structure["self-assessment"]["graphs-headlines"][
                          index
                        ] ?? ""
                      }
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
