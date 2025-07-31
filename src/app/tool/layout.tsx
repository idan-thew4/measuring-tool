"use client";
import { SideMenu } from "./side-menu/side-menu";
import { useStore } from "../../contexts/Store";
import { useParams } from "next/navigation";

export default function ToolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const [step, subStep, subStepChoice] = params?.params || [];
  const { structure } = useStore();

  if (!structure) return <div>Loading...</div>;

  return (
    <>
      <SideMenu
        structure={structure}
        currentStep={[step, subStep, subStepChoice]}
      />
      {children}
    </>
  );
}
