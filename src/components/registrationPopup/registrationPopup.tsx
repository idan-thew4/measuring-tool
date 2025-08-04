"use client";
import styles from "./registration-pop-up.module.scss";
import { useStore, totalCompleted } from "../../contexts/Store";
import { useEffect, useState } from "react";
import { ProgressBar } from "@/app/tool/components/progress-bar/progress-bar";

export function RegistrationPopup() {
  const { structure } = useStore();
  const [completedSteps, setCompletedSteps] = useState<totalCompleted>();

  useEffect(() => {
    if (structure) {
      const steps = structure.registration.steps.map((step, index) => ({
        completed: index === 0 ? 1 : 0,
        total: 1,
      }));
      setCompletedSteps(steps);
    }
  }, [structure]);

  if (!structure) return <div>Loading...</div>;

  return (
    <div className={styles["registration-pop-up-container"]}>
      <div className={styles["registration-pop-up"]}>
        <h2 className="headline_medium-big">{structure.registration.title}</h2>
        {completedSteps && (
          <ProgressBar completed={completedSteps} indicator={true} />
        )}
      </div>
    </div>
  );
}
