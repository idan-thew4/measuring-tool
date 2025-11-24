import styles from "./sideMenu.module.scss";
import Link from "next/link";
import clsx from "clsx";
import { ProgressBar } from "../progress-bar/progress-bar";
import {
  useStore,
  ScoreType,
  structureProps,
  CalcParameters,
} from "../../../../../../contexts/Store";
import { useEffect, useState } from "react";
import { Loader } from "@/components/loader/loader";

export type structureAndChaptersProps = {
  structure: structureProps | undefined;
  currentChapter: string[];
  project_id: number;
  alternative_id: number;
  type?: string;
};

// Check if all choices in a sub-chapter are completed
function isSubChapterCompleted(
  scoreObject: ScoreType,
  chapterIdx: number,
  subChapterIdx: number,
  numChoices: number
) {
  let allCompleted = true;
  let allSkipped = true;

  for (let i = 0; i < numChoices; i++) {
    const result = isChoiceCompleted(scoreObject, chapterIdx, subChapterIdx, i);
    if (result !== "completed") {
      allCompleted = false;
    }
    if (result !== "skipped") {
      allSkipped = false;
    }
  }

  if (allCompleted) return "completed";
  if (allSkipped) return "skipped";
  // Otherwise, return nothing (undefined)
}

//  Check if a choice is completed
function isChoiceCompleted(
  scoreObject: ScoreType,
  chapterIdx: number,
  subChapterIdx: number,
  choiceIdx: number
) {
  if (
    scoreObject?.data?.questionnaire?.[chapterIdx]?.["chapter-data"]?.[
      subChapterIdx
    ]?.["principles"]?.[choiceIdx]?.choice !== undefined &&
    scoreObject?.data?.questionnaire?.[chapterIdx]?.["chapter-data"]?.[
      subChapterIdx
    ]?.["principles"]?.[choiceIdx]?.choice !== -1
  ) {
    return "completed";
  }
  if (
    scoreObject?.data?.questionnaire?.[chapterIdx]?.["chapter-data"]?.[
      subChapterIdx
    ]?.["principles"]?.[choiceIdx]?.choice === -1
  ) {
    return "skipped";
  }
}

//  Check if all chapter is completed
function isChapterCompleted(
  totalChapters: number,
  completedChapters: number,
  skippedChapters: number
) {
  if (completedChapters === totalChapters) {
    return "completed";
  }

  if (skippedChapters === totalChapters) {
    return "skipped";
  }
}

type RangeSliderProps = {
  id: string;
  name: string;
  min?: number;
  max: number;
  value: number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onMouseUp: (e: React.MouseEvent<HTMLInputElement>) => void;
};

function RangeSlider({
  id,
  name,
  max,
  value,
  onChange,
  onMouseUp,
}: RangeSliderProps) {
  const percent = max > 0 ? (value / max) * 100 : 0;

  return (
    <div className={styles["range-slider-container"]}>
      <input
        type="range"
        id={id}
        name={name}
        min={0}
        max={max}
        value={value ?? 0}
        onMouseUp={onMouseUp}
        onChange={onChange}
        className={styles["range-slider"]}
      />
      <div
        className={styles["range-slider-progress"]}
        style={{ width: `${percent}%` }}></div>
      <div
        className={styles["range-slider-value"]}
        style={{
          right: `${
            percent > 95 && percent > 0
              ? "89%"
              : percent < 6
              ? "2%"
              : `calc(${percent}% - ${percent > 99 ? "4.5" : "1.5"}rem)`
          }`,
        }}>
        {value}%
      </div>
    </div>
  );
}

export function Menu({
  structure,
  currentChapter,
  project_id,
  alternative_id,
  type,
}: structureAndChaptersProps) {
  const {
    completedChapters,
    scoreObject,
    calculateScores,
    setScoreObject,
    isMounted,
  } = useStore();
  const [maxScore, setMaxScore] = useState<number>();
  const [sliderValue, setSliderValue] = useState<{
    chapter: number[];
    subChapter: number[];
  }>({
    chapter: [],
    subChapter: [],
  });
  const links = ["summary", "summary-report", "glossary"];
  const [toggleList, setToggleSetToggleList] = useState<
    { chapterIdx: number; state: boolean }[]
  >([]);
  const [activeChapters, setActiveChapters] = useState<string[]>([]);
  const [activeSubChapters, setActiveSubChapters] = useState<string[]>([]);
  const [activePrinciples, setActivePrinciples] = useState<string[]>([]);

  useEffect(() => {
    // Chapter: use the slug as the unique key
    if (currentChapter[0] && !activeChapters.includes(currentChapter[0])) {
      setActiveChapters((prev) => [...prev, currentChapter[0]]);
    }
    // Sub-chapter: use a unique key, e.g., `${chapterSlug}-${subIndex+1}`
    if (
      currentChapter[0] &&
      currentChapter[1] &&
      !activeSubChapters.includes(`${currentChapter[0]}-${currentChapter[1]}`)
    ) {
      setActiveSubChapters((prev) => [
        ...prev,
        `${currentChapter[0]}-${currentChapter[1]}`,
      ]);
    }
    // Principle: use a unique key, e.g., `${chapterSlug}-${subIndex+1}-${choiceIndex+1}`
    if (
      currentChapter[0] &&
      currentChapter[1] &&
      currentChapter[2] &&
      !activePrinciples.includes(
        `${currentChapter[0]}-${currentChapter[1]}-${currentChapter[2]}`
      )
    ) {
      setActivePrinciples((prev) => [
        ...prev,
        `${currentChapter[0]}-${currentChapter[1]}-${currentChapter[2]}`,
      ]);
    }
  }, [currentChapter]);

  useEffect(() => {
    let tempToggleList: { chapterIdx: number; state: boolean }[] = [];

    scoreObject.data.questionnaire.forEach((chapter) => {
      const allSkipped = chapter["chapter-data"].every((subChapter) =>
        subChapter.principles.every((choiceObj) => choiceObj.choice === -1)
      );
      tempToggleList.push({
        chapterIdx: chapter["chapter-number"] - 1,
        state: allSkipped,
      });
    });

    setToggleSetToggleList(tempToggleList);
  }, [scoreObject]);

  useEffect(() => {
    if (type === "self-assessment") {
      //Slider value;

      const TempChapterScoreValue = scoreObject.data.assessment.map(
        (chapter) => chapter["chapter-score"] || 0
      );

      const TempSubChapterScoreValue =
        scoreObject.data.assessment[1]?.["sub-chapters"]?.map(
          (subChapter) => subChapter["sub-chapter-score"] || 0
        ) || [];

      setSliderValue({
        chapter: TempChapterScoreValue,
        subChapter: TempSubChapterScoreValue,
      });

      const maxScores: number[] = [];
      const maxZeroImpactValue: number[] = [];

      structure?.questionnaire.content.forEach((chapter, index) => {
        let maxValue = 0;
        let zeroImpactValue = 0;
        chapter?.["chapter-content"]?.forEach((subChapter) => {
          subChapter?.principles?.forEach((principle) => {
            maxValue += principle.choices[4].score;
            zeroImpactValue += principle.choices[3].score;
          });
        });
        maxScores.push(maxValue);
        maxZeroImpactValue.push(zeroImpactValue);
      });

      const avgMaxScore =
        maxScores.reduce((sum, value) => sum + value, 0) / maxScores.length;

      const avgZeroImpactScore =
        maxZeroImpactValue.reduce((sum, value) => sum + value, 0) /
        maxZeroImpactValue.length;

      setMaxScore(Math.round((avgMaxScore / avgZeroImpactScore) * 100));
    }
  }, [type]);

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

  // Skip all Chapter //
  function skipAllChapter(
    scoreObject: ScoreType,
    chapterIdx: number,
    setScoreObject: (update: (prev: ScoreType) => ScoreType) => void,
    active: boolean
  ) {
    const choiceSelection = active === false ? -1 : undefined;
    setScoreObject((prev) => {
      const updatedQuestionnaire = prev.data.questionnaire.map(
        (chapter, idx) => {
          if (idx === chapterIdx) {
            return {
              ...chapter,
              "chapter-data": chapter["chapter-data"].map((subChapter) => ({
                ...subChapter,
                principles: subChapter.principles.map((choiceObj) => ({
                  ...choiceObj,
                  choice: choiceSelection,
                })),
              })),
            };
          }
          return chapter;
        }
      );

      isMounted.current = true;
      return {
        ...prev,
        data: {
          ...prev.data,
          questionnaire: updatedQuestionnaire,
        },
      };
    });
  }

  return (
    <div
      className={clsx(
        styles["menu"],
        type === "self-assessment" && styles["self-assessment"]
      )}>
      {type !== "self-assessment" ? (
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
              chapterIndex === 1 &&
                type === "self-assessment" &&
                styles["opened"],
              styles["chapter"],
              activeChapters.includes(chapter["chapter-slug"])
                ? styles["opened"]
                : "",
              chapter["chapter-slug"] === currentChapter[0] && styles["active"],
              type !== "self-assessment" &&
                styles[
                  isChapterCompleted(
                    completedChapters[chapterIndex]?.totalChapters ?? 0,
                    completedChapters[chapterIndex]?.completedChapters ?? 0,
                    completedChapters[chapterIndex]?.skippedChapters ?? 0
                  ) || ""
                ]
            )}
            key={chapterIndex}>
            <div
              className={clsx(
                "nav-side-text__chapter",
                styles["chapter-text"]
              )}>
              <Link
                href={`/tool/${project_id}/${alternative_id}/${chapter["chapter-slug"]}/1/1`}>
                {`${chapterIndex + 1}. ${chapter["chapter-title"]}`}
              </Link>
              {type === "self-assessment" && chapterIndex !== 1 && (
                <RangeSlider
                  id={chapter["chapter-title"]}
                  name="chapter"
                  value={sliderValue.chapter[chapterIndex]}
                  max={maxScore ? maxScore : 0}
                  onChange={(e) =>
                    setSliderValue((prev) => {
                      const updatedChapter = prev.chapter.slice();
                      updatedChapter[chapterIndex] = Number(
                        (e.target as HTMLInputElement).value
                      );
                      return {
                        ...prev,
                        chapter: updatedChapter,
                      };
                    })
                  }
                  onMouseUp={(e) =>
                    handleRangeChange(
                      (e.target as HTMLInputElement).value,
                      chapterIndex,
                      "chapters"
                    )
                  }
                />
              )}

              {type !== "self-assessment" && (
                <div className={styles["chapter-progress"]}>
                  <div className={"toggle-container"}>
                    <button
                      className={clsx(
                        "toggle",
                        isChapterCompleted(
                          completedChapters[chapterIndex]?.totalChapters ?? 0,
                          completedChapters[chapterIndex]?.completedChapters ??
                            0,
                          completedChapters[chapterIndex]?.skippedChapters ?? 0
                        ) === "completed" || toggleList[chapterIndex]?.state
                          ? "active"
                          : ""
                      )}
                      onClick={() => {
                        skipAllChapter(
                          scoreObject,
                          chapterIndex,
                          setScoreObject,
                          toggleList[chapterIndex]?.state
                        );
                        setToggleSetToggleList((prev) =>
                          prev.map((item) =>
                            item.chapterIdx === chapterIndex
                              ? { ...item, state: !item.state }
                              : item
                          )
                        );
                      }}></button>
                  </div>
                  <p>
                    {`${
                      completedChapters[chapterIndex]?.completedChapters ?? 0
                    }/${completedChapters[chapterIndex]?.totalChapters ?? 0}`}
                  </p>
                </div>
              )}
            </div>

            {(type !== "self-assessment" ||
              (type === "self-assessment" && chapterIndex === 1)) && (
              <ul className={styles["chapter-content"]}>
                {chapter["chapter-content"].map((subChapter, subIndex) => {
                  const subChapterKey = `${chapter["chapter-slug"]}-${
                    subIndex + 1
                  }`;

                  const isActiveSubChapter =
                    chapter["chapter-slug"] === currentChapter[0] &&
                    subIndex + 1 === parseInt(currentChapter[1]);
                  const isPersistentlyActiveSubChapter =
                    isActiveSubChapter ||
                    activeSubChapters.includes(subChapterKey);
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
                          type === "self-assessment" &&
                          styles["opened"],
                        isPersistentlyActiveSubChapter && styles["opened"],
                        isActiveSubChapter && styles["active"],
                        type !== "self-assessment" &&
                          styles[subChapterCompleted || ""]
                      )}>
                      <Link
                        className="nav-side-text__sub-chapter"
                        href={`/tool/${project_id}/${alternative_id}/${
                          chapter["chapter-slug"]
                        }/${subIndex + 1}/1`}>
                        {`${chapterIndex + 1}.${subIndex + 1} ${
                          subChapter["sub-chapter-title"]
                        }`}
                      </Link>
                      {type === "self-assessment" && chapterIndex === 1 && (
                        <RangeSlider
                          id={chapter["chapter-title"]}
                          name="chapter"
                          value={sliderValue.subChapter[subIndex]}
                          max={maxScore ? maxScore : 0}
                          onChange={(e) =>
                            setSliderValue((prev) => {
                              const updatedSubChapter = prev.subChapter.slice();
                              updatedSubChapter[subIndex] = Number(
                                (e.target as HTMLInputElement).value
                              );
                              return {
                                ...prev,
                                subChapter: updatedSubChapter,
                              };
                            })
                          }
                          onMouseUp={(e) => {
                            handleRangeChange(
                              (e.target as HTMLInputElement).value,
                              chapterIndex,
                              "subchapters",
                              subIndex
                            );
                          }}
                        />
                      )}
                      {type !== "self-assessment" && (
                        <ul className={styles["principles"]}>
                          {subChapter["principles"].map(
                            (subChoices, subChoicesIndex) => {
                              const principleKey = `${
                                chapter["chapter-slug"]
                              }-${subIndex + 1}-${subChoicesIndex + 1}`;
                              const isActiveChoice =
                                isActiveSubChapter &&
                                subChoicesIndex + 1 ===
                                  parseInt(currentChapter[2]);
                              const isPersistentlyActiveChoice =
                                isActiveChoice ||
                                activePrinciples.includes(principleKey);
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
                                    isPersistentlyActiveChoice &&
                                      styles["opened"],
                                    isActiveChoice && styles["active"],
                                    styles[choiceCompleted || ""]
                                  )}>
                                  <Link
                                    className="nav-side-text__sub-chapter-choice"
                                    href={`/tool/${project_id}/${alternative_id}/${
                                      chapter["chapter-slug"]
                                    }/${subIndex + 1}/${subChoicesIndex + 1}`}>
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

      {type !== "self-assessment" && (
        <ul className={styles["bottom-links"]}>
          {structure?.sidebar["bottom-options"].map((option, index) => {
            {
              /* TODO: Remove this condition when going live */
            }

            if (index < 2) {
              return (
                <li key={index}>
                  <Link
                    className="paragraph_18 bold"
                    href={`/tool/${project_id}/${alternative_id}/${links[index]}`}>
                    {option}
                  </Link>
                </li>
              );
            }
          })}
        </ul>
      )}
    </div>
  );
}
