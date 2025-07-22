"use client";
import { useParams } from "next/navigation";
import { SideMenu } from "../side-menu/side-menu";
import { useStore, structureProps } from "../../../contexts/Store";
import { Questionnaire } from "../questionnaire/questionnaire";

export type structureAndStepsProps = {
  structure: structureProps | undefined;
  currentStep: string[];
};

export default function StepLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const [step, subStep, subStepChoice] = params?.params || [];
  const { structure } = useStore();

  if (!structure || !structure.content) {
    <div>Loading</div>;
  }
  return (
    <>
      <SideMenu
        structure={structure}
        currentStep={[step, subStep, subStepChoice]}
      />
      <Questionnaire
        structure={structure}
        currentStep={[step, subStep, subStepChoice]}
      >
        {children}
      </Questionnaire>
    </>
  );
}
