// import styles from "./side-menu.module.scss";

export type ContentData = {
  content: Step[];
};

export type Step = {
  "step-number": number;
  "step-title": string;
  "step-content": SubStep[];
};

export type SubStep = {
  "sub-step-title": string;
  "sub-step-choices": [];
};

export function SideMenu({ content }: ContentData) {
  return (
    <aside>
      <ul>
        {content.map((step, stepIndex) => (
          <li className={step["step-title"]} key={stepIndex}>
            <p>{step["step-title"]}</p>
            <ul className="step-content">
              {step["step-content"].map((subStep, subIndex) => (
                <li key={subIndex}>
                  <p>{subStep["sub-step-title"]}</p>
                  <ul className="choices">
                    {subStep["sub-step-choices"].map(
                      (subChoices, subChoicesIndex) => (
                        <li key={subChoicesIndex}>
                          <p>{subChoices}</p>
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
