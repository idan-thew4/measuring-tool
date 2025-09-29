"use client";

import { redirect, useParams } from "next/navigation";
import React, {
  createContext,
  useContext,
  PropsWithChildren,
  useState,
  useEffect,
} from "react";

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

//Score Object types//

export type ScoreType = {
  data: ScoreVariations;
  "personal-details": PersonalDetails;
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

export type PersonalDetails = {
  projectName: string;
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
};

type Login = {
  title: string;
  text: string[];
  "input-fields": RegistrationInputField[];
  "button-copy": string;
};

type SelfAssessment = {
  headline: string;
  "sub-headline": string;
  "summary-title": string;
  "graphs-headlines": string[];
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

type RegistrationStep = {
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

type ApiContextType = {
  scoreObject: ScoreType;
  setScoreObject: React.Dispatch<React.SetStateAction<ScoreType>>;
  completedChapters: totalCompleted;
  structure: structureProps | undefined;
  previousChapter?: string[];
  getCurrentChapter: (chapterSlug: string) => Chapter | undefined;
  setRegistrationStatus: React.Dispatch<React.SetStateAction<boolean>>;
  registrationStatus: boolean;
  calculateScores: (
    data: ChapterPoints[],
    graph: string,
    type: string,
    maxScoresOnly?: boolean
  ) => CalcParameters[];
  url: string;
  loginStatus: boolean;
  setLoginStatus: React.Dispatch<React.SetStateAction<boolean>>;
  setTokenValidated: React.Dispatch<React.SetStateAction<boolean>>;
  tokenValidated: boolean;
};

// const url = "http://localhost:3000/";
const url =
  "https://wordpress-1080689-5737105.cloudwaysapps.com/wp-json/slil-api";

function Store({ children }: PropsWithChildren<{}>) {
  const [structure, setStructure] = useState<structureProps>();
  const [scoreObject, setScoreObject] = useState<ScoreType>({
    "personal-details": {
      projectName: "",
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
  const [registrationStatus, setRegistrationStatus] = useState<boolean>(false);
  const [loginStatus, setLoginStatus] = useState<boolean>(false);
  const [tokenValidated, setTokenValidated] = useState<boolean>(true);

  useEffect(() => {
    setPreviousChapter([chapter, subChapter, principle]);
  }, [chapter, subChapter, principle]);

  async function validateToken() {
    try {
      const response = await fetch(`${url}/validate-token`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // "authorization": `Bearer ${Cookies.get('authToken')}`,
        },
        credentials: "include",
      });

      const data = await response.json();

      if (data) {
        getContent().then((structure) => {
          if (data.code === "missing_token") {
            setLoginStatus(true);

            redirect(
              `/tool/${structure?.questionnaire.content[0]["chapter-slug"]}/1/1`
            );
          }

          if (data.success) {
            setLoginStatus(false);
            setTokenValidated(true);
          }
        });
      }
    } catch (error) {
      console.error("Failed to validate token:", error);
    }
  }

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
    const cookies = getCookie(
      `${scoreObject["personal-details"].contactEmail}`
    );

    //To DO: // Remove specific email
    // const cookies = getCookie(`office@tdfmail.com`);

    if (cookies) {
      scoreObjectTemp = JSON.parse(cookies);
    } else {
      scoreObjectTemp = {
        "personal-details": {
          projectName: "",
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

  useEffect(() => {
    // getContent();
    validateToken();
  }, []);

  useEffect(() => {
    const chapters = getCompletedChapters(scoreObject) ?? [];
    setCompletedChapters(chapters);
    if (
      scoreObject["personal-details"].contactEmail &&
      scoreObject.data.questionnaire &&
      scoreObject.data.questionnaire.length > 0
    ) {
      setRegistrationStatus(false);
      const jsonCookie = JSON.stringify(scoreObject);
      setCookie(
        `${scoreObject["personal-details"].contactEmail}`,
        jsonCookie,
        0.15
      );
    }
  }, [scoreObject]);

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
          } else {
            const netZeroImpactScore = structurePrinciple?.choices?.[3];
            const maxScore = structurePrinciple?.choices?.[4];

            if (graph === "chapters") {
              calcParameters[index]["max-score"] += maxScore?.score ?? 0;
              calcParameters[index]["net-zero-impact"] +=
                netZeroImpactScore?.score ?? 0;
            } else if (graph === "subchapters") {
              subChapterObj["max-score"] += maxScore?.score ?? 0;
              subChapterObj["net-zero-impact"] +=
                netZeroImpactScore?.score ?? 0;
            }
          }
        });
        if (graph === "subchapters") {
          calcParameters.push(subChapterObj);
        }
      });
    });

    return calcParameters;
  }

  return (
    <ApiContext.Provider
      value={{
        scoreObject,
        setScoreObject,
        completedChapters,
        structure,
        previousChapter,
        getCurrentChapter,
        setRegistrationStatus,
        registrationStatus,
        calculateScores,
        url,
        loginStatus,
        setLoginStatus,
        setTokenValidated,
        tokenValidated,
      }}>
      {children}
    </ApiContext.Provider>
  );
}

export { Store, useStore };
