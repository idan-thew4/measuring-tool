import styles from "./sideMenu.module.scss";
import { structureProps } from "../../../../contexts/Store";
import { Menu } from "./menu";
import { More } from "./more";

export function SideMenu({
  structure,
  currentStep,
}: {
  structure: structureProps;
  currentStep: string[];
}) {
  return (
    <aside className={styles["side-menu"]}>
      <Menu structure={structure} currentStep={currentStep} />
      <More structure={structure} />
    </aside>
  );
}
