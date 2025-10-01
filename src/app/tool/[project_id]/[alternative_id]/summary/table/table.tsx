import { SubChapter, useStore } from "@/contexts/Store";
import styles from "./table.module.scss";
import React, { JSX, useState, useRef, useEffect } from "react";
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
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [tableDropdown, setTableDropdown] = useState<boolean>(true);
  const [tableDropdownHeights, setTableDropdownHeights] = useState<{
    opened: number | null;
    closed: number;
  }>({ opened: null, closed: 6.7 });

  useEffect(() => {
    if (tableContainerRef.current) {
      const height = tableContainerRef.current.getBoundingClientRect().height;
      const rootFontSize = parseFloat(
        getComputedStyle(document.documentElement).fontSize
      );

      setTableDropdownHeights((prev) => ({
        ...prev,
        opened: Math.round(height / rootFontSize),
      }));

      setTableDropdown(false);
    }
  }, []);

  function getComment(comment: string, key: number) {
    let formattedComment: JSX.Element | null = <p className="paragraph_15"></p>;
    const isExpanded = expandedKey === String(key);

    if (comment.split("").length > 10) {
      formattedComment = (
        <div className={styles["comment-container"]}>
          <div className={styles["comment-header"]}>
            <p className="paragraph_18">
              {`${comment.split(" ").slice(0, 2).join(" ")}...`}
            </p>
            <button
              className={styles["comment-button"]}
              onClick={() => setExpandedKey(isExpanded ? null : String(key))}
            >
              {isExpanded
                ? structure?.summary.table["buttons-copy"][1]
                : structure?.summary.table["buttons-copy"][0]}
            </button>
          </div>
          <span
            className={clsx(
              isExpanded ? styles["expanded"] : "",
              styles["comment-read-more"]
            )}
          >
            {comment}
          </span>
        </div>
      );
    } else if (comment.split("").length <= 10 && comment.split("").length > 1) {
      formattedComment = <p className="paragraph_18">{comment}</p>;
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

  function getScoreValue(
    scores: ScoreData[] | ScoreData,
    key: "generalScore" | "percentage",
    indexOrGetScoreLabel?: number
  ): string | number {
    if (Array.isArray(scores)) {
      const index = indexOrGetScoreLabel as number;
      if (
        scores[index] &&
        typeof scores[index][key] === "number" &&
        scores[index][key] > 0
      ) {
        return scores[index][key];
      }
    } else if (scores && typeof scores[key] === "number" && scores[key] > 0) {
      return scores[key];
    }
    return "";
  }

  return (
    <div
      className={clsx(
        styles["table-container"],
        tableDropdown && styles["collapsed"]
      )}
      ref={tableContainerRef}
      style={{
        height: tableDropdown
          ? `${tableDropdownHeights.opened}rem`
          : `${tableDropdownHeights.closed}rem`,
      }}
    >
      <div
        className={clsx(styles["row"], styles["row-headline"])}
        onClick={() => setTableDropdown(!tableDropdown)}
      >
        <h2
          className={clsx(styles["table-title"], "headline_small bold")}
        >{`${chapterNumber}. ${title}`}</h2>
        <p className="paragraph_18">
          {getPercentageLabel(chapterScore, getScoreLabel)}
        </p>
        <p className={clsx(styles["score-points"], "paragraph_18")}>
          {getScoreValue(chapterScore, "generalScore") && (
            <>
              <strong>{getScoreValue(chapterScore, "generalScore")}</strong>
              {structure?.summary.table.columns[2]?.title}
            </>
          )}
          {getScoreValue(chapterScore, "percentage") && (
            <span className={styles["percentage-bubble"]}>
              {getScoreValue(chapterScore, "percentage")}%
            </span>
          )}
        </p>
        <div className={styles["table-dropdown-button"]}></div>
      </div>

      <div key={chapterNumber} className={styles["table"]}>
        {content.map((subChapter: SubChapter, subChapterIndex) => (
          <React.Fragment
            key={subChapter["sub-chapter-title"] ?? subChapterIndex}
          >
            <div
              className={clsx(
                styles["row"],
                styles["row-title"],
                "paragraph_18 "
              )}
            >
              <p>{`${chapterNumber}.${subChapterIndex + 1}.`}</p>
              <h3 className="paragraph_18 bold">{`${subChapter["sub-chapter-title"]}`}</h3>
              <p>
                {getPercentageLabel(
                  subChaptersScores,
                  subChapterIndex,
                  getScoreLabel
                )}
              </p>

              <p className={clsx(styles["score-points"], "paragraph_18")}>
                {getScoreValue(
                  subChaptersScores,
                  "generalScore",
                  subChapterIndex
                ) && (
                  <>
                    <strong>
                      {getScoreValue(
                        subChaptersScores,
                        "generalScore",
                        subChapterIndex
                      )}
                    </strong>
                    {structure?.summary.table.columns[2]?.title}
                  </>
                )}
                {getScoreValue(
                  subChaptersScores,
                  "percentage",
                  subChapterIndex
                ) && (
                  <span className={styles["percentage-bubble"]}>
                    {getScoreValue(
                      subChaptersScores,
                      "percentage",
                      subChapterIndex
                    )}
                    %
                  </span>
                )}
              </p>
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
                <div
                  key={principleIndex}
                  className={clsx(
                    styles["row"],
                    inputNumber === -1 && styles["skipped"],
                    inputNumber === undefined && styles["not-answered"]
                  )}
                >
                  <p
                    className={clsx(
                      styles["paragraph_18"],
                      styles["principle-number"]
                    )}
                  >{`${chapterNumber}.${subChapterIndex + 1}.${
                    principleIndex + 1
                  }.`}</p>
                  <h4
                    className={clsx(styles["principle-title"], "paragraph_18")}
                  >{`${principle["title"]}`}</h4>
                  <p className="paragraph_18">
                    {inputNumber !== undefined
                      ? structure?.questionnaire?.options?.[inputNumber - 1]
                      : ""}
                  </p>
                  <p className={styles["score-points"]}>{score}</p>
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
