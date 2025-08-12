import { SubChapter, useStore } from "@/contexts/Store";
import styles from "./table.module.scss";
import React from "react";
import clsx from "clsx";

interface TableProps {
  chapterNumber: number;
  title: string;
  content: SubChapter[];
}

export function Table({ chapterNumber, title, content }: TableProps) {
  const { structure, scoreObject } = useStore();

  return (
    <>
      <h2
        className={clsx(styles["table-title"], "headline_small bold")}
      >{`${chapterNumber}. ${title}`}</h2>

      <div key={chapterNumber} className={styles["table-container"]}>
        {content.map((subChapter: SubChapter, subChapterIndex) => (
          <React.Fragment
            key={subChapter["sub-chapter-title"] ?? subChapterIndex}
          >
            <div
              className={clsx(
                styles["row"],
                styles["row-title"],
                "paragraph_15 bold"
              )}
            >
              <p>{`${chapterNumber}.${subChapterIndex + 1}.`}</p>
              <h3>{`${subChapter["sub-chapter-title"]}`}</h3>
            </div>
            {subChapter.principles.map((principle, principleIndex) => (
              <div key={principleIndex} className={styles["row"]}>
                <p className="paragraph_15">{`${chapterNumber}.${
                  subChapterIndex + 1
                }.${principleIndex + 1}.`}</p>
                <h4 className="paragraph_15">{`${principle["title"]}`}</h4>
                <p className="paragraph_15">
                  {scoreObject.data?.[chapterNumber - 1]?.["chapter-data"]?.[
                    subChapterIndex
                  ]?.["principles"]?.[principleIndex]?.choice ?? ""}
                </p>
                <p className="paragraph_15">
                  {structure?.questionnaire?.options?.[
                    scoreObject.data?.[chapterNumber - 1]?.["chapter-data"]?.[
                      subChapterIndex
                    ]?.["principles"]?.[principleIndex]?.choice ?? 0
                  ] ?? ""}
                </p>
                <p className="paragraph_15">
                  {scoreObject.data?.[chapterNumber - 1]?.["chapter-data"]?.[
                    subChapterIndex
                  ]?.["principles"]?.[principleIndex]?.comment ?? ""}
                </p>
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>
    </>
  );
}
