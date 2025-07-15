"use client";

import React, {
  createContext,
  useContext,
  PropsWithChildren,
  useState,
  useEffect,
} from "react";
import structure from "../../public/data/content-placeholder.json";
import { get } from "http";

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

type structureProps = {
  content: Step[];
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

type ApiContextType = {
  scoreObject: ScoreType;
  setScoreObject: React.Dispatch<React.SetStateAction<ScoreType>>;
  calculateProgress: (
    currentScore: ScoreType
  ) => { totalChoices: number; filledChoices: number }[];
};

function Store({ children }: PropsWithChildren<{}>) {
  const [scoreObject, setScoreObject] = useState<ScoreType>({
    "personal-details": {
      name: "",
      email: "mail@idanportal.com",
    },
    data: [],
  });

  function createScoreObject(structureObject: structureProps) {
    let scoreObjectTemp: ScoreType;
    const cookies = getCookie(`${scoreObject["personal-details"].email}`);

    if (cookies) {
      scoreObjectTemp = JSON.parse(cookies);
    } else {
      scoreObjectTemp = {
        "personal-details": scoreObject["personal-details"],
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
  }

  function calculateProgress(currentScore: ScoreType) {
    if (!currentScore.data) return [];
    return currentScore.data.map((step) => {
      let totalChoices = 0;
      let filledChoices = 0;
      step["step-data"].forEach((subStep) => {
        totalChoices += subStep["sub-step-data"].length;
        filledChoices += subStep["sub-step-data"].filter(
          (choiceObj) => choiceObj.choice !== 0
        ).length;
      });
      return {
        totalChoices,
        filledChoices,
      };
    });
  }

  useEffect(() => {
    createScoreObject(structure);
  }, []);

  useEffect(() => {
    const jsonCookie = JSON.stringify(scoreObject);
    setCookie(`${scoreObject["personal-details"].email}`, jsonCookie, 0.15);
  }, [scoreObject]);

  useEffect(() => {
    console.log("Score Object Updated:", scoreObject);
  }, [scoreObject]);

  return (
    <ApiContext.Provider
      value={{ scoreObject, setScoreObject, calculateProgress }}
    >
      {children}
    </ApiContext.Provider>
  );
}

export { Store, useStore };
