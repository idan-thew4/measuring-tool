"use client";
import { useParams } from "next/navigation";

export default function StepLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { stepId } = useParams();

  return (
    <div>
      ??
      {children}
    </div>
  );
}
