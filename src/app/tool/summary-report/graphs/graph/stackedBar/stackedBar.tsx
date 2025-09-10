import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ScoreData } from "../../../page";
import { Graph } from "../graph";
import { structureProps } from "@/contexts/Store";
import styles from "./stackedBar.module.scss";

interface CustomYAxisTickProps {
  y: number;
  width: number;
  payload: {
    value: string | number;
  };
}

const CustomYAxisTick = (props: CustomYAxisTickProps) => {
  const { y, payload, width } = props;
  const dataPoints = [110, 270, 450];

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
  if (!height || height <= 0) return null; // <-- Hide if no value

  const radius = 10;
  const strokeColor = "#D3D4D4";
  const strokeWidth = 1;
  const overlap = 6;
  // Draw a rectangle with rounded top corners only

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
}: {
  parameters: ScoreData[];
  headline?: string;
  structure: structureProps;
}) {
  return (
    <Graph headline={headline} structure={structure}>
      <ResponsiveContainer
        width="100%"
        height={300}
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
          <XAxis dataKey="subChapterNumber" />
          <YAxis
            axisLine={false}
            tick={(props: CustomYAxisTickProps) => (
              <CustomYAxisTick {...props} />
            )}
            tickLine={false}
          />
          <Legend />
          <Bar
            radius={[10, 10, 0, 0]}
            dataKey="generalScore"
            stackId="a"
            fill="#8884d8"
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
            )}
          />
          {/* 
          <Bar
            radius={[10, 10, 0, 0]}
            dataKey="possibleScore"
            stackId="a"
            fill="rgba(123, 133, 139, 0.06)" // 0.6 is 60% opacity
          /> */}
          <Bar
            dataKey="generalScore"
            stackId="a"
            fill="rgba(123, 133, 139, 0.06)"
            shape={CustomTopBar}
          />
        </BarChart>
      </ResponsiveContainer>
    </Graph>
  );
}
