import styles from "./sideMenu.module.scss";
import Link from "next/link";
import clsx from "clsx";
import { ProgressBar } from "../progress-bar/progress-bar";
import {
  useStore,
  ScoreType,
  structureProps,
} from "../../../../contexts/Store";

export type structureAndChaptersProps = {
  structure: structureProps | undefined;
  currentChapter: string[];
};

// Check if all choices in a sub-chapter are completed
function isSubChapterCompleted(
  scoreObject: ScoreType,
  chapterIdx: number,
  subChapterIdx: number,
  numChoices: number
) {
  for (let i = 0; i < numChoices; i++) {
    if (!isChoiceCompleted(scoreObject, chapterIdx, subChapterIdx, i))
      return false;
  }
  return true;
}
//  Check if a choice is completed
function isChoiceCompleted(
  scoreObject: ScoreType,
  chapterIdx: number,
  subChapterIdx: number,
  choiceIdx: number
) {
  return (
    scoreObject?.data?.[chapterIdx]?.["chapter-data"]?.[subChapterIdx]?.[
      "principles"
    ]?.[choiceIdx]?.choice !== undefined
  );
}

//  Check if all chapter is completed§
function isChapterCompleted(completedChapters: number, totalChapters: number) {
  return completedChapters === totalChapters;
}

export function Menu({ structure, currentChapter }: structureAndChaptersProps) {
  const { completedChapters, scoreObject } = useStore();

  return (
    <div className={styles["menu"]}>
      <ProgressBar completed={completedChapters} structure={structure} />
      <ul className={styles["nav-side-menu"]}>
        {structure?.questionnaire.content.map((chapter, chapterIndex) => (
          <li
            className={clsx(
              styles["chapter"],
              chapter["chapter-slug"] === currentChapter[0]
                ? styles["active"]
                : "",

              isChapterCompleted(
                completedChapters[chapterIndex]?.completedChapters ?? 0,
                completedChapters[chapterIndex]?.totalChapters ?? 0
              )
                ? styles["completed"]
                : ""
            )}
            key={chapterIndex}>
            <div
              className={clsx(
                "nav-side-text__chapter",
                styles["chapter-text"]
              )}>
              <Link href={`/tool/${chapter["chapter-slug"]}/1/1`}>
                {`${chapterIndex + 1}. ${chapter["chapter-title"]}`}
              </Link>
              <p>{`${completedChapters[chapterIndex]?.completedChapters ?? 0}/${
                completedChapters[chapterIndex]?.totalChapters ?? 0
              }`}</p>
            </div>

            <ul className={styles["chapter-content"]}>
              {chapter["chapter-content"].map((subChapter, subIndex) => {
                const isActiveSubChapter =
                  chapter["chapter-slug"] === currentChapter[0] &&
                  subIndex + 1 === parseInt(currentChapter[1]);
                const subChapterCompleted = isSubChapterCompleted(
                  scoreObject,
                  chapterIndex,
                  subIndex,
                  subChapter["principles"].length
                );
                return (
                  <li
                    key={subIndex}
                    className={clsx(
                      isActiveSubChapter && styles["active"],
                      subChapterCompleted && styles["completed"]
                    )}>
                    <Link
                      className="nav-side-text__sub-chapter"
                      href={`/tool/${chapter["chapter-slug"]}/${
                        subIndex + 1
                      }/1`}>
                      {`${chapterIndex + 1}.${subIndex + 1} ${
                        subChapter["sub-chapter-title"]
                      }`}
                    </Link>
                    <ul className={styles["principles"]}>
                      {subChapter["principles"].map(
                        (subChoices, subChoicesIndex) => {
                          const isActiveChoice =
                            isActiveSubChapter &&
                            subChoicesIndex + 1 === parseInt(currentChapter[2]);
                          const choiceCompleted = isChoiceCompleted(
                            scoreObject,
                            chapterIndex,
                            subIndex,
                            subChoicesIndex
                          );
                          return (
                            <li
                              key={subChoicesIndex}
                              className={clsx(
                                isActiveChoice && styles["active"],
                                choiceCompleted && styles["completed"]
                              )}>
                              <Link
                                className="nav-side-text__sub-chapter-choice"
                                href={`/tool/${chapter["chapter-slug"]}/${
                                  subIndex + 1
                                }/${subChoicesIndex + 1}`}>
                                {`${subChoicesIndex + 1}. ${subChoices.title}`}
                              </Link>
                            </li>
                          );
                        }
                      )}
                    </ul>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ul>
      <ul className={styles["bottom-links"]}>
        {structure?.sidebar["bottom-options"].map((option, index) => (
          <li key={index}>
            <Link className="paragraph_18 bold" href={""}>
              {option}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
