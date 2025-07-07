"use client";

import { useParams } from "next/navigation";
import { SideMenu } from "../side-menu/side-menu";
import copy from "../../../../public/data/content-placeholder.json";

export default function StepPage() {
  const params = useParams();
  // params?.params is an array: ["2"], ["2", "1"], ["2", "1", "1"], etc.

  // You can destructure for clarity:
  const [step, substep, option] = params?.params || [];

  // Use these to control which dropdowns/menus are open
  return (
    <div>
      <SideMenu content={copy.content} />
    </div>
  );
}
