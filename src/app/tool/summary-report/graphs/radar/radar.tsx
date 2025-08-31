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

export function RadarGraph({
  parameters,
  structure,
}: {
  parameters: ScoreData[];
  structure: structureProps;
}) {
  const colors = ["#00A9FF", "#0089CE", "#00679B", "#577686", "black"];

  const DataKeys = ["A", "B", "C", "D", "E"];

  //   {
  //     subject: "Math",
  //     A: 120,
  //     B: 110,
  //     fullMark: 150,
  //   },
  //   {
  //     subject: "Chinese",
  //     A: 98,
  //     B: 130,
  //     fullMark: 150,
  //   },
  //   {
  //     subject: "English",
  //     A: 86,
  //     B: 130,
  //     fullMark: 150,
  //   },
  //   {
  //     subject: "Geography",
  //     A: 99,
  //     B: 100,
  //     fullMark: 150,
  //   },
  //   {
  //     subject: "Physics",
  //     A: 85,
  //     B: 90,
  //     fullMark: 150,
  //   },
  //   {
  //     subject: "History",
  //     A: 65,
  //     B: 85,
  //     fullMark: 150,
  //   },
  // ];

  return (
    <div>
      <div className={styles["radar__frame"]}>
        <RadarChart
          outerRadius={200}
          width={500}
          height={500}
          data={parameters}
          className={styles["radar"]}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" axisLine={false} />
          <PolarRadiusAxis angle={30} domain={[0, 200]} />
          {parameters.map((param, index) => (
            <Radar
              key={index}
              name={
                parameters.length === index + 1
                  ? "אחוז הצלחה"
                  : structure.questionnaire.options[
                      parameters.length - (index + 1)
                    ]
              }
              dataKey={DataKeys[index]}
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
          <Legend />
          {/* <Tooltip /> */}
        </RadarChart>
      </div>
    </div>
  );
}
