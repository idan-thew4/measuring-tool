import styles from "./sideMenu.module.scss";
import { structureProps } from "../../../../../../contexts/Store";
import { Menu } from "./menu";
import { More } from "./more";
import { usePathname } from "next/navigation";

export function SideMenu({
  structure,
  currentChapter,
  project_id,
  alternative_id,
}: {
  structure: structureProps;
  currentChapter: string[];
  project_id: number;
  alternative_id: number;
}) {
  const pathname = usePathname();
  const pathSegments = pathname.split("/")[2];

  return (
    <aside className={styles["side-menu"]}>
      <Menu
        structure={structure}
        currentChapter={currentChapter}
        selfAssessment={pathSegments === "self-assessment"}
        project_id={project_id}
        alternative_id={alternative_id}
      />

      {/* TO DO: unmark more menu */}
      {/* {pathSegments !== "self-assessment" && <More structure={structure} />} */}
    </aside>
  );
}
