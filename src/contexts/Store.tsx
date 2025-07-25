"use client";

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
};

type PersonalDetails = {
  name: string;
  email: string;
};

//Structure types//

export type structureProps = {
  sidebar: sideBar;
  content: Step[];
};

type sideBar = {
  "progress-bar-headline": string;
  "bottom-options": string[];
  more: string[];
};

type contentPlaceholder = {
  "progress-bar-headline": string;
};

export type Step = {
  "step-number": number;
  "step-title": string;
  "step-slug": string;
  "step-content": SubStep[];
};

type SubStep = {
  "sub-step-title": string;
  "sub-step-choices": string[];
};

export type totalCompleted = {
  total: number;
  completed: number;
}[];

type ApiContextType = {
  scoreObject: ScoreType;
  setScoreObject: React.Dispatch<React.SetStateAction<ScoreType>>;
  completedSteps: totalCompleted;
  structure: structureProps | undefined;
};

const url = "http://localhost:3000/";

function Store({ children }: PropsWithChildren<{}>) {
  const [structure, setStructure] = useState<structureProps>();
  const [scoreObject, setScoreObject] = useState<ScoreType>({
    "personal-details": {
      name: "",
      email: "",
    },
    data: [],
  });
  const [completedSteps, setCompletedSteps] = useState<totalCompleted>([]);

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
          name: "Idan Portal",
          email: "mail@idanportal.com",
        },
        data: structureObject.content.map((step) => ({
          "step-number": step["step-number"],
          "step-data": step["step-content"].map((subStep, subIndex) => ({
            "sub-step-number": subIndex + 1,
            "sub-step-data": subStep["sub-step-choices"].map(
              (choice, choiceIndex) => ({
                id: choiceIndex + 1,
                choice: 0,
              })
            ),
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

      scoreObject.data.forEach((stepData, index) => {
        let completedSteps = 0;
        stepData["step-data"].forEach((subStep) => {
          subStep["sub-step-data"].forEach((subStepChoice) => {
            total++;
            if (subStepChoice.choice !== 0) {
              completedSteps++;
            }
          });
          // const allFilled = subStep["sub-step-data"].every(
          //   (choiceObj) => choiceObj.choice !== 0
          // );
          // if (allFilled) {
          //   completedSteps++;
          // }
        });

        totalCompletedSteps.push({
          total: total,
          completed: completedSteps,
        });
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
      scoreObject["personal-details"].email &&
      scoreObject.data &&
      scoreObject.data.length > 0
    ) {
      const jsonCookie = JSON.stringify(scoreObject);
      setCookie(`${scoreObject["personal-details"].email}`, jsonCookie, 0.15);
    }
  }, [scoreObject]);

  return (
    <ApiContext.Provider
      value={{ scoreObject, setScoreObject, completedSteps, structure }}>
      {children}
    </ApiContext.Provider>
  );
}

export { Store, useStore };
