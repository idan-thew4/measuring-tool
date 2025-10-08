"use client";
import formStyles from "../popUpContainer/form.module.scss";
import {
  useStore,
  totalCompleted,
  ProjectDetails,
  RegistrationStep,
  structureProps,
} from "../../../contexts/Store";
import { useEffect, useState } from "react";
import { ProgressBar } from "@/app/tool/[project_id]/[alternative_id]/components/progress-bar/progress-bar";
import clsx from "clsx";
import { useForm, Controller, set } from "react-hook-form";
import Select from "react-select";
import { PopUpContainer } from "../popUpContainer/popUpContainer";
import { useRouter, useParams } from "next/navigation";

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
  const router = useRouter();
  const {
    structure,
    scoreObject,
    setScoreObject,
    registrationPopup,
    setRegistrationPopup,
    setSelfAssessmentPopup,
    url,
  } = useStore();
  const [completedSteps, setCompletedSteps] = useState<totalCompleted>();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [townsList, setTownsList] = useState<
    { value: string; label: string }[]
  >([]);
  const [yearsList, setYearsList] = useState<{
    start: { value: string; label: string }[];
    end: { value: string; label: string }[];
  }>({ start: [], end: [] });
  const params = useParams();
  const [chapter, subChapter, principle] = params?.chapters || [];

  const {
    register,
    handleSubmit,
    setValue,
    control,
    watch,

    formState: { errors },
  } = useForm<Inputs>();
  const [loading, setLoading] = useState<boolean>(false);
  const [generalError, setGeneralError] = useState<string>("");
  const [steps, setSteps] = useState<{
    array: RegistrationStep[] | undefined;
    single: RegistrationStep | undefined;
  }>({
    array: [],
    single: undefined,
  });

  useEffect(() => {
    let stepsArray: RegistrationStep[] | undefined = [];
    switch (registrationPopup) {
      case "register":
        stepsArray = structure?.registration.steps;
        break;
      case "new-project":
        stepsArray = structure?.registration.steps.slice(1);
        break;
      default:
    }
    stepsArray = addConfirmPasswordToSteps(stepsArray);

    const step = stepsArray ? stepsArray[currentStep] : undefined;

    setSteps({ array: stepsArray, single: step });

    if (
      stepsArray &&
      (completedSteps === undefined || completedSteps.length === 0)
    ) {
      const completedStepsArray: totalCompleted = stepsArray.map(
        (step, index) => ({
          completed: index === 0 ? 1 : 0,
          total: 1,
        })
      );

      setCompletedSteps(completedStepsArray);
    }
  }, [structure, registrationPopup, currentStep]);

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

      if (data) {
        setLoading(false);

        if (data.success) {
          return true;
        } else {
          if (data.message) {
            setGeneralError(data.message);
          }
        }
      }
    } catch (error) {
      console.error("Error creating new user:", error);
    }
  }

  async function createProject(
    ProjectDetails: ProjectDetails,
    structure: structureProps
  ) {
    setLoading(true);

    const ProjectDetailsForSend = Object.entries(ProjectDetails).reduce(
      (acc, [key, value]) => {
        if (
          key === "localAuthority" ||
          key === "projectStartYear" ||
          key === "projectEndYear"
        ) {
          acc[key] = (value as { label: string }).label;
        } else {
          acc[key] = value as
            | string
            | number
            | { value: string; label: string };
        }
        return acc;
      },
      {} as Record<string, string | number | { value: string; label: string }>
    );

    try {
      const response = await fetch(`${url}/create-project`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(ProjectDetailsForSend),
      });

      const data = await response.json();

      if (data.success) {
        setLoading(false);
        setRegistrationPopup("");
        setSelfAssessmentPopup(true);
        router.push(
          `/tool/${data.data.project_id}/${data.data.alternative_id}/${structure?.questionnaire.content[0]["chapter-title"]}/${subChapter}/${principle}`
        );
      } else {
        if (data.message) {
          setGeneralError(data.message);
        }
      }
    } catch (error) {
      console.error("Error creating new user:", error);
    }
  }

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

  function getYearsList() {
    let currentYear = new Date().getFullYear();
    let years: { value: string; label: string }[] = [];
    for (let i = currentYear; i >= 1945; i--) {
      years.push({ value: i.toString(), label: i.toString() });
    }
    setYearsList((prev) => ({
      ...prev,
      start: [...(prev?.start || []), ...years],
      end: prev.end,
    }));
  }

  function setEndYears(
    startYearOption: { value: string; label: string } | null
  ) {
    if (startYearOption) {
      const startYear = parseInt(startYearOption.value);
      const endYears: { value: string; label: string }[] = [];

      for (let year = startYear + 1; year <= new Date().getFullYear(); year++) {
        endYears.push({ value: year.toString(), label: year.toString() });
      }

      setYearsList((prev) => ({
        ...prev,
        end: endYears,
      }));
    }
  }

  function addConfirmPasswordToSteps(
    stepsArray: RegistrationStep[] | undefined
  ): RegistrationStep[] | undefined {
    if (!stepsArray) return stepsArray;
    return stepsArray.map((step) => {
      // Only add if password field exists and confirmPassword does not
      const passwordIndex = step["input-fields"].findIndex(
        (field) => field.name === "password"
      );
      const hasConfirm = step["input-fields"].some(
        (field) => field.name === "confirmPassword"
      );
      if (passwordIndex !== -1 && !hasConfirm) {
        const newFields = [...step["input-fields"]];
        newFields.splice(passwordIndex + 1, 0, {
          ...newFields[passwordIndex],
          name: "confirmPassword",
          label: "אישור סיסמא",
          "validation-error": "יש להזין את הסיסמא שוב",
          "format-error": "הסיסמא לא תואמת את הסיסמא שהוזנה",
        });
        return { ...step, ["input-fields"]: newFields };
      }
      return step;
    });
  }

  useEffect(() => {
    getTownList();
    getYearsList();
  }, []);

  useEffect(() => {
    if (steps.single) {
      steps.single["input-fields"].forEach((field, index) => {
        if (
          scoreObject["project-details"] &&
          field.name in scoreObject["project-details"]
        ) {
          setValue(
            field.name,
            (scoreObject["project-details"] as Inputs)[field.name]
          );
        }
      });
    }
  }, [scoreObject, steps]);

  const onSubmit = async (stepData: Inputs, index: number) => {
    const updatedProjectDetails = { ...scoreObject["project-details"] };

    // Update only keys that exist in project-details
    Object.keys(stepData).forEach((key) => {
      if (key in updatedProjectDetails) {
        (updatedProjectDetails as any)[key] = stepData[key];
      }
    });
    setScoreObject((prev) => ({
      ...prev,
      "project-details": updatedProjectDetails,
    }));

    if (completedSteps && index !== completedSteps.length - 1) {
      if (index === 0 && registrationPopup === "register") {
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
      if (structure) {
        createProject(updatedProjectDetails, structure);
        setRegistrationPopup("");
      }
    }
  };
  if (!registrationPopup) return null;
  if (!structure || !steps.single) return <div>Loading...</div>;

  const password = watch("password");

  return (
    <PopUpContainer
      headline={steps.array ? steps.array[currentStep].title : ""}
      closeButton={() => setRegistrationPopup("")}
      navArrows={currentStep}
      goToPrevSlide={() => {
        if (currentStep > 0) {
          setCurrentStep((prev) => prev - 1);
          setCompletedSteps((prev) => {
            if (!prev) return prev;
            const newSteps = [...prev];
            newSteps[currentStep] = {
              ...newSteps[currentStep],
              completed: 0,
            };
            return newSteps;
          });
        }
      }}>
      {completedSteps && (
        <ProgressBar completed={completedSteps} indicator={true} />
      )}
      <div className={formStyles["form-container"]}>
        <div>
          <h3
            className={clsx(
              "headline_medium-small bold",
              formStyles["headline"]
            )}>
            {steps.single.title}
          </h3>
          <p className="paragraph_16">{steps.single.description}</p>
          <p className={clsx(formStyles["validation"], "paragraph_16")}>
            {structure.registration["validation-general-copy"]}
          </p>
        </div>
        <form
          style={{ pointerEvents: loading ? "none" : "auto" }}
          onSubmit={handleSubmit((data) => onSubmit(data, currentStep))}>
          {steps.single["input-fields"].map((field, index) => (
            <div
              className={clsx(
                formStyles["field"],
                formStyles["row"],
                formStyles[`row-${field.row}`],
                field.type !== "checkbox"
                  ? formStyles["input"]
                  : formStyles["checkbox"]
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
                      className={`dropdown paragraph_18 ${
                        field.name === "projectStartYear" ||
                        field.name === "projectEndYear"
                          ? "bottom-dropdown"
                          : ""
                      }`}
                      classNamePrefix={"dropdown"}
                      placeholder={`${field.label}${
                        field.mandatory ? " *" : ""
                      }`}
                      isClearable={true}
                      value={controllerField.value}
                      isSearchable={true}
                      isDisabled={
                        field.name === "projectEndYear" &&
                        yearsList.end.length === 0
                      }
                      // menuIsOpen={true}
                      options={
                        field.name === "localAuthority"
                          ? townsList
                          : field.name === "projectStartYear"
                          ? yearsList.start
                          : field.name === "projectEndYear"
                          ? yearsList.end
                          : field["dropdown-options"]
                      }
                      onChange={(option) => {
                        controllerField.onChange(option ? option : null);
                        if (
                          field.name === "projectStartYear" &&
                          (option === null ||
                            (typeof option === "object" &&
                              option !== null &&
                              "value" in option &&
                              "label" in option))
                        ) {
                          setEndYears(
                            option as { value: string; label: string } | null
                          );
                        }
                      }}
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
            disabled={Object.keys(errors).length > 0}>
            {structure.registration["nav-buttons"][currentStep]}
          </button>
          {generalError && (
            <div
              className={clsx(
                formStyles["error-message"],
                formStyles["general-error"]
              )}>
              {generalError}
            </div>
          )}
        </form>
      </div>
    </PopUpContainer>
  );
}
