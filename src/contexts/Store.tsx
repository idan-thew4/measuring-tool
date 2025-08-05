"use client";

import { useParams } from "next/navigation";
import React, {
  createContext,
  useContext,
  PropsWithChildren,
  useState,
  useEffect,
  useMemo,
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
  data?: StepPoints[];
  "personal-details": PersonalDetails;
};

type StepPoints = {
  "step-number": number;
  "step-data": SubStepPoints[];
};

type SubStepPoints = {
  "sub-step-number": number;
  "sub-step-data": ChoicePoints[];
};

type ChoicePoints = {
  id: number;
  choice: number;
  comment?: string;
};

type PersonalDetails = {
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
  content: Step[];
};

type sideBar = {
  "progress-bar-headline": string;
  "bottom-options": string[];
  more: string[];
};

export type Step = {
  "step-number": number;
  "step-title": string;
  "step-description": string;
  "step-slug": string;
  "step-content": SubStep[];
};

type SubStep = {
  "sub-step-title": string;
  "sub-step-description": string;
  "sub-steps": Choice[];
};

type Choice = {
  title: string;
  description: string;
  choices: { title: string; text: string }[];
  comment?: string;
};

export type totalCompleted = {
  total: number;
  completed: number;
  completedSteps?: number;
  totalSteps?: number;
}[];

type ApiContextType = {
  scoreObject: ScoreType;
  setScoreObject: React.Dispatch<React.SetStateAction<ScoreType>>;
  completedSteps: totalCompleted;
  structure: structureProps | undefined;
  previousStep?: string[];
  getCurrentStep: (stepSlug: string) => Step | undefined;
};

const url = "http://localhost:3000/";

function Store({ children }: PropsWithChildren<{}>) {
  const [structure, setStructure] = useState<structureProps>();
  const [scoreObject, setScoreObject] = useState<ScoreType>({
    "personal-details": {
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
    data: [],
  });
  const [completedSteps, setCompletedSteps] = useState<totalCompleted>([]);
  const [previousStepRef, setPreviousStepRef] = useState<string[]>([]);
  const params = useParams();
  const [step, subStep, subStepChoice] = params?.params || [];
  const [previousStep, setPreviousStep] = useState<string[] | undefined>();

  useEffect(() => {
    setPreviousStep([step, subStep, subStepChoice]);
  }, [step, subStep, subStepChoice]);

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
        data: structureObject.questionnaire.content.map((step) => ({
          "step-number": step["step-number"],
          "step-data": step["step-content"].map((subStep, subIndex) => ({
            "sub-step-number": subIndex + 1,
            "sub-step-data": subStep["sub-steps"].map((sub, subIndex) => ({
              id: subIndex + 1,
              choice: 0,
            })),
          })),
        })),
      };
    }

    setScoreObject(scoreObjectTemp);
    getCompletedSteps(scoreObjectTemp);
  }

  function getCompletedSteps(scoreObject: ScoreType) {
    let totalCompletedSteps: totalCompleted = [];
    if (scoreObject.data) {
      let total = 0;
      let completedSteps = 0;

      scoreObject.data.forEach((stepData, index) => {
        let completed = 0;
        stepData["step-data"].forEach((subStep) => {
          const allFilled = subStep["sub-step-data"].every(
            (choiceObj) => choiceObj.choice !== 0
          );
          subStep["sub-step-data"].forEach((subStepChoice) => {
            total++;
            if (subStepChoice.choice !== 0) {
              completed++;
            }
          });
          if (allFilled) {
            completedSteps++;
          }
        });

        totalCompletedSteps.push({
          total: total,
          completed: completed,
          completedSteps: completedSteps,
          totalSteps: stepData["step-data"].length,
        });

        total = 0;
        completedSteps = 0;
      });

      return totalCompletedSteps;
    }
  }

  useEffect(() => {
    getContent();
  }, []);

  useEffect(() => {
    const steps = getCompletedSteps(scoreObject) ?? [];
    setCompletedSteps(steps);
    if (
      scoreObject["personal-details"].projectName &&
      scoreObject.data &&
      scoreObject.data.length > 0
    ) {
      const jsonCookie = JSON.stringify(scoreObject);
      setCookie(
        `${scoreObject["personal-details"].projectName}`,
        jsonCookie,
        0.15
      );
    }
  }, [scoreObject]);

  const getCurrentStep = (stepSlug: string) => {
    return structure?.questionnaire.content.find(
      (structureStep) => structureStep["step-slug"] === stepSlug
    );
  };

  return (
    <ApiContext.Provider
      value={{
        scoreObject,
        setScoreObject,
        completedSteps,
        structure,
        previousStep,
        getCurrentStep,
      }}
    >
      {children}
    </ApiContext.Provider>
  );
}

export { Store, useStore };
