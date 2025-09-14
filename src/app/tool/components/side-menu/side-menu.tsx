import styles from "./sideMenu.module.scss";
import { structureProps } from "../../../../contexts/Store";
import { Menu } from "./menu";
import { More } from "./more";
import { usePathname } from "next/navigation";

export function SideMenu({
  structure,
  currentChapter,
}: {
  structure: structureProps;
  currentChapter: string[];
}) {
  const pathname = usePathname();
  const pathSegments = pathname.split("/")[2];

  return (
    <aside className={styles["side-menu"]}>
      <Menu
        structure={structure}
        currentChapter={currentChapter}
        selfAssessment={pathSegments === "self-assessment"}
      />
      {pathSegments !== "self-assessment" && <More structure={structure} />}
    </aside>
  );
}
