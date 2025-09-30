import styles from "./sideMenu.module.scss";
import { structureProps } from "../../../../../../contexts/Store";
import { Menu } from "./menu";
import { usePathname } from "next/navigation";

export function SideMenu({
  structure,
  currentChapter,
  project_id,
  alternative_id,
  type,
}: {
  structure: structureProps;
  currentChapter: string[];
  project_id: number;
  alternative_id: number;
  type?: string;
}) {
  const pathname = usePathname();

  return (
    <aside className={styles["side-menu"]}>
      <Menu
        structure={structure}
        currentChapter={currentChapter}
        type={type}
        project_id={project_id}
        alternative_id={alternative_id}
      />

      {/* TO DO: unmark more menu */}
      {/* {pathSegments !== "self-assessment" && <More structure={structure} />} */}
    </aside>
  );
}
