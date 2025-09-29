"use client";
import { useParams } from "next/navigation";
import { useStore } from "../../../../../contexts/Store";
import { Questionnaire } from "./questionnaire/questionnaire";

export default function ChapterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const [chapter, subChapter, principle] = params?.chapters || [];
  const { structure } = useStore();

  if (!structure) {
    return <div>Loading...</div>;
  }

  return (
    <Questionnaire
      structure={structure}
      currentChapter={[chapter, subChapter, principle]}
      project_id={Number(params.project_id)}
      alternative_id={Number(params.alternative_id)}>
      {children}
    </Questionnaire>
  );
}
