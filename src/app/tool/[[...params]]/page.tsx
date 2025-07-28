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

export type structureAndStepsProps = {
  structure: structureProps | undefined;
  currentStep: string[];
};

type ScoreChoice = { id: number; choice: number };
type SubStepData = {
  "sub-step-number": number;
  "sub-step-data": ScoreChoice[];
};

export default function StepPage() {
  const params = useParams();
  const [step, subStep, subStepChoice] = params?.params || [];
  const { structure, scoreObject, getCurrentStep, setScoreObject } = useStore();
  const [currentStep, setCurrentStep] = useState<CurrentStepType | null>(null);
  const [toggle, setToggle] = useState(false);

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
      <div className={clsx(styles["step-box"], styles[animationClass])}>
        <div className={styles["step-headline-container"]}>
          <div className={styles["headline"]}>
            <h2 className={clsx("headline_small bold")}>{currentStep.title}</h2>
            <div className={styles["toggle-container"]}>
              <p className="paragraph_17">דלג</p>
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
          <p className="paragraph_19">{currentStep.description}</p>
        </div>
        {structure?.options.map((option, index) => (
          <div key={option} className={styles["option"]}>
            {option}
            {currentStep.choices[index]?.title && (
              <> {currentStep.choices[index].title} </>
            )}
            {currentStep.choices[index]?.text && (
              <> {currentStep.choices[index].text} </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
