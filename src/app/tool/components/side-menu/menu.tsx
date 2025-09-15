import styles from "./sideMenu.module.scss";
import Link from "next/link";
import clsx from "clsx";
import { ProgressBar } from "../progress-bar/progress-bar";
import {
  useStore,
  ScoreType,
  structureProps,
  CalcParameters,
} from "../../../../contexts/Store";
import { useEffect, useState } from "react";

export type structureAndChaptersProps = {
  structure: structureProps | undefined;
  currentChapter: string[];
  selfAssessment?: boolean;
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
    scoreObject?.data?.questionnaire?.[chapterIdx]?.["chapter-data"]?.[
      subChapterIdx
    ]?.["principles"]?.[choiceIdx]?.choice !== undefined
  );
}

//  Check if all chapter is completed
function isChapterCompleted(completedChapters: number, totalChapters: number) {
  return completedChapters === totalChapters;
}

type RangeSliderProps = {
  id: string;
  name: string;
  min?: number;
  max: number;
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

function RangeSlider({ id, name, max, value, onChange }: RangeSliderProps) {
  const percent = (value / max) * 100;

  return (
    <input
      type="range"
      id={id}
      name={name}
      min={0}
      max={max}
      onChange={onChange}
      className={styles["range-slider"]}
    />
  );
}

export function Menu({
  structure,
  currentChapter,
  selfAssessment,
}: structureAndChaptersProps) {
  const { completedChapters, scoreObject, calculateScores, setScoreObject } =
    useStore();
  const [maxScores, setMaxScores] = useState<{
    chapters: number[];
    secondChapter: number[];
  }>({ chapters: [], secondChapter: [] });
  const [sliderValue, setSliderValue] = useState(0);
  const links = ["summary", "summary-report", "glossary"];

  useEffect(() => {
    if (selfAssessment) {
      // chapters //
      let questionnaireParams = [] as CalcParameters[];

      questionnaireParams = calculateScores(
        scoreObject.data.questionnaire ?? [],
        "chapters",
        "questionnaire",
        true
      );

      const maxScoresChapterTemp: number[] = [];

      questionnaireParams.map((chapter, index) => {
        const maxScore = Math.round(
          (chapter["max-score"] / chapter["net-zero-impact"]) * 100
        );

        maxScoresChapterTemp.push(maxScore);
      });

      // secondChapter //

      questionnaireParams = [];

      const maxScoresSecondChapterTemp: number[] = [];

      questionnaireParams = calculateScores(
        scoreObject.data.questionnaire ?? [],
        "subchapters",
        "questionnaire",
        true
      );

      const filteredQuestionnaireParams = questionnaireParams.filter(
        (chapter) => chapter["chapter"] === 1
      );

      filteredQuestionnaireParams.map((subChapter, index) => {
        const maxScore = Math.round(
          (subChapter["max-score"] / subChapter["net-zero-impact"]) * 100
        );

        maxScoresSecondChapterTemp.push(maxScore);
      });

      setMaxScores({
        chapters: maxScoresChapterTemp,
        secondChapter: maxScoresSecondChapterTemp,
      });
    }
  }, [selfAssessment]);

  const handleRangeChange = (
    value: string,
    chapterIndex: number,
    type: string,
    subChapterIndex?: number
  ) => {
    switch (type) {
      case "chapters":
        setScoreObject((prev) => {
          const updatedAssessment = [...(prev.data.assessment || [])];
          updatedAssessment[chapterIndex]["chapter-score"] = Number(value);
          return {
            ...prev,
            data: { ...prev.data, assessment: updatedAssessment },
          };
        });
        break;
      case "subchapters":
        setScoreObject((prev) => {
          const updatedAssessment = [...(prev.data.assessment || [])];
          if (
            typeof subChapterIndex === "number" &&
            updatedAssessment[chapterIndex]?.["sub-chapters"]?.[subChapterIndex]
          ) {
            updatedAssessment[chapterIndex]["sub-chapters"][subChapterIndex][
              "sub-chapter-score"
            ] = Number(value);
          }
          return {
            ...prev,
            data: { ...prev.data, assessment: updatedAssessment },
          };
        });
    }
  };

  return (
    <div
      className={clsx(
        styles["menu"],
        selfAssessment && styles["self-assessment"]
      )}>
      {!selfAssessment ? (
        <ProgressBar completed={completedChapters} structure={structure} />
      ) : (
        <div className={styles["self-assessment-header"]}>
          <h1 className={clsx("headline_medium-small bold", styles["title"])}>
            {structure?.["self-assessment"].headline}
          </h1>
          <p className="paragraph_15">
            {structure?.["self-assessment"]["sub-headline"]}
          </p>
        </div>
      )}
      <ul className={styles["nav-side-menu"]}>
        {structure?.questionnaire.content.map((chapter, chapterIndex) => (
          <li
            className={clsx(
              chapterIndex === 1 && selfAssessment && styles["active"],

              styles["chapter"],
              chapter["chapter-slug"] === currentChapter[0]
                ? styles["active"]
                : "",

              !selfAssessment &&
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
              {selfAssessment && chapterIndex !== 1 && selfAssessment && (
                <RangeSlider
                  id={chapter["chapter-title"]}
                  name="chapter"
                  value={sliderValue}
                  max={maxScores.chapters[chapterIndex] ?? 100}
                  onChange={(e) =>
                    handleRangeChange(e.target.value, chapterIndex, "chapters")
                  }
                />
              )}

              {!selfAssessment && (
                <p>{`${
                  completedChapters[chapterIndex]?.completedChapters ?? 0
                }/${completedChapters[chapterIndex]?.totalChapters ?? 0}`}</p>
              )}
            </div>

            {(!selfAssessment || (selfAssessment && chapterIndex === 1)) && (
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
                        chapterIndex === 1 &&
                          selfAssessment &&
                          styles["active"],
                        isActiveSubChapter && styles["active"],
                        !selfAssessment &&
                          subChapterCompleted &&
                          styles["completed"]
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
                      {selfAssessment && chapterIndex === 1 && (
                        <RangeSlider
                          id={chapter["chapter-title"]}
                          name="chapter"
                          value={sliderValue}
                          max={maxScores.chapters[chapterIndex] ?? 100}
                          onChange={(e) =>
                            handleRangeChange(
                              e.target.value,
                              chapterIndex,
                              "subchapters",
                              subIndex
                            )
                          }
                        />
                      )}
                      {!selfAssessment && (
                        <ul className={styles["principles"]}>
                          {subChapter["principles"].map(
                            (subChoices, subChoicesIndex) => {
                              const isActiveChoice =
                                isActiveSubChapter &&
                                subChoicesIndex + 1 ===
                                  parseInt(currentChapter[2]);
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
                                    {`${subChoicesIndex + 1}. ${
                                      subChoices.title
                                    }`}
                                  </Link>
                                </li>
                              );
                            }
                          )}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </li>
        ))}
      </ul>
      {!selfAssessment && (
        <ul className={styles["bottom-links"]}>
          {structure?.sidebar["bottom-options"].map((option, index) => (
            <li key={index}>
              <Link
                className="paragraph_18 bold"
                href={`/tool/${links[index]}`}>
                {option}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
