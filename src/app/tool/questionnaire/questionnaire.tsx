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
import { useEffect, useMemo, useState } from "react";
import { ProgressBar } from "../[[...params]]/progress-bar/progress-bar";

export function Questionnaire({
  structure,
  currentStep,
  children,
}: structureAndStepsProps & { children?: React.ReactNode }) {
  const { scoreObject } = useStore();
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
        completed: choice.choice,
        total: 1,
      });
    });

    setStepProgress(stepProgressTemp);
  }

  const getCurrentStep = useMemo(() => {
    return structure?.content.find(
      (step) => step["step-slug"] === currentStep[0]
    );
  }, [structure, currentStep]);

  useEffect(() => {
    if (getCurrentStep) {
      getChoicesProgress(scoreObject, getCurrentStep as Step, currentStep);
    }
  }, [scoreObject, getCurrentStep]);

  if (!structure) {
    return null;
  }

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
          }>
          <p className="paragraph_20">
            {`${getCurrentStep?.["step-number"]}. ${getCurrentStep?.["step-title"]}`}
          </p>
        </button>
        <p
          className={clsx(styles["description"], "paragraph_19")}
          style={{
            height: dropdownState.find(
              (item) => item.dropdown === "description-step-title"
            )?.state
              ? "auto"
              : "0",
          }}>
          {`${getCurrentStep?.["step-description"]}`}
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
          }>
          <h1 className="headline_medium-big bold">
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
          </h1>
          {/* <button
            className={clsx(
              styles["description-state"],
              dropdownState.find(
                (item) => item.dropdown === "description-step-subtitle"
              )?.state
                ? ""
                : styles["open"]
            )}
            onClick={() =>
              setDropdownState((prev) =>
                prev.map((item) =>
                  item.dropdown === "description-step-subtitle"
                    ? { ...item, state: !item.state }
                    : item
                )
              )
            }></button> */}
        </button>
        <p
          className={clsx(styles["description"], "paragraph_19")}
          style={{
            maxHeight: dropdownState.find(
              (item) => item.dropdown === "description-step-subtitle"
            )?.state
              ? "500rem"
              : "0",
          }}>
          {`${
            getCurrentStep?.["step-content"][Number(currentStep[1]) - 1][
              "sub-step-description"
            ]
          } `}
        </p>

        {stepProgress && <ProgressBar completed={stepProgress} />}
      </div>
      {children}
    </div>
  );
}
