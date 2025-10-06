import { alternativeType } from "../page";
import { useStore } from "@/contexts/Store";
import styles from "./project.module.scss";
import clsx from "clsx";

export function Project({
  project_name,
  alternatives,
}: {
  project_name: string;
  alternatives: alternativeType[];
}) {
  const { structure, url } = useStore();

  return (
    <ul className={styles["project-table"]}>
      <li className={clsx(styles["row"], styles["row-head"])} key={0}>
        <h3 className={clsx("headline_small", styles["project-name"])}>
          {project_name}
        </h3>
        <button className="paragraph_15 link white with-icon edit">
          {structure
            ? structure["user-dashboard"]["bottom-section"]["projects"][
                "buttons-copy-project"
              ][0]
            : ""}
        </button>
        <button
          className={clsx(
            "basic-button outline with-icon delete",
            styles["delete -button"]
          )}
        >
          {structure
            ? structure["user-dashboard"]["bottom-section"]["projects"][
                "buttons-copy-project"
              ][1]
            : ""}
        </button>
      </li>
      {alternatives.map((alternative, key) => (
        <li
          key={key + 1}
          className={clsx(
            styles["row"],
            styles["row-alternative"],
            key === 0 && styles["no-border"]
          )}
        >
          <div className={styles["alternative-name"]}>
            <h4 className="paragraph_15">{alternative.alternative_name}</h4>
            <button className="paragraph_15 link black with-icon edit">
              {
                structure?.["user-dashboard"]["bottom-section"]["projects"][
                  "buttons-copy-alternative"
                ][0]
              }
            </button>
          </div>
          {structure?.["user-dashboard"]["bottom-section"]["projects"][
            "buttons-copy-alternative"
          ].map(
            (button, index) =>
              index !== 0 && (
                <button
                  key={index}
                  className={clsx(
                    "basic-button outline with-icon",
                    index === 1 && "add-new-alternative",
                    index === 2 && "download",
                    index === 3 && "delete",

                    styles["project-button"]
                  )}
                >
                  {button}
                </button>
              )
          )}
        </li>
      ))}
    </ul>
  );
}
