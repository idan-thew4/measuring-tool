import Image from "next/image";
import styles from "./loader.module.scss";

export function Loader() {
  return (
    <div className={styles["loader-container"]}>
      <Image
        width={100}
        height={100}
        src={"/icons/loader.svg"}
        alt="loading"
        className={styles.loader}
      />
    </div>
  );
}
