"use client";

import styles from "./header.module.scss";
import Image from "next/image";
import {
  structureProps,
  useStore,
  ProjectType,
  alternativeType,
  CalcParameters,
  ScoreType,
} from "../../contexts/Store";
import Link from "next/link";
import clsx from "clsx";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Select from "react-select";
import { RadarGraph } from "@/app/tool/[project_id]/[alternative_id]/summary-report/graphs/graph/radar/radar";
import "../../components/popUps/popUpContainer/dropdown.scss";

type logOutResponse = {
  success: boolean;
  data: string;
};

type AlternativeOption = {
  value: number;
  label: string;
};

type ChapterScoreType = { subject: string; questionnaire: number };

export function Header() {
  const {
    structure,
    loggedInChecked,
    setLoginPopup,
    projects,
    url,
    setLoggedInChecked,
    getUserDashboardData,
    setAddRenamePopup,
    pages,
    getChaptersScores,
    calculateScores,
    scoreObject,
    current,
    setLoader,
    setCurrent,
    getAlternativeQuestionnaireData,
    maxValue,
    initialScoreObject,
    setScoreObject,
    setSideMenu,
  } = useStore();
  const router = useRouter();
  const params = useParams();
  const [chapter, subChapter, principle] = params?.chapters || [];
  const [chapterScores, setChapterScores] = useState<ChapterScoreType[]>([]);
  const [alternatives, setAlternatives] = useState<AlternativeOption[]>([]);
  const [graphIsOpen, setGraphIsOpen] = useState<boolean>(false);

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
        const alternative = project?.alternatives.find(
          (a) => a.alternative_id === Number(params.alternative_id)
        );

        if (project && alternative) {
          setCurrent({ project, alternative });

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

  useEffect(() => {
    let questionnaireParams = [] as CalcParameters[];

    questionnaireParams = calculateScores(
      scoreObject.data.questionnaire ?? [],
      "chapters",
      "questionnaire"
    );

    let chapterScoreTemp: ChapterScoreType[] = [];

    if (structure) {
      chapterScoreTemp = getChaptersScores(
        questionnaireParams,
        structure,
        false,
        scoreObject
      );

      setChapterScores(chapterScoreTemp);
    }
  }, [scoreObject, structure]);

  async function logOut(
    structure: structureProps
  ): Promise<logOutResponse | void> {
    setLoader(true);
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
        setLoader(false);
        setLoggedInChecked(false);
        setScoreObject(initialScoreObject);
        router.push(
          `/tool/0/0/${structure.questionnaire.content[0]["chapter-slug"]}/1/1`
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
              <Link
                href={"/tool/user-dashboard"}
                onClick={(e) => {
                  // e.preventDefault();
                  setSideMenu("");
                }}
              >
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
        current &&
        params.project_id && (
          <div className={clsx(styles["left-side"], styles["flex-h-align"])}>
            {projects && (
              <div
                className={clsx(
                  styles["flex-h-align"],
                  styles["project-options"]
                )}
              >
                <div
                  className={clsx(
                    styles["flex-h-align"],
                    styles["project-select"]
                  )}
                >
                  <p className="bold">{current?.project.project_name}, </p>
                  <Select
                    className="dropdown paragraph_18"
                    classNamePrefix="dropdown"
                    // isClearable={true}
                    isSearchable={true}
                    value={alternatives?.find(
                      (a) => a.value === Number(params.alternative_id)
                    )}
                    isDisabled={alternatives.length <= 1}
                    // menuIsOpen={true}
                    options={alternatives}
                    onChange={(option) => {
                      if (structure) {
                        getAlternativeQuestionnaireData(
                          String(current?.project.project_id),
                          String(option?.value)
                        );
                        router.push(
                          `/tool/${current?.project.project_id}/${
                            option?.value
                          }/${
                            pages.currentPage === "questionnaire"
                              ? `${chapter}/${subChapter}/${principle}`
                              : pages.currentPage
                          }`
                        );
                      }
                    }}
                  />
                </div>
                <button
                  onClick={() => {
                    setAddRenamePopup({
                      type: "add-alternative",
                      project_id: current?.project.project_id,
                      alternative_id: current?.alternative.alternative_id,
                    });
                  }}
                >
                  {structure?.header.options[1]}
                </button>
              </div>
            )}
            <button
              onClick={() => setGraphIsOpen(!graphIsOpen)}
              className={clsx(styles["flex-h-align"], styles["summary"])}
            >
              <p>{structure?.header.options[2]}</p>
              {structure && (
                <RadarGraph
                  structure={structure}
                  parameters={chapterScores}
                  imageGridURL={`/pages/graphs/radar_grid_preview.svg`}
                  labels={false}
                  preview={true}
                  legend={false}
                />
              )}
            </button>

            <div
              className={clsx(
                styles["dropdown"],
                graphIsOpen ? styles["dropdown-enter"] : styles["dropdown-exit"]
              )}
            >
              {structure && (
                <RadarGraph
                  headline={structure["summary-report"]["graphs"][1].title}
                  structure={structure}
                  parameters={chapterScores}
                  imageGridURL={`/pages/graphs/radar_grid_chapters_negative.svg`}
                  negative={true}
                  maxScore={maxValue}
                  type="header"
                />
              )}
            </div>
          </div>
        )}
      {!loggedInChecked && (
        <button
          onClick={() => {
            setLoginPopup(true);
          }}
        >
          התחברות
        </button>
      )}
    </header>
  );
}
