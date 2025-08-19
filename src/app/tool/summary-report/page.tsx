"use client";

import { useStore } from "@/contexts/Store";
import { RadarGraph } from "./graphs/radar/radar";
import { useEffect, useState } from "react";

type ScoreData = {
  subject: string;
  fullMark: number;
} & {
  [key: string]: number | string;
};

export default function SummaryReport() {
  const { structure, scoreObject } = useStore();
  const [scores, setScores] = useState<{
    chapter: ScoreData[];
    subChapters: ScoreData[][];
  }>({
    chapter: [],
    subChapters: [],
  });

  useEffect(() => {
    console.log("Score Object:", scoreObject);
  }, [scoreObject]);

  return (
    <div>
      <RadarGraph />
    </div>
  );
}
