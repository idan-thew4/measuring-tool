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
import { useStore } from "@/contexts/Store";

export function RadarGraph({
  parameters,
  headline,
  filters,
  structure,
  imageGridURL,
  labels = true,
  preview = false,
  legend = true,
  negative = false,
  maxScore,
}: {
  parameters: ScoreData[];
  headline?: string;
  filters?: string[];
  structure: structureProps;
  imageGridURL: string;
  labels?: boolean;
  preview?: boolean;
  legend?: boolean;
  negative?: boolean;
  maxScore?: number;
}) {
  const colors = ["#79C5D8", "#979797"];
  const [dataKeys, setDataKeys] = useState<string[]>();
  const [filtersStatus, setFiltersStatus] = useState<{
    [key: string]: boolean;
  }>({
    assessment: false,
    questionnaire: true,
  });
  const { legendColors } = useStore();

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

    setDataKeys(tempDataKeys);
  }, [parameters]);

  // useEffect(() => {
  //   console.log("dataKey", dataKeys);
  // }, [dataKeys]);

  function getDataLabelColor(value: string | number, type: string) {
    switch (type) {
      case "assessment":
        return "#979797";
        break;
      case "questionnaire":
        if (Number(value) > 100) {
          return legendColors[3];
        } else if (Number(value) <= 100 && Number(value) >= 34) {
          return legendColors[2];
        } else if (Number(value) <= 35 && Number(value) >= 18) {
          return legendColors[1];
        } else {
          return legendColors[0];
        }
    }
  }

  return (
    <Graph
      headline={headline}
      structure={structure}
      legend={legend ? ["17%-0%", "33%-18%", "100%-34%", "100%<"] : false}
      preview={preview}
      negative={negative}
    >
      {filters && (
        <ul className={graphStyles["filters"]}>
          {dataKeys?.slice().map((filter, index) => (
            <li key={index} className={graphStyles["filter-item"]}>
              <label
                className={clsx("paragraph_14", graphStyles["filter-label"])}
              >
                <div
                  className={graphStyles["filter-color"]}
                  style={{
                    backgroundColor: colors[index],
                  }}
                ></div>
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
      )}

      <div className={styles["radar-graph-container"]}>
        <div className={styles["radar"]}>
          <Image
            src={imageGridURL}
            alt=""
            width={!preview ? 590 : 80}
            height={!preview ? 590 : 80}
            className={styles["radar-grid"]}
          />
          <RadarChart
            outerRadius={!preview ? 284 : 15}
            width={!preview ? 600 : 40}
            height={!preview ? 600 : 40}
            data={parameters}
            className={styles["radar"]}
          >
            <PolarRadiusAxis
              axisLine={false}
              tick={false}
              domain={typeof maxScore === "number" ? [0, maxScore] : undefined}
            />
            <PolarGrid radialLines={false} />
            {dataKeys &&
              dataKeys.map((dataKey, index) => {
                if (filtersStatus[dataKey]) {
                  return (
                    <Radar
                      animationDuration={300}
                      key={index}
                      name={dataKeys[index]}
                      dataKey={dataKeys[index]}
                      stroke={colors[index]}
                      strokeWidth={2}
                      fill={colors[index]}
                      fillOpacity={0.6}
                      {...(labels && {
                        label: ({
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
                              className={styles["data-label"]}
                            >
                              {value}%
                            </text>
                          </g>
                        ),
                      })}
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
