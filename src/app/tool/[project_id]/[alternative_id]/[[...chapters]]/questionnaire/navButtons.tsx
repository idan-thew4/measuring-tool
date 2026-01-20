import styles from "./nav-buttons.module.scss";
import Link from "next/link";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { useStore } from "@/contexts/Store";
import { useEffect, useState } from "react";

export function NavButtons({
  currentChapter,
  project_id,
  alternative_id,
}: {
  currentChapter: string[];
  project_id: number;
  alternative_id: number;
}) {
  const {
    structure,
    getCurrentChapter,
    sliderIsAnimating,
    setSliderIsAnimating,
  } = useStore();
  const [navButton, setNavButton] = useState<{
    previous: string;
    next: string;
  }>({
    previous: "",
    next: "",
  });
  const router = useRouter();

  useEffect(() => {
    if (!structure) return;

    const chapterIdx = structure.questionnaire.content.findIndex(
      (s) => s["chapter-slug"] === currentChapter[0],
    );

    const principleIdx = Number(currentChapter[1]) - 1;
    const subChoiceIdx = Number(currentChapter[2]) - 1;
    let chapter = structure.questionnaire.content[chapterIdx];

    if (
      !chapter ||
      !Array.isArray(chapter["chapter-content"]) ||
      chapter["chapter-content"].length === 0
    ) {
      chapter = structure.questionnaire.content[chapterIdx];
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

  // Slide-out, then navigate, then slide-in (handled on new page)
  const handleClick = (direction: string) => {
    setSliderIsAnimating(direction); // triggers slide-out animation
    setTimeout(() => {
      // After animation, navigate to the next/previous page
      if (direction === "previous") {
        router.push(navButton.previous);
      } else if (direction === "next") {
        router.push(navButton.next);
      }
    }, 1000); // Match this to your slide-out animation duration (ms)
  };

  return (
    <div className={styles["nav-buttons"]}>
      {navButton.previous && (
        <button
          type="button"
          onClick={() => handleClick("previous")}
          className={clsx(
            styles["nav-button"],
            styles["previous"],
            "basic-button outline with-icon",
            sliderIsAnimating && styles["animating"],
          )}
        >
          {structure?.questionnaire.buttons?.[1]}
        </button>
      )}
      {navButton.next ? (
        <button
          type="button"
          onClick={() => handleClick("next")}
          className={clsx(
            styles["nav-button"],
            styles["next"],
            "basic-button outline with-icon",
            sliderIsAnimating && styles["animating"],
          )}
        >
          {structure?.questionnaire.buttons?.[2]}
        </button>
      ) : (
        <Link
          href={`/tool/${project_id}/${alternative_id}/summary`}
          className={clsx(styles["nav-button"], "basic-button outline")}
        >
          סיכום
        </Link>
      )}
    </div>
  );
}
