import styles from "./sideMenu.module.scss";
import Link from "next/link";
import clsx from "clsx";
import { ProgressBar } from "../progress-bar/progress-bar";
import {
  useStore,
  ScoreType,
  structureProps,
} from "../../../../contexts/Store";

export type structureAndStepsProps = {
  structure: structureProps | undefined;
  currentStep: string[];
};

// Check if all choices in a sub-step are completed
function isSubStepCompleted(
  scoreObject: ScoreType,
  stepIdx: number,
  subStepIdx: number,
  numChoices: number
) {
  for (let i = 0; i < numChoices; i++) {
    if (!isChoiceCompleted(scoreObject, stepIdx, subStepIdx, i)) return false;
  }
  return true;
}
//  Check if a choice is completed
function isChoiceCompleted(
  scoreObject: ScoreType,
  stepIdx: number,
  subStepIdx: number,
  choiceIdx: number
) {
  return (
    scoreObject?.data?.[stepIdx]?.["step-data"]?.[subStepIdx]?.[
      "sub-step-data"
    ]?.[choiceIdx]?.choice !== 0
  );
}

//  Check if all step is completed§
function isStepCompleted(completedSteps: number, totalSteps: number) {
  return completedSteps === totalSteps;
}

export function Menu({ structure, currentStep }: structureAndStepsProps) {
  const { completedSteps, scoreObject } = useStore();

  return (
    <div className={styles["menu"]}>
      <ProgressBar completed={completedSteps} structure={structure} />
      <ul className={styles["nav-side-menu"]}>
        {structure?.questionnaire.content.map((step, stepIndex) => (
          <li
            className={clsx(
              styles["step"],
              step["step-slug"] === currentStep[0] ? styles["active"] : "",

              isStepCompleted(
                completedSteps[stepIndex]?.completedSteps ?? 0,
                completedSteps[stepIndex]?.totalSteps ?? 0
              )
                ? styles["completed"]
                : ""
            )}
            key={stepIndex}>
            <div className={clsx("nav-side-text__step", styles["step-text"])}>
              <Link href={`/tool/${step["step-slug"]}/1/1`}>
                {`${stepIndex + 1}. ${step["step-title"]}`}
              </Link>
              <p>{`${completedSteps[stepIndex]?.completedSteps ?? 0}/${
                completedSteps[stepIndex]?.totalSteps ?? 0
              }`}</p>
            </div>

            <ul className={styles["step-content"]}>
              {step["step-content"].map((subStep, subIndex) => {
                const isActiveSubStep =
                  step["step-slug"] === currentStep[0] &&
                  subIndex + 1 === parseInt(currentStep[1]);
                const subStepCompleted = isSubStepCompleted(
                  scoreObject,
                  stepIndex,
                  subIndex,
                  subStep["sub-steps"].length
                );
                return (
                  <li
                    key={subIndex}
                    className={clsx(
                      isActiveSubStep && styles["active"],
                      subStepCompleted && styles["completed"]
                    )}>
                    <Link
                      className="nav-side-text__sub-step"
                      href={`/tool/${step["step-slug"]}/${subIndex + 1}/1`}>
                      {`${stepIndex + 1}.${subIndex + 1} ${
                        subStep["sub-step-title"]
                      }`}
                    </Link>
                    <ul className={styles["sub-steps"]}>
                      {subStep["sub-steps"].map(
                        (subChoices, subChoicesIndex) => {
                          const isActiveChoice =
                            isActiveSubStep &&
                            subChoicesIndex + 1 === parseInt(currentStep[2]);
                          const choiceCompleted = isChoiceCompleted(
                            scoreObject,
                            stepIndex,
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
                                className="nav-side-text__sub-step-choice"
                                href={`/tool/${step["step-slug"]}/${
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
