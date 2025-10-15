"use client";

import styles from "./graph.module.scss";
import { structureProps, useStore } from "@/contexts/Store";
import React from "react";
import clsx from "clsx";

export function Graph({
  headline,
  structure,
  children,
  legend,
  preview = false,
  negative = false,
  literalLegend = false,
  radarRef,
}: {
  headline?: string;
  structure: structureProps;
  children: React.ReactNode;
  legend: string[] | false;
  preview?: boolean;
  negative?: boolean;
  literalLegend?: boolean;
  radarRef: React.RefObject<HTMLDivElement>;
}) {
  const { legendColors } = useStore();

  return (
    <div
      className={clsx(
        styles["container"],
        preview && styles["preview"],
        negative && styles["negative"]
      )}
      ref={radarRef}>
      {headline && (
        <h2 className={clsx("medium-small", styles["title"])}>{headline}</h2>
      )}
      {children}
      {legend && (
        <ul className={styles["legend"]}>
          {structure.questionnaire.options.map((option, index) => {
            if (index === 0) return null;
            return (
              <li key={index} className={styles["legend-item"]}>
                {!literalLegend && (
                  <p className={clsx("paragraph_14", styles["text"])}>
                    {option}
                  </p>
                )}
                <p
                  style={{ backgroundColor: legendColors[index - 1] }}
                  className={clsx("paragraph_12", styles["percentage"])}>
                  {legend[index - 1]}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
