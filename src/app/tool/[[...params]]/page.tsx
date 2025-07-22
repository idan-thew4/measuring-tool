"use client";

import clsx from "clsx";
import { structureProps, useStore } from "../../../contexts/Store";
import styles from "./steps.module.scss";
import { useParams } from "next/navigation";
import { useMemo } from "react";

export type structureAndStepsProps = {
  structure: structureProps | undefined;
  currentStep: string[];
};

export default function StepPage() {
  const params = useParams();
  const [step, subStep, subStepChoice] = params?.params || [];
  const { structure } = useStore();

  const getCurrentStep = useMemo(() => {
    return structure?.content.find(
      (step) => step["step-slug"] === params.params?.[0]
    );
  }, [structure, params.params]);

  console.log("getCurrentStep", getCurrentStep);

  return (
    <div className={styles["steps-slider-container"]}>
      <div className={styles["step-box"]}>
        <h2 className={clsx("headline_small bold")}></h2>
      </div>
    </div>
  );
}
