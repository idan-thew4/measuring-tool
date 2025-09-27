"use client";
import { SideMenu } from "./components/side-menu/side-menu";
import { useStore, structureProps } from "../../contexts/Store";
import { useParams, redirect } from "next/navigation";
import { useEffect } from "react";

export default function ToolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const [chapter, subChapter, principle] = params?.chapters || [];
  const { structure, url } = useStore();

  // async function validateToken(structure: structureProps | undefined) {
  //   try {
  //     const response = await fetch(`${url}/wp-json/slil-api/validate-token`, {
  //       method: "GET",
  //       headers: {
  //         "Content-Type": "application/json",
  //         // "authorization": `Bearer ${Cookies.get('authToken')}`,
  //       },
  //       credentials: "include",
  //     });

  //     if (!response.ok) {
  //       redirect(
  //         `/tool/${structure?.questionnaire.content[0]["chapter-slug"]}/1/1`
  //       );
  //     }
  //     const data = await response.json();
  //     console.log("Token validation response:", data);
  //   } catch (error) {
  //     redirect(
  //       `/tool/${structure?.questionnaire.content[0]["chapter-slug"]}/1/1`
  //     );
  //   }
  // }

  // useEffect(() => {
  //   if (structure !== undefined) {
  //     validateToken(structure);
  //   }
  // }, [structure]);

  if (!structure) return <div>Loading...</div>;

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
