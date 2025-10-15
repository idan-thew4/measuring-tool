import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Custom404() {
  const router = useRouter();

  console.log("404");

  useEffect(() => {
    // Redirect to the desired page for non-existent URLs
    router.replace("/tool/user-dashboard");
  }, [router]);

  return null; // Optionally, you can show a loading spinner or message
}
