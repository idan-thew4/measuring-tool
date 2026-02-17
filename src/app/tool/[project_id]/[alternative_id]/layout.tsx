"use client";
import { SideMenu } from "./components/side-menu/side-menu";
import { useStore } from "../../../../contexts/Store";
import { useParams, useRouter, usePathname } from "next/navigation";
import { Loader } from "../../../../components/loader/loader";
import { useEffect } from "react";

export default function ToolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const [chapter, subChapter, principle] = params?.chapters || [];
  const { structure, sideMenu, setLoader } = useStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!params.chapters || params.chapters.length !== 3) {
      if (!pathname.includes("self-assessment")&&!pathname.includes("summary")&&!pathname.includes("summary-report")) {
        router.push("/tool/user-dashboard");
      }
    }

    setLoader(false);
  }, [params.chapters, router]);

  if (!structure) {
    return <Loader />;
  }

  return (
    <>
      <SideMenu
        structure={structure}
        currentChapter={[chapter, subChapter, principle]}
        type={sideMenu}
        project_id={Number(params.project_id)}
        alternative_id={Number(params.alternative_id)}
      />
      {children}
    </>
  );
}
