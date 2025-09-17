import { SubChapter, useStore } from "@/contexts/Store";
import styles from "./table.module.scss";
import React, { JSX, useState } from "react";
import clsx from "clsx";
import { ScoreData } from "../../summary-report/page";

interface TableProps {
  chapterNumber: number;
  title: string;
  content: SubChapter[];
  chapterScore: ScoreData;
  subChaptersScores: ScoreData[];
}

export function Table({
  chapterNumber,
  title,
  content,
  chapterScore,
  subChaptersScores,
}: TableProps) {
  const { structure, scoreObject } = useStore();
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  function getComment(comment: string, key: number) {
    let formattedComment: JSX.Element | null = <p className="paragraph_15"></p>;
    const isExpanded = expandedKey === String(key);

    if (comment.split("").length > 32) {
      formattedComment = (
        <div className={styles["comment-container"]}>
          <div className={styles["comment-header"]}>
            <p className="paragraph_15">
              {`${comment.split(" ").slice(0, 4).join(" ")}...`}
            </p>
            <button
              className={styles["comment-button"]}
              onClick={() => setExpandedKey(isExpanded ? null : String(key))}>
              {isExpanded
                ? structure?.summary.table["buttons-copy"][1]
                : structure?.summary.table["buttons-copy"][0]}
            </button>
          </div>
          <span
            className={clsx(
              isExpanded ? styles["expanded"] : "",
              styles["comment-read-more"]
            )}>
            {comment}
          </span>
        </div>
      );
    } else if (comment.split("").length <= 32 && comment.split("").length > 1) {
      formattedComment = <p className="paragraph_15">{comment}</p>;
    } else {
      return (formattedComment = null);
    }

    return formattedComment;
  }

  function getScoreLabel(value: number) {
    const scoreLabels = structure?.questionnaire.options ?? [];

    if (value > 100) {
      return scoreLabels[4];
    } else if (value <= 100 && Number(value) >= 33) {
      return scoreLabels[3];
    } else if (value <= 34 && Number(value) >= 18) {
      return scoreLabels[2];
    } else {
      return scoreLabels[1];
    }
  }

  function getPercentageLabel(
    scores: ScoreData[] | ScoreData,
    indexOrGetScoreLabel: number | ((value: number) => string),
    getScoreLabel?: (value: number) => string
  ): string {
    if (Array.isArray(scores)) {
      const index = indexOrGetScoreLabel as number;
      if (scores[index] && Number(scores[index].percentage) > 0) {
        return (
          getScoreLabel?.(
            Number(
              scores[index].percentage != null ? scores[index].percentage : 0
            )
          ) ?? ""
        );
      }
    } else if (scores && Number(scores.percentage) > 0) {
      const labelFunction = indexOrGetScoreLabel as (value: number) => string;
      return labelFunction(
        Number(scores.percentage != null ? scores.percentage : 0)
      );
    }
    return "";
  }

  function getGeneralScore(
    scores: ScoreData[] | ScoreData,
    indexOrGetScoreLabel?: number
  ): string | number {
    if (Array.isArray(scores)) {
      const index = indexOrGetScoreLabel as number;
      if (
        scores[index] &&
        typeof scores[index].generalScore === "number" &&
        scores[index].generalScore > 0
      ) {
        return scores[index].generalScore;
      }
    } else if (
      scores &&
      typeof scores.generalScore === "number" &&
      scores.generalScore > 0
    ) {
      return scores.generalScore;
    }
    return "";
  }

  return (
    <div className={styles["table-container"]}>
      <div className={clsx(styles["row"], styles["row-headline"])}>
        <h2
          className={clsx(
            styles["table-title"],
            "headline_small bold"
          )}>{`${chapterNumber}. ${title}`}</h2>
        <p>{getPercentageLabel(chapterScore, getScoreLabel)}</p>
        <p>{getGeneralScore(chapterScore)}</p>
      </div>

      <div key={chapterNumber} className={styles["table"]}>
        {content.map((subChapter: SubChapter, subChapterIndex) => (
          <React.Fragment
            key={subChapter["sub-chapter-title"] ?? subChapterIndex}>
            <div
              className={clsx(
                styles["row"],
                styles["row-title"],
                "paragraph_15"
              )}>
              <p>{`${chapterNumber}.${subChapterIndex + 1}.`}</p>
              <h3>{`${subChapter["sub-chapter-title"]}`}</h3>
              <p>
                {getPercentageLabel(
                  subChaptersScores,
                  subChapterIndex,
                  getScoreLabel
                )}
              </p>

              <p>{getGeneralScore(subChaptersScores, subChapterIndex)}</p>
            </div>
            {subChapter.principles.map((principle, principleIndex) => {
              const inputNumber =
                scoreObject.data?.questionnaire?.[chapterNumber - 1]?.[
                  "chapter-data"
                ]?.[subChapterIndex]?.["principles"]?.[principleIndex]?.choice;

              let score: number | undefined;

              if (inputNumber) {
                score =
                  structure?.questionnaire.content[chapterNumber - 1][
                    "chapter-content"
                  ][subChapterIndex]["principles"][principleIndex]["choices"][
                    inputNumber - 1
                  ]?.score;
              }

              // if (!inputNumber) return null;

              return (
                <div key={principleIndex} className={styles["row"]}>
                  <p className="paragraph_15">{`${chapterNumber}.${
                    subChapterIndex + 1
                  }.${principleIndex + 1}.`}</p>
                  <h4
                    className={clsx(
                      inputNumber === -1 && styles["skipped"],
                      inputNumber === undefined && styles["not-answered"],
                      styles["principle-title"],
                      "paragraph_15"
                    )}>{`${principle["title"]}`}</h4>
                  <p className="paragraph_15">
                    {inputNumber !== undefined
                      ? structure?.questionnaire?.options?.[inputNumber - 1]
                      : ""}
                  </p>
                  <p className="paragraph_15">{score}</p>
                  {getComment(
                    scoreObject.data?.questionnaire?.[chapterNumber - 1]?.[
                      "chapter-data"
                    ]?.[subChapterIndex]?.["principles"]?.[principleIndex]
                      ?.comment ?? "",
                    principleIndex
                  )}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
