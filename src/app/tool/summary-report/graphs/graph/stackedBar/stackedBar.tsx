import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { ScoreData } from "../../../page";
import { Graph } from "../graph";
import { structureProps } from "@/contexts/Store";
import styles from "./stackedBar.module.scss";
import graphStyles from "../graph.module.scss";

import clsx from "clsx";
import { set } from "react-hook-form";

interface CustomYAxisTickProps {
  y: number;
  width: number;
  payload: {
    value: string | number;
  };
}

const CustomYAxisTick = (props: CustomYAxisTickProps) => {
  const { y, payload, width } = props;
  const remToPx = (rem: number) =>
    rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
  const dataPoints = [10, 45, 80].map(remToPx); // 110px, 270px, 450px if 1rem = 16px

  console.log(
    "rem",
    parseFloat(getComputedStyle(document.documentElement).fontSize)
  );

  return (
    <>
      {dataPoints.map((chartMiddle: number) => (
        <g key={chartMiddle} transform={`translate(${chartMiddle},${y})`}>
          <rect
            x={-10}
            y={-5}
            dy={0}
            fill="white"
            width={
              Math.abs(Number(payload.value)).toString().length > 2
                ? "30"
                : "20"
            }
            height={10}></rect>
          <text
            x={0}
            y={4}
            dy={0}
            textAnchor="middle"
            fill="#CFD3D1"
            fontWeight="bold"
            fontSize={10}>
            {payload.value}
          </text>
        </g>
      ))}
    </>
  );
};

const CustomTopBar = (props: any) => {
  const { x, y, width, height, fill } = props;
  if (!height || height <= 0) return <g />;

  const radius = 10;
  const strokeColor = "#D3D4D4";
  const strokeWidth = 1;
  const { payload } = props;
  const overlap = payload && payload.generalScore === 0 ? 0 : 8;

  const barPath = `
    M${x},${y + height + overlap}
    L${x},${y + radius}
    Q${x},${y} ${x + radius},${y}
    L${x + width - radius},${y}
    Q${x + width},${y} ${x + width},${y + radius}
    L${x + width},${y + height + overlap}
    Z
  `;

  const borderPath = `
    M${x},${y + height + overlap}
    L${x},${y + radius}
    Q${x},${y} ${x + radius},${y}
    L${x + width - radius},${y}
    Q${x + width},${y} ${x + width},${y + radius}
    L${x + width},${y + height + overlap}
  `;

  return (
    <g>
      <path d={barPath} fill={fill} />
      <path
        d={borderPath}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />
    </g>
  );
};

export function StackedBar({
  parameters,
  headline,
  structure,
  filters,
}: {
  parameters: ScoreData[];
  headline?: string;
  structure: structureProps;
  filters?: string[];
}) {
  const [filtersStatus, setFiltersStatus] = useState<boolean>(false);
  const [maxValue, setMaxValue] = useState<number>();
  const [legend, setLegend] = useState<string[]>([]);
  const [barData, setBarData] =
    useState<{ chapter: string; subChapters: number }[]>();
  const [gridColumns, setGridColumns] = useState<{ gridColumn: string }[]>();

  useEffect(() => {
    const maxValue = Math.max(
      ...parameters.map(
        (item) =>
          Number(item.generalScore ?? 0) + Number(item.possibleScore ?? 0)
      )
    );

    setMaxValue(maxValue);
  }, [parameters]);

  useEffect(() => {
    const content = structure.questionnaire.content;
    const sums = Array(content.length).fill(0);
    const counts = Array(content.length).fill(0);
    const barDataTemp: { chapter: string; subChapters: number }[] = [];
    let previousSubChapters = "";
    content.forEach((chapter) =>
      chapter["chapter-content"].forEach((sub) => {
        if (previousSubChapters !== chapter["chapter-title"]) {
          barDataTemp.push({
            chapter: chapter["chapter-title"],
            subChapters: chapter["chapter-content"].length,
          });
        }
        previousSubChapters = chapter["chapter-title"];

        sub.principles.forEach((principle) =>
          principle.choices.forEach((choice, idx) => {
            if (typeof choice.score === "number") {
              sums[idx] += choice.score;
              counts[idx]++;
            }
          })
        );
      })
    );

    const avgs = sums.map((sum, idx) => (counts[idx] ? sum / counts[idx] : 0));

    let legendTemp: string[] = [];
    let increase = 0;

    avgs.forEach((avgScore, index) => {
      if (increase > 1) {
        increase = 1;
      }
      if (index === 0) return;
      if (index === avgs.length - 1) {
        legendTemp.push(`${avgs[index]}`);
      } else {
        legendTemp.push(`${avgs[index] + increase} - ${avgs[index + 1]}`);
      }

      increase++;
    });

    let start = 1;
    const gridColumnsTemp = barDataTemp.map((bar) => {
      const end = start + bar.subChapters;
      const style = { gridColumn: `${start}/${end}` };
      start = end;
      return style;
    });

    setLegend(legendTemp);
    setBarData(barDataTemp);
    setGridColumns(gridColumnsTemp);
  }, []);

  function getBarColor(value: number) {
    if (value >= 10) return "#00A9FF";
    if (value >= 6) return "#0089CE";
    if (value >= 2) return "#00679B";
    return "#577686";
  }

  return (
    <Graph headline={headline} structure={structure} legend={legend}>
      <ul className={graphStyles["filters"]}>
        <li key={0} className={graphStyles["filter-item"]}>
          <label className={clsx("paragraph_14", graphStyles["filter-label"])}>
            <input
              type="checkbox"
              checked={filtersStatus || false}
              onChange={() => {
                setFiltersStatus((prev) => !prev);
              }}
            />
            {(filters ?? [])[0]}
          </label>
        </li>
      </ul>
      <ResponsiveContainer
        width="100%"
        height={200}
        className={styles["responsive-container"]}>
        <BarChart
          className={styles["bar-chart"]}
          data={parameters}
          margin={{
            top: 0,
            right: 0,
            left: -60,
            bottom: 0,
          }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="subChapterNumber" axisLine={false} tickLine={false} />
          <YAxis
            axisLine={false}
            tick={(props: CustomYAxisTickProps) => (
              <CustomYAxisTick {...props} />
            )}
            tickLine={false}
            domain={typeof maxValue === "number" ? [0, maxValue] : undefined}
          />

          {filtersStatus && (
            <Bar
              dataKey="possibleScore"
              stackId="a"
              fill="rgba(123, 133, 139, 0.06)"
              shape={CustomTopBar}
            />
          )}
          <Bar
            radius={[10, 10, 0, 0]}
            dataKey="generalScore"
            stackId="a"
            label={({
              x,
              y,
              width,
              value,
            }: {
              x?: number;
              y?: number;
              width?: number;
              value?: string | number;
            }) => (
              <text
                x={x !== undefined && width !== undefined ? x + width / 2 : 0}
                y={y !== undefined ? y - 10 : 0}
                textAnchor="middle"
                fill="#black"
                fontWeight="bold"
                fontSize="1rem">
                {value}
              </text>
            )}>
            {parameters.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={getBarColor(Number(entry.generalScore))}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {barData && barData.length > 0 && (
        <ul
          className={styles["data-bar"]}
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${parameters.length}, 1fr)`,
          }}>
          {barData.map((bar, idx) => (
            <li
              className={clsx("paragraph_11", styles["data-bar-item"])}
              key={bar.chapter}
              style={gridColumns?.[idx] ?? {}}>
              {bar.chapter}
            </li>
          ))}
        </ul>
      )}
    </Graph>
  );
}
