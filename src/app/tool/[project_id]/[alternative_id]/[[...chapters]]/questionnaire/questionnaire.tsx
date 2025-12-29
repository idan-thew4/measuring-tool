import clsx from "clsx";
import {
  useStore,
  ScoreType,
  Chapter,
  totalCompleted,
} from "../../../../../../contexts/Store";
import { structureAndChaptersProps } from "../../components/side-menu/menu";
import { useEffect, useState } from "react";
import { ProgressBar } from "../../components/progress-bar/progress-bar";
import { NavButtons } from "./navButtons";
import styles from "./questionnaire.module.scss";

type currentChapterHeaders = {
  title: string;
  titleDescription: string;
  subtitle: string;
  subtitleNumber: string;
  subtitleDescription: string;
};

export function Questionnaire({
  currentChapter,
  children,
  project_id,
  alternative_id,
}: structureAndChaptersProps & {
  children?: React.ReactNode;
  project_id: number;
  alternative_id: number;
}) {
  const { scoreObject, getCurrentChapter } = useStore();
  const [chapterProgress, setChapterProgress] = useState<totalCompleted>();
  const [dropdownState, setDropdownState] = useState<
    {
      dropdown: string;
      state: boolean;
    }[]
  >([
    {
      dropdown: "description-chapter-title",
      state: false,
    },
    {
      dropdown: "description-chapter-subtitle",
      state: false,
    },
  ]);
  const [currentChapterHeaders, setCurrentChapterHeaders] =
    useState<currentChapterHeaders | null>(null);

  function getChoicesProgress(
    scoreObject: ScoreType,
    currentChapter: Chapter,
    currentSelection: string[]
  ) {
    let chapterProgressTemp: totalCompleted = [];

    const choices =
      scoreObject?.["data"]["questionnaire"]?.[
        currentChapter["chapter-number"] - 1
      ]?.["chapter-data"];

    const selectedChoice = choices?.[Number(currentSelection[1]) - 1];

    selectedChoice?.["principles"]?.forEach((choice) => {
      chapterProgressTemp.push({
        completed:
          choice.choice === -1 ? 1 : choice.choice === undefined ? 0 : 1,
        total: 1,
        ...(choice.choice === -1 ? { skipped: true } : {}),
      });
    });

    setChapterProgress(chapterProgressTemp);
  }

  useEffect(() => {
    const chapter = getCurrentChapter(currentChapter[0]);
    if (chapter) {
      getChoicesProgress(scoreObject, chapter, currentChapter);
      const chapterNumber = chapter["chapter-number"];
      const chapterTitle = chapter["chapter-title"];
      const chapterDescription = chapter["chapter-description"];
      const chapterContent = chapter["chapter-content"];
      const subChapterIndex = Number(currentChapter[1]) - 1;
      const subChapter = chapterContent?.[subChapterIndex];
      const subChapterTitle = subChapter?.["sub-chapter-title"];
      const subChapterDescription = subChapter?.["sub-chapter-description"];

      setCurrentChapterHeaders({
        title: `${chapterNumber}. ${chapterTitle}`,
        titleDescription: `${chapterDescription}`,
        subtitle: `${subChapterTitle}`,
        subtitleNumber: `${chapterNumber}.${currentChapter[1]}`,
        subtitleDescription: `${subChapterDescription}`,
      });
    }
  }, [scoreObject, getCurrentChapter, currentChapter]);

  return (
    <div className={clsx(styles["questionnaire-container"], "main-container")}>
      <div className={styles["questionnaire-header"]}>
        <button
          className={clsx(
            styles["chapter-title"],
            dropdownState.find(
              (item) => item.dropdown === "description-chapter-title"
            )?.state
              ? styles["open"]
              : ""
          )}
          onClick={() =>
            setDropdownState((prev) =>
              prev.map((item) =>
                item.dropdown === "description-chapter-title"
                  ? { ...item, state: !item.state }
                  : item
              )
            )
          }
        >
          <p className="paragraph_20">{currentChapterHeaders?.title}</p>
        </button>
        <p
          className={clsx(styles["description"], "paragraph_19")}
          style={{
            height: dropdownState.find(
              (item) => item.dropdown === "description-chapter-title"
            )?.state
              ? "auto"
              : "0",
          }}
        >
          {currentChapterHeaders?.titleDescription}
        </p>

        <button
          className={clsx(
            styles["chapter-subtitle"],
            dropdownState.find(
              (item) => item.dropdown === "description-chapter-subtitle"
            )?.state
              ? styles["open"]
              : ""
          )}
          onClick={() =>
            setDropdownState((prev) =>
              prev.map((item) =>
                item.dropdown === "description-chapter-subtitle"
                  ? { ...item, state: !item.state }
                  : item
              )
            )
          }
        >
          <h1 className="headline_small bold">
            <span
              className={clsx("number headline_small bold", styles["number"])}
            >
              {currentChapterHeaders?.subtitleNumber}
            </span>
            {`${
              getCurrentChapter(currentChapter[0])?.["chapter-content"][
                Number(currentChapter[1]) - 1
              ]["sub-chapter-title"]
            } `}
          </h1>
        </button>
        <p
          className={clsx(styles["description"], "paragraph_19")}
          style={{
            maxHeight: dropdownState.find(
              (item) => item.dropdown === "description-chapter-subtitle"
            )?.state
              ? "500rem"
              : "0",
            marginBottom: dropdownState.find(
              (item) => item.dropdown === "description-chapter-subtitle"
            )?.state
              ? "4rem"
              : "0",
          }}
        >
          {currentChapterHeaders?.subtitleDescription}
        </p>

        {chapterProgress && <ProgressBar completed={chapterProgress} />}
      </div>
      {children}
      <NavButtons
        currentChapter={currentChapter}
        project_id={project_id}
        alternative_id={alternative_id}
      />
    </div>
  );
}
