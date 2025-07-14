import styles from "./progressBar.module.scss";
import { useStore } from "../../../../contexts/Store";

export function ProgressBar() {
  const { score } = useStore();

  console.log(score);

  return <div>Progress baR</div>;
}
