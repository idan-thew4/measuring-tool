import styles from "./progressBar.module.scss";
import { useStore, ScoreType } from "../../../../contexts/Store";
import { useEffect, useState } from "react";

export function ProgressBar() {
  const { scoreObject, completedSteps } = useStore();
  const [progress, setProgress] = useState({});

  return <div></div>;
}
