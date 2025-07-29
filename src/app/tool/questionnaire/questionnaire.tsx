import styles from "./questionnaire.module.scss";
import clsx from "clsx";
import {
  useStore,
  ScoreType,
  Step,
  totalCompleted,
} from "../../../contexts/Store";
import { structureAndStepsProps } from "../[[...params]]/page";
import { useEffect, useMemo, useState } from "react";
import { ProgressBar } from "../[[...params]]/progress-bar/progress-bar";
import { NavButtons } from "./navButtons";

type CurrentStepHeaders = {
  title: string;
  titleDescription: string;
  subtitle: string;
  subtitleNumber: string;
  subtitleDescription: string;
};

export function Questionnaire({
  currentStep,
  children,
}: structureAndStepsProps & { children?: React.ReactNode }) {
  const { scoreObject, getCurrentStep } = useStore();
  const [stepProgress, setStepProgress] = useState<totalCompleted>();
  const [dropdownState, setDropdownState] = useState<
    {
      dropdown: string;
      state: boolean;
    }[]
  >([
    {
      dropdown: "description-step-title",
      state: false,
    },
    {
      dropdown: "description-step-subtitle",
      state: false,
    },
  ]);
  const [currentStepHeaders, setCurrentStepHeaders] =
    useState<CurrentStepHeaders | null>(null);

  function getChoicesProgress(
    scoreObject: ScoreType,
    currentStep: Step,
    currentSelection: string[]
  ) {
    let stepProgressTemp: totalCompleted = [];

    const choices =
      scoreObject?.["data"]?.[currentStep["step-number"] - 1]?.["step-data"];

    const selectedChoice = choices?.[Number(currentSelection[1]) - 1];

    selectedChoice?.["sub-step-data"]?.forEach((choice) => {
      stepProgressTemp.push({
        completed: choice.choice === -1 ? 1 : choice.choice,
        total: 1,
      });
    });

    setStepProgress(stepProgressTemp);
  }

  useEffect(() => {
    const step = getCurrentStep(currentStep[0]);
    if (step) {
      getChoicesProgress(scoreObject, step, currentStep);
      const stepNumber = step["step-number"];
      const stepTitle = step["step-title"];
      const stepDescription = step["step-description"];
      const stepContent = step["step-content"];
      const subStepIndex = Number(currentStep[1]) - 1;
      const subStep = stepContent?.[subStepIndex];
      const subStepTitle = subStep?.["sub-step-title"];
      const subStepDescription = subStep?.["sub-step-description"];

      setCurrentStepHeaders({
        title: `${stepNumber}. ${stepTitle}`,
        titleDescription: `${stepDescription}`,
        subtitle: `${subStepTitle}`,
        subtitleNumber: `${stepNumber}.${currentStep[1]}`,
        subtitleDescription: `${subStepDescription}`,
      });
    }
  }, [scoreObject, getCurrentStep, currentStep]);

  return (
    <div className={styles["questionnaire-container"]}>
      <div className={styles["questionnaire-header"]}>
        <button
          className={clsx(
            styles["step-title"],
            dropdownState.find(
              (item) => item.dropdown === "description-step-title"
            )?.state
              ? styles["open"]
              : ""
          )}
          onClick={() =>
            setDropdownState((prev) =>
              prev.map((item) =>
                item.dropdown === "description-step-title"
                  ? { ...item, state: !item.state }
                  : item
              )
            )
          }
        >
          <p className="paragraph_20">{currentStepHeaders?.title}</p>
        </button>
        <p
          className={clsx(styles["description"], "paragraph_19")}
          style={{
            height: dropdownState.find(
              (item) => item.dropdown === "description-step-title"
            )?.state
              ? "auto"
              : "0",
          }}
        >
          {currentStepHeaders?.titleDescription}
        </p>

        <button
          className={clsx(
            styles["step-subtitle"],
            dropdownState.find(
              (item) => item.dropdown === "description-step-subtitle"
            )?.state
              ? styles["open"]
              : ""
          )}
          onClick={() =>
            setDropdownState((prev) =>
              prev.map((item) =>
                item.dropdown === "description-step-subtitle"
                  ? { ...item, state: !item.state }
                  : item
              )
            )
          }
        >
          <h1 className="headline_medium-big bold">
            <span
              className={clsx(
                "number headline_medium-small bold",
                styles["number"]
              )}
            >
              {currentStepHeaders?.subtitleNumber}
            </span>
            {`${
              getCurrentStep(currentStep[0])?.["step-content"][
                Number(currentStep[1]) - 1
              ]["sub-step-title"]
            } `}
          </h1>
        </button>
        <p
          className={clsx(styles["description"], "paragraph_19")}
          style={{
            maxHeight: dropdownState.find(
              (item) => item.dropdown === "description-step-subtitle"
            )?.state
              ? "500rem"
              : "0",
            marginBottom: dropdownState.find(
              (item) => item.dropdown === "description-step-subtitle"
            )?.state
              ? "4rem"
              : "0",
          }}
        >
          {currentStepHeaders?.subtitleDescription}
        </p>

        {stepProgress && <ProgressBar completed={stepProgress} />}
      </div>
      {children}
      <NavButtons currentStep={currentStep} />
    </div>
  );
}
