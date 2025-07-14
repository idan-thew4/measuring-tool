"use client";

import React, {
  createContext,
  useContext,
  PropsWithChildren,
  useState,
} from "react";
import points from "../../public/data/points-placeholder.json";

const ApiContext = createContext<ApiContextType | undefined>(undefined);

function useStore() {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error("useStore should be used within ApiContext only");
  }
  return context;
}

type PointsData = {
  data: StepPoints[];
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

type ApiContextType = {
  score: PointsData | undefined;
  setScore: React.Dispatch<React.SetStateAction<PointsData | undefined>>;
};

function Store({ children }: PropsWithChildren<{}>) {
  const [score, setScore] = useState<PointsData | undefined>(
    points as PointsData
  );

  return (
    <ApiContext.Provider value={{ score, setScore }}>
      {children}
    </ApiContext.Provider>
  );
}

export { Store, useStore };
