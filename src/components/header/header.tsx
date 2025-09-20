"use client";

import header from "./header.module.scss";
import Image from "next/image";
import { useStore } from "../../contexts/Store";

export function Header() {
  const { structure } = useStore();

  return (
    <header className={header.headerContainer}>
      <Image
        alt="Slil logo"
        src="/logo.svg"
        width={219}
        height={60}
        className="logo"
      />
      <nav>
        {/* {structure?.header["about-section"].map((link, index) => (
          <div key={index}>{link}</div>
        ))} */}
      </nav>
    </header>
  );
}
