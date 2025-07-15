import styles from "./progressBar.module.scss";
import { useStore, ScoreType } from "../../../../contexts/Store";
import { useEffect, useState } from "react";

export function ProgressBar() {
  const { scoreObject, calculateProgress } = useStore();
  const [progress, setProgress] = useState({});

  useEffect(() => {
    setProgress(calculateProgress(scoreObject));
  }, []);

  return <div></div>;
}
