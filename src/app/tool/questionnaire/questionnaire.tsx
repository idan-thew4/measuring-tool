import styles from "./questionnaire.module.scss";
import Link from "next/link";
import clsx from "clsx";
import {
  useStore,
  ScoreType,
  Step,
  totalCompleted,
} from "../../../contexts/Store";
import { structureAndStepsProps } from "../[[...params]]/page";
import { useEffect, useState } from "react";
import { ProgressBar } from "../[[...params]]/progress-bar/progress-bar";

export function Questionnaire({
  structure,
  currentStep,
}: structureAndStepsProps) {
  const { scoreObject } = useStore();
  const [stepProgress, setStepProgress] = useState<totalCompleted>();

  function getChoicesProgress(scoreObject: ScoreType, currentStep: Step) {
    let stepProgressTemp: totalCompleted = [];
    const choices =
      scoreObject?.["data"]?.[currentStep["step-number"] - 1]?.["step-data"];
    console.log("choices", choices);
    choices?.map((choice) => {
      const filledChoices = choice["sub-step-data"].filter(
        (choiceObj) => choiceObj.choice !== 0
      ).length;
      stepProgressTemp.push({
        completed: filledChoices,
        total: choices.length,
      });
    });

    setStepProgress(stepProgressTemp);
    console.log(stepProgressTemp);
  }

  const getCurrentStep = structure?.content.find(
    (step) => step["step-slug"] === currentStep[0]
  );

  useEffect(() => {
    if (getCurrentStep) {
      getChoicesProgress(scoreObject, getCurrentStep as Step);
    }
  }, [scoreObject, getCurrentStep]);

  if (!structure) {
    return null;
  }

  return (
    <div className={styles["questionnaire-container"]}>
      <div className={styles["questionnaire-header"]}>
        <p className={clsx("paragraph_20", styles["step-title"])}>
          {`${getCurrentStep?.["step-number"]}. ${getCurrentStep?.["step-title"]}`}
        </p>
        <h2
          className={clsx("headline_medium-big bold", styles["step-subtitle"])}>
          <span
            className={clsx(
              "number headline_medium-small bold",
              styles["number"]
            )}>
            {`${getCurrentStep?.["step-number"]}.${currentStep[1]}`}
          </span>
          {`${
            getCurrentStep?.["step-content"][Number(currentStep[1]) - 1][
              "sub-step-title"
            ]
          } `}
        </h2>
        {stepProgress && <ProgressBar completed={stepProgress} />}
      </div>
    </div>
  );
}
