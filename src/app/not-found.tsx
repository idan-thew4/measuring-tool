"use client";

import { Suspense } from "react";
import Custom404Inner from "./Custom404Inner";

export default function Custom404() {
  return (
    <Suspense>
      <Custom404Inner />
    </Suspense>
  );
}

// Custom404Inner.tsx
("use client");
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore } from "@/contexts/Store";

export default function Custom404Inner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const keyValue = searchParams.get("key");
  const loginValue = searchParams.get("login");
  const { setResetPasswordPopup, setParamsValue } = useStore();

  useEffect(() => {
    if (keyValue || loginValue) {
      setResetPasswordPopup(true);
      setParamsValue({ keyValue, login: loginValue });
    }
    router.replace("/tool/user-dashboard");
  }, [router, keyValue, loginValue]);

  return null;
}
