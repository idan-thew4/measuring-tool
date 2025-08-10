import styles from "./sideMenu.module.scss";
import { structureProps } from "../../../../contexts/Store";
import { Menu } from "./menu";
import { More } from "./more";

export function SideMenu({
  structure,
  currentChapter,
}: {
  structure: structureProps;
  currentChapter: string[];
}) {
  return (
    <aside className={styles["side-menu"]}>
      <Menu structure={structure} currentChapter={currentChapter} />
      <More structure={structure} />
    </aside>
  );
}
