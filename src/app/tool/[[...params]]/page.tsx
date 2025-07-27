"use client";

import clsx from "clsx";
import { structureProps, useStore } from "../../../contexts/Store";
import styles from "./steps.module.scss";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState, useRef } from "react";

type CurrentStepType = {
  score: number;
  title: string;
  choices: any[];
  comment: string;
};

export type structureAndStepsProps = {
  structure: structureProps | undefined;
  currentStep: string[];
};

export default function StepPage() {
  const params = useParams();
  const [step, subStep, subStepChoice] = params?.params || [];
  const { structure, scoreObject, getCurrentStep } = useStore();
  const [currentStep, setCurrentStep] = useState<CurrentStepType | null>(null);
  const [animationClass, setAnimationClass] = useState("slide-in");

  useEffect(() => {
    if (scoreObject.data) {
      setCurrentStep({
        score:
          scoreObject.data[getCurrentStep(step)?.["step-number"] - 1]?.[
            "step-data"
          ]?.[Number(subStep) - 1]?.["sub-step-data"]?.[
            Number(subStepChoice) - 1
          ]?.choice || 0,
        title:
          getCurrentStep(step)?.["step-content"]?.[Number(subStep) - 1]?.[
            "sub-steps"
          ]?.[Number(subStepChoice) - 1]?.title || "",
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

  if (currentStep === null) {
    return <div>Loading</div>;
  }
  return (
    <div className={styles["steps-slider-container"]}>
      <div className={clsx(styles["step-box"], styles[animationClass])}>
        <div className={styles["step-headline-container"]}>
          <h2 className={clsx("headline_small bold")}>{currentStep.title}</h2>
        </div>
      </div>
    </div>
  );
}
