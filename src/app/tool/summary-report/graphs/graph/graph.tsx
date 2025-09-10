"use client";

import styles from "./graph.module.scss";
import { structureProps } from "@/contexts/Store";
import React from "react";
import clsx from "clsx";

export function Graph({
  headline,
  structure,
  children,
}: {
  headline?: string;
  structure: structureProps;
  children: React.ReactNode;
}) {
  const legendColors = ["#00A9FF", "#0089CE", "#00679B", "#577686"];

  function getPercentage(index: number) {
    switch (index) {
      case 1:
        return "17%-0%";
      case 2:
        return "33%-18%";
      case 3:
        return "100%-34%";
      case 4:
        return ">100%";
    }
  }

  return (
    <div className={styles["container"]}>
      <h2 className={clsx("medium-small", styles["title"])}>{headline}</h2>
      {children}
      <ul className={styles["radar-legend"]}>
        {structure.questionnaire.options.map((option, index) => {
          if (index === 0) return null;
          return (
            <li key={index} className={styles["legend-item"]}>
              <p className={clsx("paragraph_14", styles["text"])}>{option}</p>
              <p
                style={{ backgroundColor: legendColors[index - 1] }}
                className={clsx("paragraph_12", styles["percentage"])}>
                {getPercentage(index)}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
