"use client";

import { useParams, usePathname, useRouter } from "next/navigation";
import path from "path";
import React, {
  createContext,
  useContext,
  PropsWithChildren,
  useState,
  useEffect,
  useRef,
} from "react";
import { set } from "react-hook-form";

const ApiContext = createContext<ApiContextType | undefined>(undefined);

const setCookie = (cname: string, cvalue: string, exdays: number) => {
  const d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  let expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
};

const getCookie = (cname: string) => {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
};

function useStore() {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error("useStore should be used within ApiContext only");
  }
  return context;
}

export function formatDate(timestamp: number) {
  const date = new Date(timestamp * 1000);
  const day = date.getDate();
  const month = date.getMonth() + 1; // Months are zero-based
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

export function getScoreLabel(
  structure: structureProps | undefined,
  value: number
) {
  const scoreLabels = structure?.questionnaire.options ?? [];

  if (value > 100) {
    return scoreLabels[4];
  } else if (value <= 100 && Number(value) >= 33) {
    return scoreLabels[3];
  } else if (value <= 34 && Number(value) >= 18) {
    return scoreLabels[2];
  } else {
    return scoreLabels[1];
  }
}

export function getPercentageLabel(
  scores: ScoreData[] | ScoreData,
  indexOrGetScoreLabel: number | ((value: number) => string),
  structure: structureProps | undefined,
  getScoreLabel?: (
    structure: structureProps | undefined,
    value: number
  ) => string
): string {
  if (Array.isArray(scores)) {
    const index = indexOrGetScoreLabel as number;
    if (scores[index] && Number(scores[index].percentage) > 0) {
      return (
        getScoreLabel?.(
          structure,
          Number(
            scores[index].percentage != null ? scores[index].percentage : 0
          )
        ) ?? ""
      );
    }
  } else if (scores && Number(scores.percentage) > 0) {
    const labelFunction = indexOrGetScoreLabel as (value: number) => string;
    return labelFunction(
      Number(scores.percentage != null ? scores.percentage : 0)
    );
  }
  return "";
}

export function getScoreValue(
  scores: ScoreData[] | ScoreData,
  key: "generalScore" | "percentage",
  indexOrGetScoreLabel?: number
): string | number {
  if (Array.isArray(scores)) {
    const index = indexOrGetScoreLabel as number;
    if (
      scores[index] &&
      typeof scores[index][key] === "number" &&
      scores[index][key] > 0
    ) {
      return scores[index][key];
    }
  } else if (scores && typeof scores[key] === "number" && scores[key] > 0) {
    return scores[key];
  }
  return "";
}

//Score Object types//

export type ScoreType = {
  data: ScoreVariations;
  "project-details": ProjectDetails;
};

export type ScoreVariations = {
  questionnaire: ChapterPoints[];
  assessment: AssessmentProps[];
};

export type ChapterPoints = {
  "chapter-number": number;
  "chapter-data": SubChapterPoints[];
};

export type AssessmentProps = {
  "chapter-number": number;
  "chapter-score": number;
  "sub-chapters"?: {
    "sub-chapter-number": number;
    "sub-chapter-score": number;
  }[];
};

type SubChapterPoints = {
  "sub-chapter-number": number;
  principles: ChoicePoints[];
};

type ChoicePoints = {
  id: number;
  choice: number | undefined;
  comment?: string;
};

export type ProjectDetails = {
  projectName: string;
  alternativeName: string;
  projectCreationDate: number;
  localAuthority: { value: string; label: string } | string;
  projectType: { value: string; label: string } | string;
  projectSubType: { value: string; label: string } | string;
  projectStatus: { value: string; label: string } | string;
  projectStartYear: { value: string; label: string } | string;
  projectEndYear: { value: string; label: string } | string;
  yearsOfExperience: string;
  education: { value: string; label: string } | string;
  gender: { value: string; label: string } | string;
  professionalTraining: { value: string; label: string } | string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  projectArea: string;
  planningTeamRole: string;
};

//Structure types//

export type structureProps = {
  sidebar: sideBar;
  questionnaire: questionnaire;
  registration: Registration;
  summary: Summary;
  "summary-report": SummaryReport;
  "self-assessment": SelfAssessment;
  login: Login;
  "user-dashboard": UserDashboard;
  header: {
    user: string[];
    options: string[];
  };
};

type UserDashboard = {
  "top-section": {
    title: string;
    "info-captions": string[];
    "buttons-copy": string[];
  };
  "bottom-section": {
    title: string;
    projects: {
      header: string;
      "buttons-copy": string;
      "buttons-copy-project": string[];
      "buttons-copy-alternative": string[];
    };
  };

  "pop-ups": { [key: string]: Popups };
};

export type Popups = {
  title: string;
  description?: string;
  "input-fields"?: RegistrationInputField[];
  "buttons-copy": string[];
};

type Login = {
  title: string;
  text: string[];
  "input-fields": RegistrationInputField[];
  "button-copy": string;
};

type SelfAssessment = {
  "pop-up": {
    title: string;
    "buttons-copy": string[];
  };
  headline: string;
  "sub-headline": string;
  "summary-title": string;
  "graph-headlines": string[];
};

type SummaryReport = {
  graphs: Graph[];
};

type Graph = {
  title: string;
  type: string;
  data: string;
  filters?: string[];
};

type Summary = {
  header: {
    title: string;
    "summary-details": string[];
    "buttons-copy": string[];
  };
  table: {
    columns: { title: string; dataIndex: string; key: string }[];
    "buttons-copy": string[];
  };
};

export type Registration = {
  title: string;
  "validation-general-copy": string;
  "nav-buttons": string[];
  steps: RegistrationStep[];
};

export type RegistrationStep = {
  title: string;
  description: string;
  "input-fields": RegistrationInputField[];
};

type RegistrationInputField = {
  label: string;
  mandatory: boolean;
  "validation-error": string;
  "format-error": string;
  placeholder: string;
  name: string;
  "dropdown-options"?: string[];
  type?: string;
  row?: number;
};

type questionnaire = {
  options: string[];
  buttons?: string[];
  "text-area-placeholder"?: string;
  content: Chapter[];
};

type sideBar = {
  "progress-bar-headline": string;
  "bottom-options": string[];
  more: string[];
};

export type Chapter = {
  "chapter-number": number;
  "chapter-title": string;
  "chapter-description": string;
  "chapter-slug": string;
  "chapter-content": SubChapter[];
};

export type SubChapter = {
  "sub-chapter-title": string;
  "sub-chapter-description": string;
  principles: Choice[];
};

type Choice = {
  title: string;
  description: string;
  choices: { title: string; text: string; score: number }[];
  comment?: string;
};

export type totalCompleted = {
  total: number;
  completed: number;
  completedChapters?: number;
  skippedChapters?: number;
  totalChapters?: number;
  skipped?: number | boolean;
}[];

export type CalcParameters = {
  chapter: number;
  "sub-chapter"?: number;
  "general-score": number;
  "max-score": number;
  "net-zero-impact": number;
  type?: string;
};

export type ProjectType = {
  project_name: string;
  project_id: number;
  project_created_date_timestamp: number;
  alternatives: alternativeType[];
};

export type alternativeType = {
  alternative_id: number;
  alternative_name: string;
  alternative_created_date_timestamp: number;
};

type getUserDashboardDataResponse = {
  user_id: number;
  email: string;
  projects: ProjectType[];
};

type ApiContextType = {
  scoreObject: ScoreType;
  setScoreObject: React.Dispatch<React.SetStateAction<ScoreType>>;
  completedChapters: totalCompleted;
  structure: structureProps | undefined;
  previousChapter?: string[];
  getCurrentChapter: (chapterSlug: string) => Chapter | undefined;
  setRegistrationPopup: React.Dispatch<React.SetStateAction<string>>;
  registrationPopup: string;
  calculateScores: (
    data: ChapterPoints[],
    graph: string,
    type: string,
    maxScoresOnly?: boolean
  ) => CalcParameters[];
  url: string;
  loginPopup: boolean;
  setLoginPopup: React.Dispatch<React.SetStateAction<boolean>>;
  getContent: () => Promise<structureProps | undefined>;
  setIsTokenChecked: React.Dispatch<React.SetStateAction<boolean>>;
  isTokenChecked: boolean;
  sideMenu: string;
  setSideMenu: React.Dispatch<React.SetStateAction<string>>;
  loggedInChecked: boolean | undefined;
  setLoggedInChecked: React.Dispatch<React.SetStateAction<boolean | undefined>>;
  setSelfAssessmentPopup: React.Dispatch<React.SetStateAction<boolean>>;
  selfAssessmentPopup: boolean;
  selfAssessmentIsLoaded: boolean;
  setSelfAssessmentIsLoaded: React.Dispatch<React.SetStateAction<boolean>>;
  isMounted: React.MutableRefObject<boolean>;
  getAlternativeQuestionnaireData: (
    project_id: string,
    alternative_id: string
  ) => Promise<void>;
  loader: boolean;
  setLoader: React.Dispatch<React.SetStateAction<boolean>>;
  changePasswordPopup: boolean;
  setChangePasswordPopup: React.Dispatch<React.SetStateAction<boolean>>;
  deletePopup: { type: string; project_id?: number; alternative_id?: number };
  setDeletePopup: React.Dispatch<
    React.SetStateAction<{
      type: string;
      project_id?: number;
      alternative_id?: number;
    }>
  >;
  addRenamePopup: {
    type: string;
    project_id?: number;
    alternative_id?: number;
    project_name?: string;
    alternative_name?: string;
  };
  setAddRenamePopup: React.Dispatch<
    React.SetStateAction<{
      type: string;
      project_id?: number;
      alternative_id?: number;
      project_name?: string;
      alternative_name?: string;
    }>
  >;
  projects: ProjectType[] | null;
  setProjects: React.Dispatch<React.SetStateAction<ProjectType[] | null>>;
  userEmail: string | null;
  setUserEmail: React.Dispatch<React.SetStateAction<string | null>>;
  getUserDashboardData: (
    structure: structureProps
  ) => Promise<getUserDashboardDataResponse | void>;
  isPageChanged: (currentPage: string) => void;
  getChaptersScores: (
    questionnaireParams: CalcParameters[],
    structure: structureProps,
    hasAssessment: boolean,
    scoreObject: ScoreType
  ) => { subject: string; questionnaire: number }[];
  pages: { previousPage: string; currentPage: string };
  legendColors: string[];
  current: { project: ProjectType; alternative: alternativeType } | null;
  setCurrent: React.Dispatch<
    React.SetStateAction<{
      project: ProjectType;
      alternative: alternativeType;
    } | null>
  >;
  maxValue: number | undefined;
  setMaxValue: React.Dispatch<React.SetStateAction<number | undefined>>;
  initialScoreObject: ScoreType;
};

export type ScoreData = {
  subject?: string;
  name?: string;
} & {
  [key: string]: number | string | null | boolean;
};

// const url = "http://localhost:3000/";
const url =
  "https://wordpress-1080689-5737105.cloudwaysapps.com/wp-json/slil-api";

function Store({ children }: PropsWithChildren<{}>) {
  const [structure, setStructure] = useState<structureProps>();
  const [scoreObject, setScoreObject] = useState<ScoreType>({
    "project-details": {
      projectName: "",
      projectCreationDate: 0,
      alternativeName: "",
      localAuthority: { value: "", label: "" },
      projectType: { value: "", label: "" },
      projectSubType: { value: "", label: "" },
      projectStatus: { value: "", label: "" },
      projectStartYear: { value: "", label: "" },
      projectEndYear: { value: "", label: "" },
      yearsOfExperience: "",
      education: { value: "", label: "" },
      gender: { value: "", label: "" },
      professionalTraining: { value: "", label: "" },
      contactPerson: "",
      contactEmail: "",
      contactPhone: "",
      projectArea: "",
      planningTeamRole: "",
    },
    data: {
      questionnaire: [],
      assessment: [],
    },
  });
  const [completedChapters, setCompletedChapters] = useState<totalCompleted>(
    []
  );
  const params = useParams();
  const [chapter, subChapter, principle] = params?.chapters || [];
  const [previousChapter, setPreviousChapter] = useState<
    string[] | undefined
  >();

  // Pop ups //
  const [registrationPopup, setRegistrationPopup] = useState<string>("");
  const [loginPopup, setLoginPopup] = useState<boolean>(false);
  const [changePasswordPopup, setChangePasswordPopup] =
    useState<boolean>(false);
  const [selfAssessmentPopup, setSelfAssessmentPopup] =
    useState<boolean>(false);
  const [deletePopup, setDeletePopup] = useState<{
    type: string;
    project_id?: number;
    alternative_id?: number;
  }>({ type: "" });
  const [addRenamePopup, setAddRenamePopup] = useState<{
    type: string;
    project_id?: number;
    alternative_id?: number;
    project_name?: string;
    alternative_name?: string;
  }>({ type: "" });
  const [projects, setProjects] = useState<ProjectType[] | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [pages, setPages] = useState<{
    previousPage: string;
    currentPage: string;
  }>({ previousPage: "", currentPage: "" });
  const [isTokenChecked, setIsTokenChecked] = useState(false);
  const [sideMenu, setSideMenu] = useState<string>("");
  const [loggedInChecked, setLoggedInChecked] = useState<boolean | undefined>();
  const pathname = usePathname();
  const [selfAssessmentIsLoaded, setSelfAssessmentIsLoaded] = useState(false);
  const isMounted = useRef(false);
  const [loader, setLoader] = useState(true);
  const router = useRouter();
  const legendColors = ["#577686", "#00679B", "#0089CE", " #00A9FF"];
  const [current, setCurrent] = useState<{
    project: ProjectType;
    alternative: alternativeType;
  } | null>(null);
  const [maxValue, setMaxValue] = useState<number>();
  const [initialScoreObject, setInitialScoreObject] = useState<ScoreType>();

  async function getContent() {
    try {
      const response = await fetch(`${url}/structure`);

      // const response = await fetch(`${url}/api/temp`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setStructure(data);
      createScoreObject(data);

      return data;
    } catch (error) {
      console.error("Failed to fetch content:", error);
    }
  }

  function createScoreObject(structureObject: structureProps) {
    let scoreObjectTemp: ScoreType;
    const cookies = getCookie(`${scoreObject["project-details"].contactEmail}`);

    //To DO: // Remove specific email
    // const cookies = getCookie(`office@tdfmail.com`);

    if (cookies) {
      scoreObjectTemp = JSON.parse(cookies);
    } else {
      scoreObjectTemp = {
        "project-details": {
          projectName: "",
          projectCreationDate: 0,
          alternativeName: "",
          localAuthority: "",
          projectType: "",
          projectSubType: "",
          projectStatus: "",
          projectStartYear: "",
          projectEndYear: "",
          yearsOfExperience: "",
          education: "",
          gender: "",
          professionalTraining: "",
          contactPerson: "",
          contactEmail: "",
          contactPhone: "",
          projectArea: "",
          planningTeamRole: "",
        },
        data: {
          questionnaire: structureObject.questionnaire.content.map(
            (chapter) => ({
              "chapter-number": chapter["chapter-number"],
              "chapter-data": chapter["chapter-content"].map(
                (subChapter, subIndex) => ({
                  "sub-chapter-number": subIndex + 1,
                  principles: subChapter["principles"].map((sub, subIndex) => ({
                    id: subIndex + 1,
                    choice: undefined,
                  })),
                })
              ),
            })
          ),
          assessment: structureObject.questionnaire.content.map(
            (chapter, index) => {
              const chapterTemp: AssessmentProps = {
                "chapter-number": chapter["chapter-number"],
                "chapter-score": 0,
              };
              if (index === 1) {
                const subchaptersTemp = chapter["chapter-content"].map(
                  (subChapter, subIndex) => ({
                    "sub-chapter-number": subIndex + 1,
                    "sub-chapter-score": 0,
                  })
                );
                chapterTemp["sub-chapters"] = subchaptersTemp;
              }
              return chapterTemp;
            }
          ),
        },
      };
    }

    setScoreObject(scoreObjectTemp);
    setInitialScoreObject(scoreObjectTemp);
    getCompletedChapters(scoreObjectTemp);
  }

  function getCompletedChapters(scoreObject: ScoreType) {
    let totalCompletedChapters: totalCompleted = [];
    if (scoreObject.data) {
      let total = 0;
      let completedChapters = 0;
      let skippedChapters = 0;

      scoreObject.data.questionnaire.forEach((chapterData, index) => {
        let completed = 0;
        let skipped = 0;
        chapterData["chapter-data"].forEach((subChapter) => {
          const allFilled = subChapter["principles"].every(
            (choiceObj) => choiceObj.choice !== undefined
          );
          const allSkipped = subChapter["principles"].every(
            (choiceObj) => choiceObj.choice === -1
          );

          subChapter["principles"].forEach((subChapterChoice) => {
            total++;
            if (subChapterChoice.choice !== undefined) {
              completed++;
            }
            if (subChapterChoice.choice === -1) {
              skipped++;
            }
          });
          if (allFilled) {
            completedChapters++;
          }
          if (allSkipped) {
            skippedChapters++;
          }
        });

        totalCompletedChapters.push({
          total: total,
          completed: completed,
          completedChapters:
            skippedChapters === chapterData["chapter-data"].length
              ? 0
              : completedChapters,
          skippedChapters: skippedChapters,
          skipped: skipped,
          totalChapters: chapterData["chapter-data"].length,
        });

        total = 0;
        completedChapters = 0;
        skippedChapters = 0;
      });

      return totalCompletedChapters;
    }
  }

  async function getAlternativeQuestionnaireData(
    project_id: string,
    alternative_id: string
  ) {
    setLoader(true);
    try {
      const response = await fetch(
        `${url}/get-alternative-questionnaire-data?project_id=${project_id}&alternative_id=${alternative_id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      const data = await response.json();

      if (data) {
        setLoader(false);
        if (data.success) {
          setLoggedInChecked(true);
          if (data.data.queastionnaire_data !== 0) {
            setScoreObject((prev) => ({
              ...prev,
              data: {
                ...prev.data,
                questionnaire: data.data.queastionnaire_data,
                assessment: data.data.self_assessment_data,
              },
            }));
          }
          // router.push(
          //   `/tool/${project_id}/${alternative_id}/${chapter}/${subChapter}/${principle}`
          // );
        } else {
          router.push(`/tool/0/0/${chapter}/${subChapter}/${principle}`);
        }
      }
    } catch (error) {
      console.error("Failed to validate token:", error);
    }
  }

  const getCurrentChapter = (chapterSlug: string) => {
    return structure?.questionnaire.content.find(
      (structureChapter) => structureChapter["chapter-slug"] === chapterSlug
    );
  };

  function calculateScores(
    data: ChapterPoints[],
    graph: string,
    type: string,
    maxScoresOnly = false
  ) {
    let index = 0;
    let calcParameters: CalcParameters[] = [];
    let subChapterObj: CalcParameters;
    maxScoresOnly: Boolean;

    data?.forEach((chapter, chapterIndex) => {
      if (graph === "chapters") {
        index = chapterIndex;
        calcParameters.push({
          chapter: chapterIndex,
          "general-score": 0,
          "net-zero-impact": 0,
          "max-score": 0,
          type: type,
        });
      }
      chapter["chapter-data"].forEach((subChapterData, subChapterIndex) => {
        if (graph === "subchapters") {
          index = subChapterIndex;
          subChapterObj = {
            chapter: chapterIndex,
            "sub-chapter": subChapterIndex,
            "general-score": 0,
            "max-score": 0,
            "net-zero-impact": 0,
            type: type,
          };
        }

        subChapterData.principles.forEach((principle, principleIndex) => {
          const structurePrinciple =
            structure?.questionnaire.content?.[chapterIndex]?.[
              "chapter-content"
            ]?.[subChapterIndex]?.["principles"]?.[principleIndex];

          if (typeof principle.choice === "number" && principle.choice >= 0) {
            const generalScore =
              structurePrinciple?.choices?.[principle.choice - 1];
            const netZeroImpactScore = structurePrinciple?.choices?.[3];
            const maxScore = structurePrinciple?.choices?.[4];

            if (generalScore && typeof generalScore.score === "number") {
              if (graph === "chapters") {
                calcParameters[index]["general-score"] += generalScore.score;
                calcParameters[index]["net-zero-impact"] +=
                  netZeroImpactScore?.score ?? 0;
                calcParameters[index]["max-score"] += maxScore?.score ?? 0;

                console.log("maxscore" + calcParameters[index]["max-score"]);
                //console.log("index" + index);
              } else if (
                graph === "subchapters" &&
                subChapterObj &&
                typeof subChapterObj["max-score"] === "number"
              ) {
                subChapterObj["general-score"] += generalScore.score;
                subChapterObj["net-zero-impact"] +=
                  netZeroImpactScore?.score ?? 0;
                subChapterObj["max-score"] += maxScore?.score ?? 0;
              }
            }
            // } else {
            //   const netZeroImpactScore = structurePrinciple?.choices?.[3];
            //   const maxScore = structurePrinciple?.choices?.[4];

            //   if (graph === "chapters") {
            //     calcParameters[index]["max-score"] += maxScore?.score ?? 0;
            //     calcParameters[index]["net-zero-impact"] +=
            //       netZeroImpactScore?.score ?? 0;
            //   } else if (graph === "subchapters") {
            //     subChapterObj["max-score"] += maxScore?.score ?? 0;
            //     subChapterObj["net-zero-impact"] +=
            //       netZeroImpactScore?.score ?? 0;
            //   }
          }
        });
        if (graph === "subchapters") {
          calcParameters.push(subChapterObj);
        }
      });
    });

    return calcParameters;
  }

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
        setLoader(false);
        setUserEmail(data.user_email);
        setProjects(data.projects);
        setLoggedInChecked(true);
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

  function isPageChanged(page: string): boolean {
    if (pages.previousPage !== page) {
      setPages((prev) => ({
        previousPage: prev.currentPage,
        currentPage: page,
      }));
      return true;
    }

    return false;
  }

  function getChaptersScores(
    questionnaireParams: CalcParameters[],
    structure: structureProps,
    hasAssessment: boolean,
    scoreObject: ScoreType
  ) {
    return questionnaireParams.map((chapter, index) => {
      const subject =
        structure?.questionnaire.content?.[index]?.["chapter-title"] ?? "";

      const questionnaireRaw = Math.round(
        (chapter["general-score"] / chapter["net-zero-impact"]) * 100
      );
      const questionnaire = Number.isNaN(questionnaireRaw)
        ? 0
        : questionnaireRaw;

      const assessment =
        hasAssessment && scoreObject.data.assessment[index]["chapter-score"];

      return {
        subject,
        questionnaire,
        ...(hasAssessment
          ? {
              assessment: assessment,
            }
          : {}),
      };
    });
  }

  useEffect(() => {
    setPreviousChapter([chapter, subChapter, principle]);
  }, [chapter, subChapter, principle]);

  useEffect(() => {
    getContent();
  }, []);

  useEffect(() => {
    if (pathname.includes("self-assessment")) {
      setSideMenu("self-assessment");
    } else if (pathname.includes(params.chapters?.[0] || "")) {
      setSideMenu("questionnaire");
    }
  }, [pathname]);

  useEffect(() => {
    const chapters = getCompletedChapters(scoreObject) ?? [];
    setCompletedChapters(chapters);
    if (
      scoreObject["project-details"].contactEmail &&
      scoreObject.data.questionnaire &&
      scoreObject.data.questionnaire.length > 0
    ) {
      const jsonCookie = JSON.stringify(scoreObject);
      setCookie(
        `${scoreObject["project-details"].contactEmail}`,
        jsonCookie,
        0.15
      );
    }
  }, [scoreObject]);

  useEffect(() => {
    const maxScores: number[] = [];
    const maxZeroImpactValue: number[] = [];

    structure?.questionnaire.content;

    structure?.questionnaire.content.forEach((chapter, index) => {
      let maxValue = 0;
      let zeroImpactValue = 0;
      chapter?.["chapter-content"]?.forEach((subChapter) => {
        subChapter?.principles?.forEach((principle) => {
          maxValue += principle.choices[4].score;
          zeroImpactValue += principle.choices[3].score;
        });
      });
      maxScores.push(maxValue);
      maxZeroImpactValue.push(zeroImpactValue);
    });

    const avgMaxScore =
      maxScores.reduce((sum, value) => sum + value, 0) / maxScores.length;

    const avgZeroImpactScore =
      maxZeroImpactValue.reduce((sum, value) => sum + value, 0) /
      maxZeroImpactValue.length;

    setMaxValue(Math.round((avgMaxScore / avgZeroImpactScore) * 100));
  }, [scoreObject, structure]);

  return (
    <ApiContext.Provider
      value={{
        scoreObject,
        setScoreObject,
        completedChapters,
        structure,
        previousChapter,
        getCurrentChapter,
        setRegistrationPopup,
        registrationPopup,
        calculateScores,
        url,
        loginPopup,
        setLoginPopup,
        getContent,
        setIsTokenChecked,
        isTokenChecked,
        sideMenu,
        setSideMenu,
        loggedInChecked,
        setLoggedInChecked,
        selfAssessmentPopup,
        setSelfAssessmentPopup,
        selfAssessmentIsLoaded,
        setSelfAssessmentIsLoaded,
        isMounted,
        getAlternativeQuestionnaireData,
        loader,
        setLoader,
        changePasswordPopup,
        setChangePasswordPopup,
        deletePopup,
        setDeletePopup,
        addRenamePopup,
        setAddRenamePopup,
        projects,
        setProjects,
        userEmail,
        setUserEmail,
        getUserDashboardData,
        isPageChanged,
        getChaptersScores,
        pages,
        legendColors,
        current,
        setCurrent,
        maxValue,
        setMaxValue,
        initialScoreObject,
      }}>
      {children}
    </ApiContext.Provider>
  );
}

export { Store, useStore };
