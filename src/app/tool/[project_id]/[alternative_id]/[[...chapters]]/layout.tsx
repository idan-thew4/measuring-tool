"use client";
import { useParams } from "next/navigation";
import { useStore } from "../../../../../contexts/Store";
import { Questionnaire } from "./questionnaire/questionnaire";
import { Loader } from "../../../../../components/loader/loader";

export default function ChapterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const [chapter, subChapter, principle] = params?.chapters || [];
  const { structure } = useStore();

  if (!structure) {
    return <Loader />;
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
