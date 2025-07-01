import { Header } from "@/components/header/header";
import { Main } from "next/document";

export default function Home() {
  return (
    <div>
      <Header />
      <Main />
      <footer>Footer</footer>
    </div>
  );
}
