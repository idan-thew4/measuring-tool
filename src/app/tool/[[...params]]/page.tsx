"use client";

import { useParams } from "next/navigation";
import { SideMenu } from "../side-menu/side-menu";
import structure from "../../../../public/data/content-placeholder.json";

export default function StepPage() {
  const params = useParams();

  const [step, subStep, subStepChoice] = params?.params || [];

  return (
    <>
      <SideMenu
        content={structure.content}
        currentStep={[step, subStep, subStepChoice]}
      />
    </>
  );
}
