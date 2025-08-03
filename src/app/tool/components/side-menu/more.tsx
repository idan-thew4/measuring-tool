import styles from "./sideMenu.module.scss";
import Link from "next/link";
import { structureProps } from "../../../../contexts/Store";

export function More({ structure }: { structure: structureProps }) {
  return (
    <ul className={styles["more"]}>
      {structure?.sidebar["more"].map((option, index) => (
        <li key={index}>
          <Link className="paragraph_18" href={""}>
            {option}
          </Link>
        </li>
      ))}
    </ul>
  );
}
