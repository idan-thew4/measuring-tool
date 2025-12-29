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
  const { pages, activeSideMenu, setActiveSideMenu, sideMenu } = useStore();
  const [prevSideMenu, setPrevSideMenu] = useState(sideMenu);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    console.log("side menu changed:", sideMenu);

    // If switching between self-assessment and questionnaire, pop out then in
    if (
      (prevSideMenu === "self-assessment" && sideMenu === "questionnaire") ||
      (prevSideMenu === "questionnaire" && sideMenu === "self-assessment")
    ) {
      setActiveSideMenu(false);
      timeout = setTimeout(() => {
        setActiveSideMenu(true);
      }, 300);
    } else if (sideMenu === "") {
      setActiveSideMenu(false);
    } else {
      setActiveSideMenu(true);
    }

    setPrevSideMenu(sideMenu);

    return () => clearTimeout(timeout);
  }, [sideMenu]);

  type;
  return (
    <aside
      className={`${styles["side-menu"]} ${
        activeSideMenu ? styles["side-menu--active"] : ""
      }`}
    >
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
