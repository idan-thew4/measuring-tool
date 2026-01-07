"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore } from "@/contexts/Store";

export default function Custom404() {
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
