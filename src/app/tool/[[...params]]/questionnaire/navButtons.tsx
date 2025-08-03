import styles from "./nav-buttons.module.scss";
import Link from "next/link";
import clsx from "clsx";
import { useStore } from "@/contexts/Store";
import { use, useEffect, useState } from "react";

export function NavButtons({ currentStep }: { currentStep: string[] }) {
  const { structure, getCurrentStep } = useStore();
  const [navButton, setNavButton] = useState<{
    previous: string;
    next: string;
  }>({
    previous: "",
    next: "",
  });

  useEffect(() => {
    if (!structure) return;
    const stepIdx = structure.questionnaire.content.findIndex(
      (s) => s["step-slug"] === currentStep[0]
    );
    const subStepIdx = Number(currentStep[1]) - 1;
    const subChoiceIdx = Number(currentStep[2]) - 1;
    const step = structure.questionnaire.content[stepIdx];
    const subSteps = step["step-content"];
    const subStep = subSteps[subStepIdx];
    const choices = subStep["sub-steps"];

    let next = "";
    let previous = "";

    // Next
    if (subChoiceIdx < choices.length - 1) {
      next = `/tool/${step["step-slug"]}/${subStepIdx + 1}/${subChoiceIdx + 2}`;
    } else if (subStepIdx < subSteps.length - 1) {
      next = `/tool/${step["step-slug"]}/${subStepIdx + 2}/1`;
    } else if (stepIdx < structure.questionnaire.content.length - 1) {
      next = `/tool/${
        structure.questionnaire.content[stepIdx + 1]["step-slug"]
      }/1/1`;
    }

    // Previous
    if (subChoiceIdx > 0) {
      previous = `/tool/${step["step-slug"]}/${subStepIdx + 1}/${subChoiceIdx}`;
    } else if (subStepIdx > 0) {
      const prevChoices = subSteps[subStepIdx - 1]["sub-steps"];
      previous = `/tool/${step["step-slug"]}/${subStepIdx}/${prevChoices.length}`;
    } else if (stepIdx > 0) {
      const prevStep = structure.questionnaire.content[stepIdx - 1];
      const prevSubSteps = prevStep["step-content"];
      const lastSubStep = prevSubSteps[prevSubSteps.length - 1];
      const lastChoice = lastSubStep["sub-steps"].length;
      previous = `/tool/${prevStep["step-slug"]}/${prevSubSteps.length}/${lastChoice}`;
    }

    setNavButton({ previous, next });
  }, [getCurrentStep, currentStep, structure]);

  if (!navButton) return null;

  return (
    <div className={styles["nav-buttons"]}>
      {navButton.previous && (
        <Link
          href={navButton.previous}
          className={clsx(styles["nav-button"], styles["previous"])}>
          {structure?.questionnaire.buttons?.[1]}
        </Link>
      )}
      {navButton.next && (
        <Link
          href={navButton.next}
          className={clsx(styles["nav-button"], styles["next"])}>
          {structure?.questionnaire.buttons?.[2]}
        </Link>
      )}
    </div>
  );
}
