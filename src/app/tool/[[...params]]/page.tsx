"use client";

import clsx from "clsx";
import { structureProps, useStore, ScoreType } from "../../../contexts/Store";
import styles from "./steps.module.scss";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState, useRef } from "react";

type CurrentStepType = {
  score: number;
  title: string;
  description: string;
  choices: { title: string; text: string }[];
  comment: string;
};

type ScoreChoice = { id: number; choice: number };

export default function StepPage() {
  const params = useParams();
  const [step, subStep, subStepChoice] = params?.params || [];
  const { structure, scoreObject, getCurrentStep, setScoreObject } = useStore();
  const [currentStep, setCurrentStep] = useState<CurrentStepType | null>(null);
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

  const [animationClass, setAnimationClass] = useState("slide-in");

  useEffect(() => {
    if (scoreObject.data) {
      setCurrentStep({
        score:
          scoreObject.data?.[
            getCurrentStep(step)?.["step-number"] ?? 1
              ? (getCurrentStep(step)?.["step-number"] ?? 1) - 1
              : 0
          ]?.["step-data"]?.[Number(subStep) - 1]?.["sub-step-data"]?.[
            Number(subStepChoice) - 1
          ]?.choice ?? 0,
        title:
          getCurrentStep(step)?.["step-content"]?.[Number(subStep) - 1]?.[
            "sub-steps"
          ]?.[Number(subStepChoice) - 1]?.title || "",
        description:
          getCurrentStep(step)?.["step-content"]?.[Number(subStep) - 1]?.[
            "sub-steps"
          ]?.[Number(subStepChoice) - 1]?.description || "",
        choices:
          getCurrentStep(step)?.["step-content"]?.[Number(subStep) - 1]?.[
            "sub-steps"
          ]?.[Number(subStepChoice) - 1]?.choices || [],
        comment:
          getCurrentStep(step)?.["step-content"]?.[Number(subStep) - 1]?.[
            "sub-steps"
          ]?.[Number(subStepChoice) - 1]?.comment || "",
      });
    }
  }, [subStep, subStepChoice, scoreObject]);

  function updateScoreObject(
    prev: ScoreType,
    step: string,
    subStep: string,
    subStepChoice: string,
    getCurrentStep: (step: string) => any,
    newScore: number
  ) {
    const stepIdx =
      getCurrentStep(step)?.["step-number"] ?? 1
        ? (getCurrentStep(step)?.["step-number"] ?? 1) - 1
        : 0;
    const subStepIdx = Number(subStep) - 1;
    const choiceIdx = Number(subStepChoice) - 1;

    const newData = prev.data?.map((stepData, sIdx) =>
      sIdx === stepIdx
        ? {
            ...stepData,
            "step-data": stepData["step-data"].map((subStepData, ssIdx) =>
              ssIdx === subStepIdx
                ? {
                    ...subStepData,
                    "sub-step-data": subStepData["sub-step-data"].map(
                      (choiceObj, cIdx) =>
                        cIdx === choiceIdx
                          ? { ...choiceObj, choice: newScore }
                          : choiceObj
                    ),
                  }
                : subStepData
            ),
          }
        : stepData
    );

    return {
      ...prev,
      data: newData,
    };
  }
  if (currentStep === null) {
    return <div>Loading</div>;
  }

  return (
    <div className={styles["steps-slider-container"]}>
      <div
        className={clsx(
          styles["step-box"],
          currentStep.score === -1 && styles["skip"]
        )}>
        <div className={styles["step-headline-container"]}>
          <div className={styles["headline"]}>
            <h2 className="headline_small bold">{currentStep.title}</h2>
            <div className={styles["toggle-container"]}>
              <p className="paragraph_17">
                {structure?.questionnaire.buttons?.[0]}
              </p>
              <button
                className={clsx(
                  styles["toggle"],
                  currentStep.score === -1 || toggle ? styles["active"] : ""
                )}
                onClick={() => {
                  setToggle(!toggle);
                  setScoreObject((prev) =>
                    updateScoreObject(
                      prev,
                      step,
                      subStep,
                      subStepChoice,
                      getCurrentStep,
                      toggle ? 0 : -1
                    )
                  );
                }}></button>
            </div>
          </div>
          <p className={clsx("paragraph_19", styles["description"])}>
            {currentStep.description}
          </p>
        </div>
        <ul className={styles["step-options"]}>
          {structure?.questionnaire.options.map((option, index) => (
            <li
              key={option}
              className={clsx(
                styles["option"],
                currentStep.score === index + 1 ? styles["selected"] : ""
              )}>
              <div className={clsx(styles["option-selection"], "paragraph_19")}>
                <input
                  type="radio"
                  id={`option-${index + 1}`}
                  value={option}
                  checked={currentStep.score === index + 1}
                  onChange={() =>
                    setScoreObject((prev) =>
                      updateScoreObject(
                        prev,
                        step,
                        subStep,
                        subStepChoice,
                        getCurrentStep,
                        index + 1
                      )
                    )
                  }></input>
                <label
                  className="paragraph_19 bold"
                  htmlFor={`option-${index + 1}`}>
                  {option}
                </label>

                {currentStep.choices[index]?.title && (
                  <button
                    className={
                      dropdownState.find((item) => item.dropdown === index + 1)
                        ?.state
                        ? styles["open"]
                        : ""
                    }
                    onClick={() =>
                      setDropdownState((prev) =>
                        prev.map((item) =>
                          item.dropdown === index + 1
                            ? { ...item, state: !item.state }
                            : item
                        )
                      )
                    }>
                    {currentStep.choices[index]?.title && (
                      <>{currentStep.choices[index].title}</>
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
                  }}>
                  {currentStep.choices[index]?.text && (
                    <>{currentStep.choices[index].text}</>
                  )}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
