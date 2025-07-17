import styles from "./sideMenu.module.scss";
import Link from "next/link";
import clsx from "clsx";
import { ProgressBar } from "./progress-bar/progress-bar";
import { Step } from "@/contexts/Store";
import { useStore } from "../../../contexts/Store";
import { collectSegmentData } from "next/dist/server/app-render/collect-segment-data";
import { use, useEffect, useState } from "react";

type structureAndStepsProps = {
  content: Step[];
  currentStep: string[];
};

export function SideMenu({ content, currentStep }: structureAndStepsProps) {
  const { completedSteps } = useStore();

  return (
    <aside className={styles["side-menu"]}>
      <ProgressBar />
      <ul className={styles["nav-side-menu"]}>
        {content.map((step, stepIndex) => (
          <li
            className={clsx(
              styles["step"],
              step["step-slug"] === currentStep[0] ? styles["active"] : ""
            )}
            key={stepIndex}
          >
            <div className={clsx("nav-side-text__step", styles["step-text"])}>
              <Link href={`/tool/${step["step-slug"]}/1/1`}>
                {`${stepIndex}. ${step["step-title"]}`}
              </Link>
              <p>{`${completedSteps[stepIndex]?.completedSteps ?? 0}/${
                completedSteps[stepIndex]?.totalSteps ?? 0
              }`}</p>
            </div>

            <ul className={styles["step-content"]}>
              {step["step-content"].map((subStep, subIndex) => (
                <li
                  key={subIndex}
                  className={
                    step["step-slug"] === currentStep[0] &&
                    subIndex + 1 === parseInt(currentStep[1])
                      ? styles["active"]
                      : ""
                  }
                >
                  <Link
                    className="nav-side-text__sub-step"
                    href={`/tool/${step["step-slug"]}/${subIndex + 1}/1`}
                  >
                    {`${stepIndex + 1}.${subIndex + 1} ${
                      subStep["sub-step-title"]
                    }`}
                  </Link>
                  <ul className={styles["sub-step-choices"]}>
                    {subStep["sub-step-choices"].map(
                      (subChoices, subChoicesIndex) => (
                        <li
                          key={subChoicesIndex}
                          className={
                            step["step-slug"] === currentStep[0] &&
                            subIndex + 1 === parseInt(currentStep[1]) &&
                            subChoicesIndex + 1 === parseInt(currentStep[2])
                              ? styles["active"]
                              : ""
                          }
                        >
                          {/* <p>{subChoices}</p> */}
                          <Link
                            className="nav-side-text__sub-step-choice"
                            href={`/tool/${step["step-slug"]}/${subIndex + 1}/${
                              subChoicesIndex + 1
                            }`}
                          >
                            {`${subChoicesIndex + 1}. ${subChoices}`}
                          </Link>
                        </li>
                      )
                    )}
                  </ul>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </aside>
  );
}
