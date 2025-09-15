"use client";

import { PolarGrid, PolarRadiusAxis, Radar, RadarChart } from "recharts";
import styles from "./radar.module.scss";
import graphStyles from "../graph.module.scss";
import { ScoreData } from "../../../page";
import { structureProps } from "@/contexts/Store";
import { useEffect, useState } from "react";
import React from "react";
import Image from "next/image";
import clsx from "clsx";
import { Graph } from "../graph";

export function RadarGraph({
  parameters,
  headline,
  filters,
  structure,
  imageGridURL,
}: {
  parameters: ScoreData[];
  headline?: string;
  filters?: string[];
  structure: structureProps;
  imageGridURL: string;
}) {
  const colors = ["#79C5D8", "#979797"];
  const legendColors = ["#00A9FF", "#0089CE", "#00679B", "#577686"];
  const [dataKeys, setDataKeys] = useState<string[]>();
  const [filtersStatus, setFiltersStatus] = useState<{
    [key: string]: boolean;
  }>({
    questionnaire: true,
    assessment: false,
  });
  const [maxValue, setMaxValue] = useState<number>();

  useEffect(() => {
    const tempDataKeys: string[] = [];
    if (parameters.length > 0) {
      parameters.forEach((parameter) => {
        Object.keys(parameter).forEach((key) => {
          if (key !== "subject" && !tempDataKeys.includes(key)) {
            tempDataKeys.push(key);
          }
        });
      });
    }

    const maxValue = Math.max(
      ...parameters.flatMap((param) =>
        Object.entries(param)
          .filter(
            ([key, value]) => key !== "subject" && typeof value === "number"
          )
          .map(([key, value]) => value as number)
      )
    );

    console.log("tempDataKeys", tempDataKeys);

    setMaxValue(maxValue);

    setDataKeys(tempDataKeys);
  }, [parameters]);

  function getDataLabelColor(value: string | number, type: string) {
    switch (type) {
      case "assessment":
        return "#979797";
        break;
      case "questionnaire":
        if (Number(value) > 100) {
          return legendColors[0];
        } else if (Number(value) <= 100 && Number(value) >= 33) {
          return legendColors[1];
        } else if (Number(value) <= 34 && Number(value) >= 18) {
          return legendColors[2];
        } else {
          return legendColors[3];
        }
    }
  }

  return (
    <Graph
      headline={headline}
      structure={structure}
      legend={["17%-0%", "33%-18%", "100%-34%", "100%<"]}>
      <ul className={graphStyles["filters"]}>
        {dataKeys?.slice().map((filter, index) => (
          <li key={index} className={graphStyles["filter-item"]}>
            <label
              className={clsx("paragraph_14", graphStyles["filter-label"])}>
              <div
                className={graphStyles["filter-color"]}
                style={{
                  backgroundColor: colors[index],
                }}></div>
              <input
                type="checkbox"
                checked={filtersStatus[filter] || false}
                onChange={() => {
                  setFiltersStatus((prev) => ({
                    ...prev,
                    [filter]: !prev[filter],
                  }));
                }}
              />
              {(filters ?? [])[index]}
            </label>
          </li>
        ))}
      </ul>
      <div className={styles["radar-graph-container"]}>
        <div className={styles["radar"]}>
          <Image
            src={imageGridURL}
            alt=""
            width={590}
            height={590}
            className={styles["radar-grid"]}
          />
          <RadarChart
            outerRadius={284}
            width={600}
            height={600}
            data={parameters}
            className={styles["radar"]}>
            <PolarRadiusAxis
              axisLine={false}
              tick={false}
              domain={typeof maxValue === "number" ? [0, maxValue] : undefined}
            />

            <PolarGrid radialLines={true} />
            {dataKeys &&
              dataKeys.map((dataKey, index) => {
                if (filtersStatus[dataKey]) {
                  return (
                    <Radar
                      key={index}
                      name={dataKeys[index]}
                      dataKey={dataKeys[index]}
                      stroke={colors[index]}
                      strokeWidth={2}
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
                          <rect
                            x={
                              x -
                              (Math.abs(Number(value)).toString().length > 2
                                ? 22
                                : 18)
                            }
                            y={y - 20}
                            width={
                              Math.abs(Number(value)).toString().length > 2
                                ? "45"
                                : "35"
                            }
                            height="17"
                            fill={getDataLabelColor(value, dataKeys[index])}
                            strokeWidth="2"
                            rx="8"
                          />
                          <text
                            x={x}
                            y={y - 10}
                            fill={"white"}
                            fontSize={12}
                            textAnchor="middle"
                            dominantBaseline="central"
                            className={styles["data-label"]}>
                            {value}%
                          </text>
                        </g>
                      )}
                    />
                  );
                }
              })}
            {/* <Legend />
          <Tooltip /> */}
          </RadarChart>
        </div>
      </div>
    </Graph>
  );
}
