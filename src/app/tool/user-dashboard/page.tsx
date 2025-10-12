"use client";

import clsx from "clsx";
import styles from "./user-dashboard.module.scss";
import { useStore, structureProps, ProjectType } from "@/contexts/Store";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Project } from "./project/project";
import { Loader } from "@/components/loader/loader";

export default function userDashboard() {
  const {
    structure,
    setRegistrationPopup,
    setChangePasswordPopup,
    setDeletePopup,
    projects,
    userEmail,
    getUserDashboardData,
    loader,
    isPageChanged,
  } = useStore();
  const router = useRouter();

  useEffect(() => {
    isPageChanged("user-dashboard");
    // console.log("is page changed?", isPageChanged("user-dashboard"));
    if (structure) {
      getUserDashboardData(structure);
    }
  }, [structure]);

  if (!structure || loader) {
    return <Loader />;
  }

  return (
    <div className="main-container main-container-full">
      <h1 className={clsx("headline_medium-big bold", styles["head-title"])}>
        {structure["user-dashboard"]["top-section"].title}
      </h1>
      <div className={styles["top-section"]}>
        <div className={styles["user-row"]}>
          <h2 className={clsx(styles["small-title"], "medium-small bold")}>
            {userEmail}
          </h2>
          <div className={styles["buttons"]}>
            {structure["user-dashboard"]["top-section"]["buttons-copy"].map(
              (button, index) => (
                <button
                  key={button}
                  className={clsx(
                    "basic-button outline",
                    index === 1 && "delete with-icon"
                  )}
                  onClick={() => {
                    if (index === 0) {
                      setChangePasswordPopup(true);
                    } else {
                      setDeletePopup({ type: "delete-user" });
                    }
                  }}>
                  {button}
                </button>
              )
            )}
          </div>
        </div>
      </div>
      <div className={styles["bottom-section"]}>
        <div className={styles["projects-headline-row"]}>
          <h2 className={clsx(styles["title"], "headline_medium-big bold")}>
            {structure["user-dashboard"]["bottom-section"].title}
          </h2>
          <button
            className="basic-button outline with-icon add"
            onClick={() => setRegistrationPopup("new-project")}>
            {
              structure["user-dashboard"]["bottom-section"]["projects"][
                "buttons-copy"
              ]
            }
          </button>
        </div>
        {projects &&
          projects.length > 0 &&
          projects.map((project, index) => (
            <Project
              key={index}
              project_name={project.project_name}
              project_id={project.project_id}
              alternatives={project.alternatives}
            />
          ))}
      </div>
    </div>
  );
}
