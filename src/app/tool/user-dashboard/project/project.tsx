import { useStore, alternativeType, formatDate } from "@/contexts/Store";
import styles from "./project.module.scss";
import clsx from "clsx";
import Link from "next/link";

export function Project({
  project_name,
  alternatives,
  project_id,
}: {
  project_name: string;
  alternatives: alternativeType[];
  project_id: number;
}) {
  const { structure, setDeletePopup, setAddRenamePopup } = useStore();

  return (
    <ul className={styles["project-table"]}>
      <li className={clsx(styles["row"], styles["row-head"])} key={0}>
        <div className={styles["project-name"]}>
          <h3 className={clsx("headline_small bold", styles["project-name"])}>
            {project_name}
          </h3>
          <button
            className="paragraph_15 link white with-icon edit"
            onClick={() => {
              setAddRenamePopup({
                type: "rename-project",
                project_id: project_id,
                project_name: project_name,
              });
            }}>
            {structure
              ? structure["user-dashboard"]["bottom-section"]["projects"][
                  "buttons-copy-project"
                ][0]
              : ""}
          </button>
        </div>

        <button
          className={clsx(
            "basic-button outline with-icon delete",
            styles["delete-button"]
          )}
          onClick={() =>
            setDeletePopup({ type: "delete-project", project_id: project_id })
          }>
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
            styles["row-alternative"]
            // key === 0 && styles["no-border"]
          )}>
          <div className={styles["alternative-name"]}>
            <Link
              href={`/tool/${project_id}/${alternative.alternative_id}/${structure?.questionnaire.content[0]["chapter-slug"]}/1/1`}
              className={clsx("paragraph_20", styles["alternative-link"])}>
              {alternative.alternative_name},
              <span className={clsx(styles["date"], "paragraph_15")}>
                &nbsp;
                {formatDate(alternative.alternative_created_date_timestamp)}
              </span>
            </Link>
            <button
              className="paragraph_15 link black with-icon edit"
              onClick={() => {
                setAddRenamePopup({
                  type: "rename-alternative",
                  project_id: project_id,
                  alternative_id: alternative.alternative_id,
                  alternative_name: alternative.alternative_name,
                });
              }}>
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
              index !== 0 &&
              (index !== 3 || alternatives.length > 1) && (
                <button
                  key={index}
                  className={clsx(
                    "basic-button outline with-icon",
                    alternatives.length > 1
                      ? styles["multiple-alternative"]
                      : styles["single-alternative"],
                    index === 1 && "add-alternative",
                    index === 2 && "download",
                    index === 2 && styles["download-button"],
                    index === 3 && "delete",
                    styles["project-button"]
                  )}
                  onClick={() => {
                    switch (index) {
                      case 1:
                        setAddRenamePopup({
                          type: "add-alternative",
                          project_id: project_id,
                          alternative_id: alternative.alternative_id,
                        });
                        break;

                      case 3:
                        setDeletePopup({
                          type: "delete-alternative",
                          alternative_id: alternative.alternative_id,
                        });
                    }
                  }}>
                  {button}
                </button>
              )
          )}
        </li>
      ))}
    </ul>
  );
}
