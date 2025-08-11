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

type TownRecord = {
  לשכה: string;
  סמל_ישוב: string;
  סמל_לשכת_מנא: number;
  סמל_מועצה_איזורית: number;
  סמל_נפה: number;
  שם_ישוב: string;
  שם_ישוב_לועזי: string;
  שם_מועצה: string | null;
  שם_נפה: string;
  _id: number;
};

export function RegistrationPopup() {
  const {
    structure,
    scoreObject,
    setScoreObject,
    registrationStatus,
    setRegistrationStatus,
  } = useStore();
  const [completedSteps, setCompletedSteps] = useState<totalCompleted>();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [data, setData] = useState<Inputs>({});
  const [showRegistrationPopup, setShowRegistrationPopup] =
    useState<boolean>(false);
  const [townsList, setTownsList] = useState<
    { value: string; label: string }[]
  >([]);
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<Inputs>();

  const step = structure?.registration.steps[currentStep];

  async function getTownList() {
    try {
      const response = await fetch(
        "https://data.gov.il/api/3/action/datastore_search?resource_id=5c78e9fa-c2e2-4771-93ff-7f400a12f7ba"
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      let TownsListTemp: { value: string; label: string }[] = [];

      data.result.records.forEach((record: TownRecord, index: number) => {
        if (index !== 0) {
          TownsListTemp.push({
            value: record.שם_ישוב,
            label: record.שם_ישוב,
          });
        }
      });

      setTownsList(TownsListTemp);
    } catch (error) {
      console.error("Failed to fetch content:", error);
    }
  }

  useEffect(() => {
    getTownList();

    if (structure) {
      const steps = structure.registration.steps.map((step, index) => ({
        completed: index === 0 ? 1 : 0,
        total: 1,
      }));
      setCompletedSteps(steps);
    }
  }, [structure]);

  useEffect(() => {
    if (step) {
      step["input-fields"].forEach((field, index) => {
        if (
          scoreObject["personal-details"] &&
          field.name in scoreObject["personal-details"]
        ) {
          setValue(
            field.name,
            (scoreObject["personal-details"] as Inputs)[field.name]
          );
        }
      });
    }
  }, [scoreObject, step]);

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
      setRegistrationStatus(false);
      setScoreObject((prev) => ({
        ...prev,
        "personal-details": updatedPersonalDetails,
      }));
    }
  };
  if (!registrationStatus) return null;
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
                        value={controllerField.value}
                        isSearchable={true}
                        // menuIsOpen={true}
                        options={
                          field.name === "localAuthority"
                            ? townsList
                            : field["dropdown-options"]
                        }
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
