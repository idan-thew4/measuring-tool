"use client";

import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  Tooltip,
  PolarRadiusAxis,
  Radar,
  RadarChart,
} from "recharts";
import styles from "./radar.module.scss";
import { ScoreData } from "../../page";
import { structureProps } from "@/contexts/Store";
import { useEffect, useState } from "react";

export function RadarGraph({
  parameters,
  structure,
}: {
  parameters: ScoreData[];
  structure: structureProps;
}) {
  const colors = ["#00A9FF", "grey", "black"];
  const [dataKeys, setDataKeys] = useState<string[]>();

  useEffect(() => {
    const tempDataKeys: string[] = [];
    if (parameters.length > 0) {
      parameters.forEach((parameter) => {
        Object.keys(parameter).forEach((key) => {
          if (
            key !== "subject" &&
            key !== "fullMark" &&
            !tempDataKeys.includes(key)
          ) {
            tempDataKeys.push(key);
          }
        });
      });
    }
    setDataKeys(tempDataKeys);
  }, [parameters]);

  useEffect(() => {
    console.log("Data Keys:", dataKeys);
  }, [dataKeys]);

  const DataNames = ["אחוז הצלחה", "הערכה אישית"];

  return (
    <div>
      {/* <svg
        width="500"
        height="500"
        viewBox="0 0 970 970"
        fill="none"
        xmlns="http://www.w3.org/2000/svg">
        <circle
          cx="494.684"
          cy="490.684"
          r="324.5"
          stroke="#0E2517"
          stroke-opacity="0.2"
        />
        <defs>
          <path
            id="circlePath"
            d="
      M 494.684,146.184
      a 344.5,344.5 0 1,1 0,689
      a 344.5,344.5 0 1,1 0,-689
    "
          />
        </defs>
        <text fontSize="24" fill="red">
          <textPath href="#circlePath" startOffset="10%">
            תכנון וביצוע
          </textPath>
          <textPath href="#circlePath" startOffset="30%">
            תכנון וביצוע
          </textPath>
          <textPath href="#circlePath" startOffset="60%">
            תכנון וביצוע
          </textPath>
        </text>
        <circle cx="484.773" cy="484.775" r="230.5" stroke="#393D3B" />
        <circle
          cx="484.773"
          cy="484.775"
          r="137.534"
          stroke="#0E2517"
          stroke-opacity="0.2"
          stroke-width="0.932432"
        />
        <circle
          cx="57"
          cy="57"
          r="56.5"
          transform="matrix(1 0 0 -1 427.773 541.775)"
          stroke="#0E2517"
          stroke-opacity="0.2"
        />
      </svg> */}
      <div className={styles["radar__frame"]}>
        <RadarChart
          outerRadius={200}
          width={500}
          height={500}
          data={parameters}
          className={styles["radar"]}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" axisLine={false} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} />

          {dataKeys &&
            dataKeys.map((param, index) => (
              <Radar
                key={index}
                name={DataNames[index]}
                dataKey={dataKeys[index]}
                stroke={colors[index]}
                fill={colors[index]}
                fillOpacity={0.6}
                label={({
                  value,
                  x,
                  y,
                }: {
                  value: number | string;
                  x: number;
                  y: number;
                }) => (
                  <g>
                    <circle cx={x} cy={y} r={4} fill={colors[index]} />
                    <text
                      x={x}
                      y={y - 10}
                      fill={colors[index]}
                      fontSize={14}
                      textAnchor="middle"
                      dominantBaseline="central">
                      {value}
                    </text>
                  </g>
                )}
              />
            ))}

          {/* <Legend />
          <Tooltip /> */}
        </RadarChart>
      </div>
    </div>
  );
}
