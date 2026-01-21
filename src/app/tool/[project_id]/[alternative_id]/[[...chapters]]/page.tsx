"use client";

import clsx from "clsx";
import {
  useStore,
  ScoreType,
  Chapter,
  ScoreVariations,
  ChapterPoints,
} from "../../../../../contexts/Store";
import styles from "./chapters.module.scss";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type currentChapterType = {
  score: number;
  title: string;
  description: string;
  choices: { title: string; text: string }[];
};

type storeAlternativeQuestionnaireDataResponse = {
  success: boolean;
  data: ScoreVariations;
};

// type ScoreChoice = { id: number; choice: number };

export default function ChapterPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const showSelfAssessment = searchParams.get("showSelfAssessment");
  const [chapter, subChapter, principle] = params?.chapters || [];
  const {
    structure,
    scoreObject,
    getCurrentChapter,
    setScoreObject,
    setLoginPopup,
    getContent,
    setIsTokenChecked,
    isTokenChecked,
    url,
    setLoggedInChecked,
    loggedInChecked,
    isMounted,
    getAlternativeQuestionnaireData,
    isPageChanged,
    setLoader,
    activeSideMenu,
    sliderIsAnimating,
    setSliderIsAnimating,
    setSelfAssessmentPopup,
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
  const router = useRouter();
  const [enterAnimation, setEnterAnimation] = useState("");

  useEffect(() => {
    if (showSelfAssessment === "1") {
      setSelfAssessmentPopup(true);
    }
  }, []);

  useEffect(() => {
    const pageChanged = Boolean(isPageChanged("questionnaire"));

    if (pageChanged) {
      if (
        (params.project_id === "0" || params.alternative_id === "0") &&
        !isTokenChecked
      ) {
        validateToken();
        setIsTokenChecked(true);
      } else if (
        (!loggedInChecked && params.project_id !== "0") ||
        params.alternative_id !== "0"
      ) {
        getAlternativeQuestionnaireData(
          params.project_id as string,
          params.alternative_id as string,
        );
      }
    }
  }, [structure]);

  async function validateToken() {
    try {
      const response = await fetch(`${url}/validate-token`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",

          // "authorization": `Bearer ${Cookies.get('authToken')}`,
        },
        credentials: "include",
      });

      const data = await response.json();
      setIsTokenChecked(true);

      if (data) {
        setLoginPopup(false);
        setLoader(false);

        getContent().then((structure) => {
          if (data.code === "missing_token") {
            router.push(`/tool/0/0/${chapter}/${subChapter}/${principle}`);
            setLoggedInChecked(false);
          }

          if (data.success) {
            router.push(`/tool/user-dashboard`);
            setLoggedInChecked(true);
          }
        });
      }
    } catch (error) {
      console.error("Failed to validate token:", error);
    }
  }

  useEffect(() => {
    if (scoreObject.data) {
      setCurrentChapter({
        score:
          scoreObject.data?.questionnaire?.[
            (getCurrentChapter(chapter)?.["chapter-number"] ?? 1)
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
        (getCurrentChapter(chapter)?.["chapter-number"] ?? 1)
          ? (getCurrentChapter(chapter)?.["chapter-number"] ?? 1) - 1
          : 0
      ]?.["chapter-data"]?.[Number(subChapter) - 1]?.["principles"]?.[
        Number(principle) - 1
      ]?.comment ?? "",
    );
  }, [subChapter, principle, scoreObject]);

  useEffect(() => {
    if (isMounted.current) {
      // Defer the side effect to avoid triggering state updates during rendering
      storeAlternativeQuestionnaireData(
        String(Date.now()),
        params.project_id as string,
        params.alternative_id as string,
        scoreObject.data.questionnaire,
      );

      isMounted.current = false;
    }
  }, [scoreObject]);

  function updateScoreObject(
    prev: ScoreType,
    chapter: string,
    subChapter: string,
    principle: string,
    getCurrentChapter: (chapter: string) => Chapter | undefined,
    newScore?: number | null,
    comment?: string,
  ) {
    const chapterIdx =
      (getCurrentChapter(chapter)?.["chapter-number"] ?? 1)
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
                            : choiceObj,
                      ),
                    }
                  : subChapterData,
            ),
          }
        : chapterData,
    );

    isMounted.current = true;

    return {
      ...prev,
      data: {
        ...prev.data,
        questionnaire: newData,
      },
    };
  }

  async function storeAlternativeQuestionnaireData(
    timestamp: string,
    project_id: string,
    alternative_id: string,
    questionnaire_data: ChapterPoints[],
  ): Promise<storeAlternativeQuestionnaireDataResponse | void> {
    try {
      const response = await fetch(
        `${url}/store-alternative-questionnaire-data`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            timestamp,
            project_id,
            alternative_id,
            questionnaire_data,
          }),
        },
      );

      const data = await response.json();
    } catch (error) {
      console.error("Error creating new user:", error);
    }
  }

  useEffect(() => {
    if (sliderIsAnimating === "previous") {
      setSliderIsAnimating(null);
      setEnterAnimation("previous");
    }

    if (sliderIsAnimating === "next") {
      setSliderIsAnimating(null);
      setEnterAnimation("next");
    }
  }, []);

  useEffect(() => {
    if (sliderIsAnimating === "next" || sliderIsAnimating === "previous") {
      setTimeout(() => {
        setEnterAnimation("");
      }, 1000);
    }
  }, [enterAnimation]);

  return (
    <div
      className={clsx(
        styles["chapters-slider-container"],
        activeSideMenu ? styles["chapters-slider-container--active"] : "",
      )}
    >
      <div
        className={clsx(
          styles["chapter-box"],
          currentChapter?.score === -1 && styles["skip"],
          sliderIsAnimating === "previous" && styles["chapter-box--previous"],
          sliderIsAnimating === "next" && styles["chapter-box--next"],
          enterAnimation === "previous" &&
            styles["chapter-box--previous-enter"],
          enterAnimation === "next" && styles["chapter-box--next-enter"],
        )}
      >
        <div className={styles["chapter-headline-container"]}>
          <div className={styles["headline"]}>
            <h2 className={clsx("headline_medium bold", styles["title"])}>
              {`${
                (getCurrentChapter(chapter)?.["chapter-number"] ?? 1)
                  ? (getCurrentChapter(chapter)?.["chapter-number"] ?? 1)
                  : 0
              }.${subChapter}.${principle}. `}
              {currentChapter?.title}
            </h2>
            <div className={"toggle-container"}>
              <p className="paragraph_17">
                {structure?.questionnaire.buttons?.[0]}
              </p>
              <button
                className={clsx(
                  "toggle",
                  currentChapter?.score === -1 || toggle ? "active" : "",
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
                      toggle ? undefined : -1,
                    ),
                  );
                }}
              ></button>
            </div>
          </div>
          <p className={clsx("paragraph_19", styles["description"])}>
            {currentChapter?.description}
          </p>
        </div>
        <ul className={styles["chapter-options"]}>
          {structure?.questionnaire.options.map((option, index) => {
            const chapterIdx =
              (getCurrentChapter(chapter)?.["chapter-number"] ?? 1)
                ? (getCurrentChapter(chapter)?.["chapter-number"] ?? 1) - 1
                : 0;
            const subChapterIdx = Number(subChapter) - 1;
            const choiceIdx = Number(principle) - 1;
            const score =
              structure?.questionnaire.content[chapterIdx]["chapter-content"][
                subChapterIdx
              ]["principles"][choiceIdx].choices[index].score;

            if (index !== 0 && score === 0) return null;

            return (
              <li
                key={`${option}-${index}`}
                className={clsx(
                  styles["option"],
                  currentChapter?.score === index + 1 ? styles["selected"] : "",
                )}
              >
                <div
                  className={clsx(styles["option-selection"], "paragraph_19")}
                >
                  <input
                    type="radio"
                    id={`option-${index + 1}`}
                    value={option}
                    checked={currentChapter?.score === index + 1}
                    onChange={() => {
                      if (loggedInChecked) {
                        setScoreObject((prev) =>
                          updateScoreObject(
                            prev,
                            chapter,
                            subChapter,
                            principle,
                            getCurrentChapter,
                            index + 1,
                          ),
                        );
                      } else {
                        setLoginPopup(true);
                      }
                    }}
                  ></input>
                  <label
                    className="paragraph_19 bold"
                    htmlFor={`option-${index + 1}`}
                  >
                    {option}
                  </label>

                  {currentChapter?.choices[index]?.title && (
                    <button
                      className={clsx(
                        dropdownState.find(
                          (item) => item.dropdown === index + 1,
                        )?.state
                          ? styles["open"]
                          : "",
                        "paragraph_19",
                      )}
                      onClick={() =>
                        setDropdownState((prev) =>
                          prev.map((item) =>
                            item.dropdown === index + 1
                              ? { ...item, state: !item.state }
                              : item,
                          ),
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
                        (item) => item.dropdown === index + 1,
                      )?.state
                        ? "auto"
                        : "0",
                      paddingTop: dropdownState.find(
                        (item) => item.dropdown === index + 1,
                      )?.state
                        ? "1.5rem"
                        : "0",
                    }}
                  >
                    {currentChapter?.choices[index]?.text && (
                      <>{currentChapter.choices[index].text}</>
                    )}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
        <textarea
          className="paragraph_19"
          value={comment}
          placeholder={structure?.questionnaire["text-area-placeholder"]}
          onChange={(e) => {
            setComment(e.target.value);
          }}
          onBlur={(e) => {
            setScoreObject((prev) =>
              updateScoreObject(
                prev,
                chapter,
                subChapter,
                principle,
                getCurrentChapter,
                null,
                e.target.value,
              ),
            );
          }}
        />
      </div>
    </div>
  );
}
