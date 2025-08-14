import { SubChapter, useStore } from "@/contexts/Store";
import styles from "./table.module.scss";
import React, { JSX, useState } from "react";
import clsx from "clsx";

interface TableProps {
  chapterNumber: number;
  title: string;
  content: SubChapter[];
}

export function Table({ chapterNumber, title, content }: TableProps) {
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

  return (
    <div className={styles["table-container"]}>
      <h2
        className={clsx(
          styles["table-title"],
          "headline_small bold"
        )}>{`${chapterNumber}. ${title}`}</h2>

      <div
        className={clsx(styles["row"], "paragraph_15", styles["row-titles"])}>
        {structure?.summary?.table?.columns.map((column, index) => (
          <p key={index}>{column}</p>
        ))}
      </div>

      <div key={chapterNumber} className={styles["table"]}>
        {content.map((subChapter: SubChapter, subChapterIndex) => (
          <React.Fragment
            key={subChapter["sub-chapter-title"] ?? subChapterIndex}>
            <div
              className={clsx(
                styles["row"],
                styles["row-title"],
                "paragraph_15 bold"
              )}>
              <p>{`${chapterNumber}.${subChapterIndex + 1}.`}</p>
              <h3>{`${subChapter["sub-chapter-title"]}`}</h3>
            </div>
            {subChapter.principles.map((principle, principleIndex) => {
              const inputNumber =
                scoreObject.data?.[chapterNumber - 1]?.["chapter-data"]?.[
                  subChapterIndex
                ]?.["principles"]?.[principleIndex]?.choice;

              let score: number | undefined;

              if (inputNumber) {
                score =
                  structure?.questionnaire.content[chapterNumber - 1][
                    "chapter-content"
                  ][subChapterIndex]["principles"][principleIndex]["choices"][
                    inputNumber - 1
                  ]?.score;
              }

              if (!inputNumber) return null;

              return (
                <div key={principleIndex} className={styles["row"]}>
                  <p className="paragraph_15">{`${chapterNumber}.${
                    subChapterIndex + 1
                  }.${principleIndex + 1}.`}</p>
                  <h4 className="paragraph_15">{`${principle["title"]}`}</h4>
                  <p className="paragraph_15">
                    {structure?.questionnaire?.options?.[inputNumber]}
                  </p>
                  <p className="paragraph_15">{score}</p>
                  {getComment(
                    scoreObject.data?.[chapterNumber - 1]?.["chapter-data"]?.[
                      subChapterIndex
                    ]?.["principles"]?.[principleIndex]?.comment ?? "",
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
