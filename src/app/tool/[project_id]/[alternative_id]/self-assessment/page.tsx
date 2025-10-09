"use client";

import { useStore, AssessmentProps } from "@/contexts/Store";
import styles from "./self-assessment.module.scss";
import clsx from "clsx";
import { SummaryHeader } from "../components/summary-header/summaryHeader";
import { RadarGraph } from "../summary-report/graphs/graph/radar/radar";
import { useEffect, useState } from "react";
import { ScoreData } from "../summary-report/page";
import { useParams, useRouter } from "next/navigation";

type getSelfAssessmentResponse = {
  success: boolean;
  data: {
    projectName: string;
    projectCreationDate: string;
    assessment: number | AssessmentProps[];
  };
};

type storeSelfAssessmentResponse = {
  success: boolean;
  data: AssessmentProps[];
};

export default function SelfAssessment() {
  const {
    structure,
    scoreObject,
    url,
    setScoreObject,
    selfAssessmentIsLoaded,
    setSelfAssessmentIsLoaded,
    isPageChanged,
  } = useStore();
  const [scores, setScores] = useState<{
    chapters: ScoreData[];
    secondChapter: ScoreData[];
  }>({
    chapters: [],
    secondChapter: [],
  });
  const params = useParams();
  const router = useRouter();

  async function getSelfAssessmentData(
    project_id: string
  ): Promise<getSelfAssessmentResponse | void> {
    setSelfAssessmentIsLoaded(true);

    try {
      const response = await fetch(`${url}/get-self-assessment-data`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ project_id }),
      });

      const data = await response.json();

      if (data.success) {
        if (data.data === 0) {
          setSelfAssessmentIsLoaded(false);
          // router.push(
          //   `/tool/${params.project_id}/${params.alternative_id}/${structure?.questionnaire.content[0]["chapter-slug"]}/1/1`
          // );
        }
      } else {
        router.push(
          `/tool/0/0/${structure?.questionnaire.content[0]["chapter-slug"]}/1/1`
        );
        setSelfAssessmentIsLoaded(false);
      }
    } catch (error) {
      console.error("Error creating new user:", error);
    }
  }

  async function storeSelfAssessment(
    project_id: string,
    assessment_data: AssessmentProps[]
  ): Promise<storeSelfAssessmentResponse | void> {
    setSelfAssessmentIsLoaded(true);
    try {
      const response = await fetch(`${url}/store-self-assessment-data`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          project_id,
          assessment_data: assessment_data,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSelfAssessmentIsLoaded(false);

        router.push(
          `/tool/${params.project_id}/${params.alternative_id}/${structure?.questionnaire.content[0]["chapter-slug"]}/1/1`
        );
      }
    } catch (error) {
      console.error("Error creating new user:", error);
    }
  }

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

  useEffect(() => {
    isPageChanged("self-assessment");

    if (params.project_id) {
      getSelfAssessmentData(String(params.project_id));
    }
  }, [params.project_id]);

  if (selfAssessmentIsLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className={clsx(styles["main-container"], "main-container")}>
      {structure && (
        <>
          <SummaryHeader
            title={structure?.["self-assessment"]["summary-title"]}
            structure={structure}
            scoreObject={scoreObject}
          >
            {/* TO DO: update button copy from structure */}
            <button
              className="basic-button outline"
              onClick={() =>
                storeSelfAssessment(
                  params.project_id as string,
                  scoreObject.data.assessment
                )
              }
            >
              המשך לשאלון
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
                      headline={
                        structure["self-assessment"]["graph-headlines"][
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
