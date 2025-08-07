"use client";
import styles from "./registration-pop-up.module.scss";
import { useStore, totalCompleted } from "../../contexts/Store";
import { useEffect, useState } from "react";
import { ProgressBar } from "@/app/tool/components/progress-bar/progress-bar";
import clsx from "clsx";
import { useForm, Controller, set } from "react-hook-form";
import Select from "react-select";

type Inputs = {
  [key: string]: string | { value: string; label: string } | boolean;
};

export function RegistrationPopup() {
  const { structure, scoreObject, setScoreObject } = useStore();
  const [completedSteps, setCompletedSteps] = useState<totalCompleted>();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [data, setData] = useState<Inputs>({});

  const {
    register,
    handleSubmit,
    setValue,
    control,
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

  const onSubmit = (stepData: Inputs, index: number) => {
    const updatedPersonalDetails = {
      ...scoreObject["personal-details"],
      ...stepData,
    };
    setData(updatedPersonalDetails);
    if (completedSteps && index !== completedSteps.length - 1) {
      setCurrentStep(index + 1);
      setCompletedSteps((prev) => {
        if (!prev) return prev;
        const newSteps = [...prev];
        newSteps[index + 1] = {
          ...newSteps[index + 1],
          completed: 1,
        };
        return newSteps;
      });
    } else {
      setScoreObject((prev) => ({
        ...prev,
        "personal-details": updatedPersonalDetails,
      }));
    }
  };

  const step = structure?.registration.steps[currentStep];

  useEffect(() => {
    if (step) {
      step["input-fields"].forEach((field, index) => {
        if (
          scoreObject["personal-details"] &&
          field.name in scoreObject["personal-details"]
        ) {
          setValue(
            field.name,
            (scoreObject["personal-details"] as Record<string, any>)[field.name]
          );
        }
      });
    }
  }, [scoreObject, step]);

  if (!structure || !step) return <div>Loading...</div>;

  return (
    <div className={styles["registration-pop-up-container"]}>
      <div className={styles["registration-pop-up"]}>
        <h2 className="headline_medium-big">{structure.registration.title}</h2>
        {completedSteps && (
          <ProgressBar completed={completedSteps} indicator={true} />
        )}
        <div className={styles["form-container"]}>
          <div>
            <h3
              className={clsx(
                "headline_medium-small bold",
                styles["headline"]
              )}>
              {step.title}
            </h3>
            <p className="paragraph_16">{step.description}</p>
            <p className={clsx(styles["validation"], "paragraph_16")}>
              {structure.registration["validation-general-copy"]}
            </p>
          </div>
          <form onSubmit={handleSubmit((data) => onSubmit(data, currentStep))}>
            {step["input-fields"].map((field, index) => (
              <div
                className={clsx(
                  styles["field"],
                  styles["row"],
                  styles[`row-${field.row}`]
                )}
                key={index}>
                {field["dropdown-options"] ? (
                  <Controller
                    name={field.name}
                    control={control}
                    rules={{
                      required: field.mandatory
                        ? field["validation-error"]
                        : false,
                    }}
                    render={({ field: controllerField }) => (
                      <Select
                        className="dropdown paragraph_18"
                        classNamePrefix={"dropdown"}
                        placeholder={`${field.label}${
                          field.mandatory ? " *" : ""
                        }`}
                        isClearable={true}
                        isSearchable={true}
                        // menuIsOpen={true}
                        options={field["dropdown-options"]}
                        onChange={(option) =>
                          controllerField.onChange(option ? option : null)
                        }
                      />
                    )}
                  />
                ) : field.type !== "checkbox" ? (
                  <input
                    type={field.type ? field.type : "text"}
                    placeholder={`${field.label}${field.mandatory ? " *" : ""}`}
                    className="paragraph_18"
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
                ) : (
                  <Controller
                    name={field.name}
                    control={control}
                    rules={{
                      required: field.mandatory
                        ? field["validation-error"]
                        : false,
                    }}
                    render={({ field: controllerField }) => (
                      <label className={styles["checkbox-label"]}>
                        <input
                          type="checkbox"
                          checked={!!controllerField.value}
                          onChange={(e) =>
                            controllerField.onChange(e.target.checked)
                          }
                        />
                        <span className="paragraph_14">
                          {field.label}
                          {field.mandatory ? " *" : ""}
                        </span>
                      </label>
                    )}
                  />
                )}

                {typeof errors[field.name]?.message === "string" ? (
                  <span className={styles["error-message"]}>
                    {errors[field.name]?.message as string}
                  </span>
                ) : null}
              </div>
            ))}
            <button
              className={styles["submit-button"]}
              type="submit"
              disabled={Object.keys(errors).length > 0}>
              {structure.registration["nav-buttons"][currentStep]}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
