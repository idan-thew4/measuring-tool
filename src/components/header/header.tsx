"use client";

import styles from "./header.module.scss";
import Image from "next/image";
import { structureProps, useStore, ProjectType } from "../../contexts/Store";
import Link from "next/link";
import clsx from "clsx";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Select from "react-select";

type logOutResponse = {
  success: boolean;
  data: string;
};

type AlternativeOption = {
  value: number;
  label: string;
};

export function Header() {
  const {
    structure,
    loggedInChecked,
    setLoginPopup,
    projects,
    url,
    setLoggedInChecked,
    getUserDashboardData,
  } = useStore();
  const router = useRouter();
  const params = useParams();
  const [chapter, subChapter, principle] = params?.chapters || [];

  const [currentProject, setCurrentProject] = useState<ProjectType | null>(
    null
  );
  const [alternatives, setAlternatives] = useState<AlternativeOption[]>([]);

  useEffect(() => {
    if (!projects && structure && loggedInChecked) {
      getUserDashboardData(structure);
    }
  }, [projects, structure, loggedInChecked]);

  useEffect(() => {
    if (projects) {
      if (params.project_id) {
        const project = projects.find(
          (p) => p.project_id === Number(params.project_id)
        );

        if (project) {
          setCurrentProject(project);

          let alternativesTemp: AlternativeOption[] = [];

          project.alternatives.forEach((alternative) => {
            alternativesTemp.push({
              label: alternative.alternative_name,
              value: alternative.alternative_id,
            });
          });

          setAlternatives(alternativesTemp);
        }
      }
    }
  }, [projects, params]);

  async function logOut(
    structure: structureProps
  ): Promise<logOutResponse | void> {
    try {
      const response = await fetch(`${url}/log-out`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        setLoggedInChecked(false);
        router.push(
          `/tool/0/0/${structure.questionnaire.content[1]["chapter-slug"]}/1/1`
        );
      }
    } catch (error) {
      console.error("Error creating new user:", error);
    }
  }

  return (
    <header className={styles["header-container"]}>
      <div className={clsx(styles["right-side"], styles["flex-h-align"])}>
        <Image
          alt="Slil logo"
          src="/logo.svg"
          width={219}
          height={60}
          className={styles["logo"]}
        />

        {loggedInChecked ? (
          loggedInChecked ? (
            <div className={styles["flex-h-align"]}>
              <Link href={"/tool/user-dashboard"}>
                {structure?.header.user[1]}
              </Link>
              <button onClick={() => structure && logOut(structure)}>
                {structure?.header.user[2]}
              </button>
            </div>
          ) : (
            <button onClick={() => setLoginPopup(true)}>
              {structure?.header.user[0]}
            </button>
          )
        ) : null}
      </div>
      {loggedInChecked !== undefined &&
        loggedInChecked &&
        params?.chapters &&
        currentProject && (
          <div className={styles["left-side"]}>
            {projects && (
              <div>
                <Select
                  className="dropdown paragraph_18"
                  classNamePrefix="dropdown"
                  isClearable={true}
                  isSearchable={true}
                  value={alternatives[0]}
                  // isDisabled={alternatives.length >= 1}
                  // menuIsOpen={true}
                  options={alternatives}
                  onChange={(option) => {
                    if (structure) {
                      router.push(
                        `/tool/${currentProject.project_id}/${option?.value}/${chapter}/${subChapter}/${principle}`
                      );
                    }
                  }}
                />
              </div>
            )}
          </div>
        )}
    </header>
  );
}
