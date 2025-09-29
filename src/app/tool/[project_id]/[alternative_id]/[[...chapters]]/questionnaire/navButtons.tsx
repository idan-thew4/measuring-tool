import styles from "./nav-buttons.module.scss";
import Link from "next/link";
import clsx from "clsx";
import { useStore } from "@/contexts/Store";
import { useEffect, useState } from "react";
import contentPlaceHolder from "../../../../../../../public/data/content-placeholder.json";

export function NavButtons({
  currentChapter,
  project_id,
  alternative_id,
}: {
  currentChapter: string[];
  project_id: string;
  alternative_id: string;
}) {
  const { structure, getCurrentChapter } = useStore();
  const [navButton, setNavButton] = useState<{
    previous: string;
    next: string;
  }>({
    previous: "",
    next: "",
  });

  useEffect(() => {
    if (!structure) return;

    const chapterIdx = structure.questionnaire.content.findIndex(
      (s) => s["chapter-slug"] === currentChapter[0]
    );

    const principleIdx = Number(currentChapter[1]) - 1;
    const subChoiceIdx = Number(currentChapter[2]) - 1;
    let chapter = structure.questionnaire.content[chapterIdx];

    if (
      !chapter ||
      !Array.isArray(chapter["chapter-content"]) ||
      chapter["chapter-content"].length === 0
    ) {
      chapter = contentPlaceHolder.questionnaire.content[chapterIdx];
    }

    if (!chapter) return;

    const subchapters = chapter["chapter-content"];
    const subchapter = subchapters[principleIdx];
    const choices = subchapter["principles"];

    let next = "";
    let previous = "";

    // Next
    if (subChoiceIdx < choices.length - 1) {
      next = `/tool/${project_id}/${alternative_id}/${
        chapter["chapter-slug"]
      }/${principleIdx + 1}/${subChoiceIdx + 2}`;
    } else if (principleIdx < subchapters.length - 1) {
      next = `/tool/${project_id}/${alternative_id}/${
        chapter["chapter-slug"]
      }/${principleIdx + 2}/1`;
    } else if (chapterIdx < structure.questionnaire.content.length - 1) {
      next = `/tool/${project_id}/${alternative_id}/${
        structure.questionnaire.content[chapterIdx + 1]["chapter-slug"]
      }/1/1`;
    }

    // Previous
    if (subChoiceIdx > 0) {
      previous = `/tool/${project_id}/${alternative_id}/${
        chapter["chapter-slug"]
      }/${principleIdx + 1}/${subChoiceIdx}`;
    } else if (principleIdx > 0) {
      const prevChoices = subchapters[principleIdx - 1]["principles"];
      previous = `/tool/${project_id}/${alternative_id}/${chapter["chapter-slug"]}/${principleIdx}/${prevChoices.length}`;
    } else if (chapterIdx > 0) {
      const prevChapter = structure.questionnaire.content[chapterIdx - 1];
      const prevSubchapters = prevChapter["chapter-content"];
      const lastSubchapter = prevSubchapters[prevSubchapters.length - 1];
      const lastChoice = lastSubchapter["principles"].length;
      previous = `/tool/${project_id}/${alternative_id}/${prevChapter["chapter-slug"]}/${prevSubchapters.length}/${lastChoice}`;
    }

    setNavButton({ previous, next });
  }, [getCurrentChapter, currentChapter, structure]);

  if (!navButton) return null;

  return (
    <div className={styles["nav-buttons"]}>
      {navButton.previous && (
        <Link
          href={navButton.previous}
          className={clsx(
            styles["nav-button"],
            styles["previous"],
            "basic-button outline with-icon"
          )}>
          {structure?.questionnaire.buttons?.[1]}
        </Link>
      )}
      {navButton.next && (
        <Link
          href={navButton.next}
          className={clsx(
            styles["nav-button"],
            styles["next"],
            "basic-button outline with-icon"
          )}>
          {structure?.questionnaire.buttons?.[2]}
        </Link>
      )}
    </div>
  );
}
