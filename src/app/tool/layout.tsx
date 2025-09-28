"use client";
import { SideMenu } from "./components/side-menu/side-menu";
import { useStore } from "../../contexts/Store";
import { useParams } from "next/navigation";

export default function ToolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const [chapter, subChapter, principle] = params?.chapters || [];
  const { structure, tokenValidated } = useStore();

  console.log("tokenValidated", params);

  if (!structure || (!tokenValidated && !params.chapters)) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <SideMenu
        structure={structure}
        currentChapter={[chapter, subChapter, principle]}
      />
      {children}
    </>
  );
}
