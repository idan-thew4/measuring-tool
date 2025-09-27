"use client";
import formStyles from "../popUps/popUpContainer/form.module.scss";
import { useStore, totalCompleted } from "../../contexts/Store";
import { useEffect, useState } from "react";
import { ProgressBar } from "@/app/tool/components/progress-bar/progress-bar";
import clsx from "clsx";
import { useForm, Controller, set } from "react-hook-form";
import Select from "react-select";
import { PopUpContainer } from "../popUps/popUpContainer/popUpContainer";

type Inputs = {
  [key: string]: string | { value: string; label: string } | boolean | number;
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
    url,
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
    watch,
    setError,

    formState: { errors },
  } = useForm<Inputs>();
  const [loading, setLoading] = useState<boolean>(false);
  const [generalError, setGeneralError] = useState<string>("");

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

  async function createNewUser(email: string, password: string) {
    setLoading(true);
    try {
      const response = await fetch(`${url}/create-new-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        setLoading(false);
        return true;
      } else {
        if (data.message) {
          setGeneralError(data.message);
        }
      }
    } catch (error) {
      console.error("Error creating new user:", error);
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

        if (field.name === "password") {
          step["input-fields"].splice(index + 1, 0, {
            ...field,
            name: "confirmPassword",
            label: "אישור סיסמא",
            "validation-error": "יש להזין את הסיסמא שוב",
            "format-error": "הסיסמא לא תואמת את הסיסמא שהוזנה",
          });
        }
      });
    }
  }, [scoreObject, step]);

  const onSubmit = async (stepData: Inputs, index: number) => {
    const updatedPersonalDetails = {
      ...scoreObject["personal-details"],
      ...stepData,
    };
    setData(updatedPersonalDetails);
    if (completedSteps && index !== completedSteps.length - 1) {
      if (index === 0) {
        const userCreated = await createNewUser(
          stepData["email"] as string,
          stepData["password"] as string
        );
        if (!userCreated) {
          return;
        }
      }
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

  const password = watch("password");

  return (
    <PopUpContainer
      headline={structure.registration.steps[currentStep].title}
      closeButton={() => setRegistrationStatus(false)}
    >
      {completedSteps && (
        <ProgressBar completed={completedSteps} indicator={true} />
      )}
      <div className={formStyles["form-container"]}>
        <div>
          <h3
            className={clsx(
              "headline_medium-small bold",
              formStyles["headline"]
            )}
          >
            {step.title}
          </h3>
          <p className="paragraph_16">{step.description}</p>
          <p className={clsx(formStyles["validation"], "paragraph_16")}>
            {structure.registration["validation-general-copy"]}
          </p>
        </div>
        <form
          style={{ pointerEvents: loading ? "none" : "auto" }}
          onSubmit={handleSubmit((data) => onSubmit(data, currentStep))}
        >
          {step["input-fields"].map((field, index) => (
            <div
              className={clsx(
                formStyles["field"],
                formStyles["row"],
                formStyles[`row-${field.row}`],
                field.type !== "checkbox"
                  ? formStyles["input"]
                  : formStyles["checkbox"]
              )}
              key={index}
            >
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
                            message: field["format-error"],
                          }
                        : field.type === "tel"
                        ? {
                            value: /^0\d{1,2}-?\d{7}$/,
                            message: field["format-error"],
                          }
                        : field.type === "password"
                        ? {
                            value:
                              /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/,
                            message: field["format-error"],
                          }
                        : undefined,
                    validate:
                      field.name === "confirmPassword"
                        ? (value) => value === password || field["format-error"]
                        : undefined,
                  })}
                  onFocus={(e) => {
                    setGeneralError("");
                  }}
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
                    <label className={formStyles["checkbox-label"]}>
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
                <span className={formStyles["error-message"]}>
                  {errors[field.name]?.message as string}
                </span>
              ) : null}
            </div>
          ))}
          <button
            className={clsx(
              formStyles["submit-button"],
              "basic-button solid",
              loading && "loading"
            )}
            type="submit"
            disabled={Object.keys(errors).length > 0}
          >
            {structure.registration["nav-buttons"][currentStep]}
          </button>
          {generalError && (
            <div
              className={clsx(
                formStyles["error-message"],
                formStyles["general-error"]
              )}
            >
              {generalError}
            </div>
          )}
        </form>
      </div>
    </PopUpContainer>
  );
}
