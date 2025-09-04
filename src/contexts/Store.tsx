"use client";

import { useParams } from "next/navigation";
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
  assessment: ChapterPoints[];
};

export type ChapterPoints = {
  "chapter-number": number;
  "chapter-data": SubChapterPoints[];
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

type PersonalDetails = {
  date: number;
  projectName: string;
  localAuthority: string;
  projectType: string;
  projectSubType: string;
  projectArea: string;
  projectStatus: string;
  projectStartYear: string;
  projectEndYear: string;
  professionalTraining: string;
  planningTeamRole: string;
  yearsOfExperience: string;
  education: string;
  gender: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  planningOffice: string;
  evaluationExecutor: string;
  "data-agreement": string;
};

//Structure types//

export type structureProps = {
  sidebar: sideBar;
  questionnaire: questionnaire;
  registration: Registration;
  summary: Summary;
  "summary-report": SummaryReport;
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
    columns: string[];
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
  totalChapters?: number;
}[];

type ApiContextType = {
  scoreObject: ScoreType;
  setScoreObject: React.Dispatch<React.SetStateAction<ScoreType>>;
  completedChapters: totalCompleted;
  structure: structureProps | undefined;
  previousChapter?: string[];
  getCurrentChapter: (chapterSlug: string) => Chapter | undefined;
  setRegistrationStatus: React.Dispatch<React.SetStateAction<boolean>>;
  registrationStatus: boolean;
};

const url = "http://localhost:3000/";

function Store({ children }: PropsWithChildren<{}>) {
  const [structure, setStructure] = useState<structureProps>();
  const [scoreObject, setScoreObject] = useState<ScoreType>({
    "personal-details": {
      date: Date.now(),
      projectName: "",
      localAuthority: "",
      projectType: "",
      projectSubType: "",
      projectArea: "",
      projectStatus: "",
      projectStartYear: "",
      projectEndYear: "",
      professionalTraining: "",
      planningTeamRole: "",
      yearsOfExperience: "",
      education: "",
      gender: "",
      contactPerson: "",
      contactEmail: "",
      contactPhone: "",
      planningOffice: "",
      evaluationExecutor: "",
      "data-agreement": "",
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

  useEffect(() => {
    setPreviousChapter([chapter, subChapter, principle]);
  }, [chapter, subChapter, principle]);

  async function getContent() {
    try {
      const response = await fetch(`${url}/api/temp`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      setStructure(data);
      createScoreObject(data);
    } catch (error) {
      console.error("Failed to fetch content:", error);
    }
  }

  function createScoreObject(structureObject: structureProps) {
    let scoreObjectTemp: ScoreType;
    // const cookies = getCookie(`${scoreObject["personal-details"].email}`);
    const cookies = getCookie(`mail@idanportal.com`);

    if (cookies) {
      scoreObjectTemp = JSON.parse(cookies);
    } else {
      scoreObjectTemp = {
        "personal-details": {
          date: Date.now(),
          projectName: "",
          localAuthority: "",
          projectType: "",
          projectSubType: "",
          projectArea: "",
          projectStatus: "",
          projectStartYear: "",
          projectEndYear: "",
          professionalTraining: "",
          planningTeamRole: "",
          yearsOfExperience: "",
          education: "",
          gender: "",
          contactPerson: "",
          contactEmail: "",
          contactPhone: "",
          planningOffice: "",
          evaluationExecutor: "",
          "data-agreement": "",
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
          assessment: structureObject.questionnaire.content.map((chapter) => ({
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
          })),
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

      scoreObject.data.questionnaire.forEach((chapterData, index) => {
        let completed = 0;
        chapterData["chapter-data"].forEach((subChapter) => {
          const allFilled = subChapter["principles"].every(
            (choiceObj) => choiceObj.choice !== undefined
          );
          subChapter["principles"].forEach((subChapterChoice) => {
            total++;
            if (subChapterChoice.choice !== undefined) {
              completed++;
            }
          });
          if (allFilled) {
            completedChapters++;
          }
        });

        totalCompletedChapters.push({
          total: total,
          completed: completed,
          completedChapters: completedChapters,
          totalChapters: chapterData["chapter-data"].length,
        });

        total = 0;
        completedChapters = 0;
      });

      return totalCompletedChapters;
    }
  }

  useEffect(() => {
    getContent();
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
      }}>
      {children}
    </ApiContext.Provider>
  );
}

export { Store, useStore };
