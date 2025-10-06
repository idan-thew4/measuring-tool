"use client";

import clsx from "clsx";
import styles from "./user-dashboard.module.scss";
import { useStore, structureProps } from "@/contexts/Store";
import { useEffect, useReducer, useState } from "react";
import { useRouter } from "next/navigation";
import { Project } from "./project/project";
import { set } from "react-hook-form";

type project = {
  project_name: string;
  project_id: number;
  alternatives: alternativeType[];
};

export type alternativeType = {
  alternative_id: number;
  alternative_name: string;
};

type getUserDashboardDataResponse = {
  user_id: number;
  email: string;
  projects: project[];
};

export default function userDashboard() {
  const { structure, url } = useStore();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [projects, setProjects] = useState<project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  async function getUserDashboardData(
    structure: structureProps
  ): Promise<getUserDashboardDataResponse | void> {
    try {
      const response = await fetch(`${url}/get-user-data-dashboard`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const data = await response.json();

      if (data.projects) {
        setLoading(false);
        setUserEmail(data.email);
        setProjects(data.projects);
      } else {
        router.push(
          `/tool/0/0/${structure?.questionnaire.content[1]["chapter-slug"]}/1/1`
        );
      }
    } catch (error) {
      router.push(
        `/tool/0/0/${structure?.questionnaire.content[1]["chapter-slug"]}/1/1`
      );
      //   console.error("Failed to validate token:", error);
    }
  }

  useEffect(() => {
    if (structure) {
      getUserDashboardData(structure);
    }
  }, [structure]);

  if (!structure || loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="main-container main-container-full">
      <h1 className={clsx("headline_medium-big bold", styles["head-title"])}>
        {structure["user-dashboard"]["top-section"].title}
      </h1>
      <div className={styles["top-section"]}>
        <div className={styles["user-row"]}>
          <h2 className={clsx(styles["small-title"], "medium-small bold")}>
            {structure["user-dashboard"]["top-section"]["info-captions"][0]}
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
                >
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
          <button className="basic-button outline with-icon add">
            {
              structure["user-dashboard"]["bottom-section"]["projects"][
                "buttons-copy"
              ]
            }
          </button>
        </div>
        {projects.length > 0 &&
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
