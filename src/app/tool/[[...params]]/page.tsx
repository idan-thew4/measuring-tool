"use client";

import clsx from "clsx";
import { structureProps, useStore } from "../../../contexts/Store";
import styles from "./steps.module.scss";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState, useRef } from "react";

export type structureAndStepsProps = {
  structure: structureProps | undefined;
  currentStep: string[];
};

export default function StepPage() {
  const params = useParams();
  const [step, subStep, subStepChoice] = params?.params || [];
  const { structure, scoreObject } = useStore();
  const [animationClass, setAnimationClass] = useState("slide-in");

  const getCurrentStep = useMemo(() => {
    return structure?.content.find(
      (step) => step["step-slug"] === params.params?.[0]
    );
  }, [structure, params.params]);

  console.log(scoreObject);

  if (!getCurrentStep) {
    return <div>Loading</div>;
  }
  return (
    <div className={styles["steps-slider-container"]}>
      <div className={clsx(styles["step-box"], styles[animationClass])}>
        <div className={styles["step-headline-container"]}>
          <h2 className={clsx("headline_small bold")}>
            {
              getCurrentStep["step-content"][Number(subStep) - 1]["sub-steps"][
                Number(subStepChoice) - 1
              ].title
            }
          </h2>
        </div>
      </div>
    </div>
  );
}
