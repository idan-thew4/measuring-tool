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
  const { structure } = useStore();
  const [animationClass, setAnimationClass] = useState("slide-in");

  const getCurrentStep = useMemo(() => {
    return structure?.content.find(
      (step) => step["step-slug"] === params.params?.[0]
    );
  }, [structure, params.params]);

  console.log(getCurrentStep);

  return (
    <div className={styles["steps-slider-container"]}>
      <div className={clsx(styles["step-box"], styles[animationClass])}>
        <h2 className={clsx("headline_small bold")}></h2>
      </div>
    </div>
  );
}
