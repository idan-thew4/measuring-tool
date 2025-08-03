"use client";
import { useParams } from "next/navigation";
import { useStore } from "../../../contexts/Store";
import { Questionnaire } from "./questionnaire/questionnaire";

export default function StepLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const [step, subStep, subStepChoice] = params?.params || [];
  const { structure } = useStore();

  if (!structure) {
    return <div>Loading...</div>;
  }

  return (
    <Questionnaire
      structure={structure}
      currentStep={[step, subStep, subStepChoice]}>
      {children}
    </Questionnaire>
  );
}
