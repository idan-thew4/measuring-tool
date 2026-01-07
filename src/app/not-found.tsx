"use client";

import { Suspense } from "react";
import NotFoundInner from "./NotFoundInner";

export default function Custom404() {
  return (
    <Suspense>
      <NotFoundInner />
    </Suspense>
  );
}
