"use client";
import styles from "./registration-pop-up.module.scss";
import { useStore, totalCompleted } from "../../contexts/Store";
import { useEffect, useState } from "react";
import { ProgressBar } from "@/app/tool/components/progress-bar/progress-bar";
import clsx from "clsx";
import { useForm } from "react-hook-form";

type Inputs = {
  [key: string]: any;
};

export function RegistrationPopup() {
  const { structure } = useStore();
  const [completedSteps, setCompletedSteps] = useState<totalCompleted>();
  const [currentStep, setCurrentStep] = useState<number>(0);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm<Inputs>();

  useEffect(() => {
    if (structure) {
      const steps = structure.registration.steps.map((step, index) => ({
        completed: index === 0 ? 1 : 0,
        total: 1,
      }));
      setCompletedSteps(steps);
    }
  }, [structure]);

  const onSubmit = (data: Inputs) => {
    console.log("Form submitted with data:", data);
  };

  if (!structure) return <div>Loading...</div>;

  const step = structure.registration.steps[currentStep];

  return (
    <div className={styles["registration-pop-up-container"]}>
      <div className={styles["registration-pop-up"]}>
        <h2 className="headline_medium-big">{structure.registration.title}</h2>
        {completedSteps && (
          <ProgressBar completed={completedSteps} indicator={true} />
        )}
        <div>
          <h3 className="headline_medium-small bold">{step.title}</h3>
          <p className="paragraph_16">{step.description}</p>
          <p className={clsx(styles["validation"], "paragraph_16")}>
            {structure.registration["validation-general-copy"]}
          </p>
          <form onSubmit={handleSubmit((data) => onSubmit(data))}>
            {step["input-fields"].map((field, index) => (
              <div key={index}>
                <input
                  type={field.type ? field.type : "text"}
                  placeholder={field.name}
                  className={`row-${field.row}`}
                  {...register(field.name, {
                    required: field.mandatory
                      ? field["validation-error"]
                      : false,
                    pattern:
                      field.type === "email"
                        ? {
                            value:
                              /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                            message: field["validation-error"],
                          }
                        : field.type === "tel"
                        ? {
                            value: /^0\d{1,2}-?\d{7}$/,
                            message: field["validation-error"],
                          }
                        : undefined,
                  })}
                />
              </div>
            ))}
            <button type="submit">Sent</button>
          </form>
        </div>
      </div>
    </div>
  );
}
