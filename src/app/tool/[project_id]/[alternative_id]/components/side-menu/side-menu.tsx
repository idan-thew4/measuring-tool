import styles from "./sideMenu.module.scss";
import { structureProps } from "../../../../../../contexts/Store";
import { Menu } from "./menu";
import { useEffect, useState } from "react";
import { useStore } from "../../../../../../contexts/Store";

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
  const [active, setActive] = useState(false);
  const { pages } = useStore();

  useEffect(() => {
    console.log("pages in side menu", pages);
    if (pages.currentPage === "questionnaire") {
      setActive(true);
    } else {
      setActive(true);
    }
  }, [pages]);

  return (
    <aside
      className={`${styles["side-menu"]} ${
        active ? styles["side-menu--active"] : ""
      }`}>
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
