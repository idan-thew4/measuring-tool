import styles from "./sideMenu.module.scss";
import Link from "next/link";
import clsx from "clsx";

export type SideMenuProps = {
  content: Step[];
  currentStep: string[];
};

export type ContentData = {
  content: Step[];
};

export type Step = {
  "step-number": number;
  "step-title": string;
  "step-slug": string;
  "step-content": SubStep[];
};

export type SubStep = {
  "sub-step-title": string;
  "sub-step-choices": string[];
};

export function SideMenu({ content, currentStep }: SideMenuProps) {
  return (
    <aside className={styles["side-menu"]}>
      <ul>
        {content.map((step, stepIndex) => (
          <li
            className={clsx(
              styles["step"],
              step["step-slug"] === currentStep[0] ? styles["active"] : ""
            )}
            key={stepIndex}
          >
            <Link href={`/tool/${step["step-slug"]}/1/1`}>
              {step["step-title"]}
            </Link>
            <ul className={styles["step-content"]}>
              {step["step-content"].map((subStep, subIndex) => (
                <li
                  key={subIndex}
                  className={
                    step["step-slug"] === currentStep[0] &&
                    subIndex + 1 === parseInt(currentStep[1])
                      ? styles["active"]
                      : ""
                  }
                >
                  <Link href={`/tool/${step["step-slug"]}/${subIndex + 1}/1`}>
                    {subStep["sub-step-title"]}
                  </Link>
                  <ul className={styles["sub-step-choices"]}>
                    {subStep["sub-step-choices"].map(
                      (subChoices, subChoicesIndex) => (
                        <li
                          key={subChoicesIndex}
                          className={
                            step["step-slug"] === currentStep[0] &&
                            subIndex + 1 === parseInt(currentStep[1]) &&
                            subChoicesIndex + 1 === parseInt(currentStep[2])
                              ? styles["active"]
                              : ""
                          }
                        >
                          {/* <p>{subChoices}</p> */}
                          <Link
                            href={`/tool/${step["step-slug"]}/${subIndex + 1}/${
                              subChoicesIndex + 1
                            }`}
                          >
                            {subChoices}
                          </Link>
                        </li>
                      )
                    )}
                  </ul>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </aside>
  );
}
