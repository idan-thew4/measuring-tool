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
  const [step, subStep, subStepChoice, scoreObject, completedSteps] =
    params?.params || [];
  const { structure } = useStore();

  if (!structure) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <SideMenu
        structure={structure}
        currentStep={[step, subStep, subStepChoice]}
      />
      <Questionnaire
        structure={structure}
        currentStep={[step, subStep, subStepChoice]}>
        {children}
      </Questionnaire>
    </>
  );
}
