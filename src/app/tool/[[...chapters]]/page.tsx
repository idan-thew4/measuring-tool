"use client";

import clsx from "clsx";
import { useStore, ScoreType, Chapter } from "../../../contexts/Store";
import styles from "./chapters.module.scss";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { set } from "react-hook-form";

type currentChapterType = {
  score: number;
  title: string;
  description: string;
  choices: { title: string; text: string }[];
};

// type ScoreChoice = { id: number; choice: number };

export default function ChapterPage() {
  const params = useParams();
  const [chapter, subChapter, principle] = params?.chapters || [];
  const {
    structure,
    scoreObject,
    getCurrentChapter,
    setScoreObject,
    registrationStatus,
    setRegistrationStatus,
  } = useStore();
  const [currentChapter, setCurrentChapter] =
    useState<currentChapterType | null>(null);
  const [toggle, setToggle] = useState(false);
  const [dropdownState, setDropdownState] = useState<
    {
      dropdown: number;
      state: boolean;
    }[]
  >([
    {
      dropdown: 1,
      state: false,
    },
    {
      dropdown: 2,
      state: false,
    },
    {
      dropdown: 3,
      state: false,
    },
    {
      dropdown: 4,
      state: false,
    },
    {
      dropdown: 5,
      state: false,
    },
  ]);
  const [comment, setComment] = useState("");

  const [animationClass, setAnimationClass] = useState("slide-in");

  useEffect(() => {
    if (scoreObject.data) {
      setCurrentChapter({
        score:
          scoreObject.data?.questionnaire?.[
            getCurrentChapter(chapter)?.["chapter-number"] ?? 1
              ? (getCurrentChapter(chapter)?.["chapter-number"] ?? 1) - 1
              : 0
          ]?.["chapter-data"]?.[Number(subChapter) - 1]?.["principles"]?.[
            Number(principle) - 1
          ]?.choice ?? 0,
        title:
          getCurrentChapter(chapter)?.["chapter-content"]?.[
            Number(subChapter) - 1
          ]?.["principles"]?.[Number(principle) - 1]?.title || "",
        description:
          getCurrentChapter(chapter)?.["chapter-content"]?.[
            Number(subChapter) - 1
          ]?.["principles"]?.[Number(principle) - 1]?.description || "",
        choices:
          getCurrentChapter(chapter)?.["chapter-content"]?.[
            Number(subChapter) - 1
          ]?.["principles"]?.[Number(principle) - 1]?.choices || [],
      });
    }

    setComment(
      scoreObject.data?.questionnaire?.[
        getCurrentChapter(chapter)?.["chapter-number"] ?? 1
          ? (getCurrentChapter(chapter)?.["chapter-number"] ?? 1) - 1
          : 0
      ]?.["chapter-data"]?.[Number(subChapter) - 1]?.["principles"]?.[
        Number(principle) - 1
      ]?.comment ?? ""
    );
  }, [subChapter, principle, scoreObject]);

  function updateScoreObject(
    prev: ScoreType,
    chapter: string,
    subChapter: string,
    principle: string,
    getCurrentChapter: (chapter: string) => Chapter | undefined,
    newScore?: number | null,
    comment?: string
  ) {
    const chapterIdx =
      getCurrentChapter(chapter)?.["chapter-number"] ?? 1
        ? (getCurrentChapter(chapter)?.["chapter-number"] ?? 1) - 1
        : 0;
    const subChapterIdx = Number(subChapter) - 1;
    const choiceIdx = Number(principle) - 1;
    let newData;

    newData = prev.data?.questionnaire.map((chapterData, sIdx) =>
      sIdx === chapterIdx
        ? {
            ...chapterData,
            "chapter-data": chapterData["chapter-data"].map(
              (subChapterData, ssIdx) =>
                ssIdx === subChapterIdx
                  ? {
                      ...subChapterData,
                      principles: subChapterData["principles"].map(
                        (choiceObj, cIdx) =>
                          cIdx === choiceIdx
                            ? newScore !== null
                              ? {
                                  ...choiceObj,
                                  choice: newScore,
                                }
                              : {
                                  ...choiceObj,
                                  comment: comment,
                                }
                            : choiceObj
                      ),
                    }
                  : subChapterData
            ),
          }
        : chapterData
    );

    return {
      ...prev,
      data: {
        ...prev.data,
        questionnaire: newData,
      },
    };
  }
  if (currentChapter === null) {
    return <div>Loading</div>;
  }

  return (
    <div className={styles["chapters-slider-container"]}>
      <div
        className={clsx(
          styles["chapter-box"],
          currentChapter.score === -1 && styles["skip"]
        )}
      >
        <div className={styles["chapter-headline-container"]}>
          <div className={styles["headline"]}>
            <h2 className="headline_small bold">{currentChapter.title}</h2>
            <div className={styles["toggle-container"]}>
              <p className="paragraph_17">
                {structure?.questionnaire.buttons?.[0]}
              </p>
              <button
                className={clsx(
                  styles["toggle"],
                  currentChapter.score === -1 || toggle ? styles["active"] : ""
                )}
                onClick={() => {
                  setToggle(!toggle);
                  setScoreObject((prev) =>
                    updateScoreObject(
                      prev,
                      chapter,
                      subChapter,
                      principle,
                      getCurrentChapter,
                      toggle ? undefined : -1
                    )
                  );
                }}
              ></button>
            </div>
          </div>
          <p className={clsx("paragraph_19", styles["description"])}>
            {currentChapter.description}
          </p>
        </div>
        <ul className={styles["chapter-options"]}>
          {structure?.questionnaire.options.map((option, index) => (
            <li
              key={option}
              className={clsx(
                styles["option"],
                currentChapter.score === index + 1 ? styles["selected"] : ""
              )}
            >
              <div className={clsx(styles["option-selection"], "paragraph_19")}>
                <input
                  type="radio"
                  id={`option-${index + 1}`}
                  value={option}
                  checked={currentChapter.score === index + 1}
                  onChange={() => {
                    if (scoreObject["personal-details"].contactEmail) {
                      setScoreObject((prev) =>
                        updateScoreObject(
                          prev,
                          chapter,
                          subChapter,
                          principle,
                          getCurrentChapter,
                          index + 1
                        )
                      );
                    } else {
                      setRegistrationStatus(true);
                    }
                  }}
                ></input>
                <label
                  className="paragraph_19 bold"
                  htmlFor={`option-${index + 1}`}
                >
                  {option}
                </label>

                {currentChapter.choices[index]?.title && (
                  <button
                    className={clsx(
                      dropdownState.find((item) => item.dropdown === index + 1)
                        ?.state
                        ? styles["open"]
                        : "",
                      "paragraph_19"
                    )}
                    onClick={() =>
                      setDropdownState((prev) =>
                        prev.map((item) =>
                          item.dropdown === index + 1
                            ? { ...item, state: !item.state }
                            : item
                        )
                      )
                    }
                  >
                    {currentChapter.choices[index]?.title && (
                      <>{currentChapter.choices[index].title}</>
                    )}
                  </button>
                )}

                <p
                  className={clsx("paragraph_19", styles["choice-text"])}
                  style={{
                    height: dropdownState.find(
                      (item) => item.dropdown === index + 1
                    )?.state
                      ? "auto"
                      : "0",
                    paddingTop: dropdownState.find(
                      (item) => item.dropdown === index + 1
                    )?.state
                      ? "1.5rem"
                      : "0",
                  }}
                >
                  {currentChapter.choices[index]?.text && (
                    <>{currentChapter.choices[index].text}</>
                  )}
                </p>
              </div>
            </li>
          ))}
        </ul>
        <textarea
          className="paragraph_16"
          value={comment}
          placeholder={structure?.questionnaire["text-area-placeholder"]}
          onChange={(e) => {
            setScoreObject((prev) =>
              updateScoreObject(
                prev,
                chapter,
                subChapter,
                principle,
                getCurrentChapter,
                null,
                e.target.value
              )
            );
            setComment(e.target.value);
          }}
        />
      </div>
    </div>
  );
}
