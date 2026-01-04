"use client";
import formStyles from "../popUpContainer/form.module.scss";
import {
  useStore,
  totalCompleted,
  ProjectDetails,
  RegistrationStep,
  structureProps,
} from "../../../contexts/Store";
import { useEffect, useRef, useState } from "react";
import { ProgressBar } from "@/app/tool/[project_id]/[alternative_id]/components/progress-bar/progress-bar";
import clsx from "clsx";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import { PopUpContainer } from "../popUpContainer/popUpContainer";
import { useRouter, useParams } from "next/navigation";
import "../../../components/popUps/popUpContainer/dropdown.scss";
import { MuiOtpInput } from "mui-one-time-password-input";

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
    setLoggedInChecked,
    getUserDashboardData,
    initialScoreObject,
    setActiveSideMenu,
  } = useStore();
  const [completedSteps, setCompletedSteps] = useState<totalCompleted>();
  const [currentStep, setCurrentStep] = useState<number>(0);
  // const [townsList, setTownsList] = useState<
  //   { value: string; label: string }[]
  // >([]);
  const [yearsList, setYearsList] = useState<{
    start: { value: string; label: string }[];
    end: { value: string; label: string }[];
  }>({ start: [], end: [] });
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [resentAttempts, setResentAttempts] = useState<number>(0);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    watch,
    reset,

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

  async function otpRequest(phone: string) {
    setLoading(true);
    try {
      const response = await fetch(
        `https://wordpress-1080689-5737105.cloudwaysapps.com/wp-json/otp/v1/request`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            phone,
          }),
        }
      );

      const data = await response.json();

      if (data) {
        setLoading(false);

        if (data.success) {
          return data.otp;
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

  async function createNewUser(
    fullName: string,
    email: string,
    password: string,
    officeName: string,
    phone: string,
    sendCommercialMaterial: boolean,
    getInTouch: boolean,
    otpCode: boolean
  ) {
    setLoading(true);
    try {
      const response = await fetch(`${url}/create-new-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          fullName,
          email,
          password,
          officeName,
          phone,
          sendCommercialMaterial: sendCommercialMaterial
            ? sendCommercialMaterial
            : false,
          getInTouch: getInTouch ? getInTouch : false,
          otpCode,
        }),
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
        setLoggedInChecked(true);
        getUserDashboardData(structure);

        router.push(
          `/tool/${data.data.project_id}/${data.data.alternative_id}/${structure?.questionnaire.content[0]["chapter-slug"]}/1/1`
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

  // async function getTownList() {
  //   try {
  //     const response = await fetch(
  //       "https://data.gov.il/api/3/action/datastore_search?resource_id=5c78e9fa-c2e2-4771-93ff-7f400a12f7ba"
  //     );
  //     if (!response.ok) {
  //       throw new Error(`HTTP error! status: ${response.status}`);
  //     }

  //     const data = await response.json();

  //     let TownsListTemp: { value: string; label: string }[] = [];

  //     data.result.records.forEach((record: TownRecord, index: number) => {
  //       if (index !== 0) {
  //         TownsListTemp.push({
  //           value: record.שם_ישוב,
  //           label: record.שם_ישוב,
  //         });
  //       }
  //     });

  //     setTownsList(TownsListTemp);
  //   } catch (error) {
  //     console.error("Failed to fetch content:", error);
  //   }
  // }

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
    // getTownList();
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
      if (index === 1 && registrationPopup === "register") {
        const userCreated = await createNewUser(
          stepData["fullName"] as string,
          stepData["email"] as string,
          stepData["password"] as string,
          stepData["planningOffice"] as string,
          stepData["contactPhone"] as string,
          stepData["commercial-agreement"] as boolean,
          stepData["research-agreement"] as boolean,
          stepData["otp"] as boolean
        );

        if (!userCreated) {
          return;
        }

        setCurrentStep(index + 1);
        setGeneralError("");
        setCompletedSteps((prev) => {
          if (!prev) return prev;
          const newSteps = [...prev];
          newSteps[index + 1] = {
            ...newSteps[index + 1],
            completed: 1,
          };
          return newSteps;
        });
      } else if (index === 0 && registrationPopup === "register") {
        const otpSent = await otpRequest(stepData["contactPhone"] as string);

        setCurrentStep(index + 1);
        setGeneralError("");
        setCompletedSteps((prev) => {
          if (!prev) return prev;
          const newSteps = [...prev];
          newSteps[index + 1] = {
            ...newSteps[index + 1],
            completed: 1,
          };
          return newSteps;
        });

        if (!otpSent) {
          return;
        }
      }
    } else {
      if (structure) {
        createProject(updatedProjectDetails, structure);
        setRegistrationPopup("");
        setCompletedSteps(undefined);
        setCurrentStep(0);
        reset();
        setScoreObject(initialScoreObject);
      }
    }
  };

  function timer() {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  useEffect(() => {
    if (resentAttempts >= 3) {
      setGeneralError("יותר מדי נסיונות. אנה נסזה שוב מאוחר יותר");
    }
  }, [timeLeft, resentAttempts]);

  useEffect(() => {
    if (watch("verificationCode") === "" && generalError !== "") {
      setGeneralError("");
    }
  }, [watch("verificationCode")]);

  const password = watch("password");

  if (!registrationPopup) return null;
  if (!structure || !steps.single) return <div>Loading...</div>;

  return (
    <PopUpContainer
      headline={steps.array ? steps.array[currentStep].title : ""}
      closeButton={() => {
        setRegistrationPopup("");
        setCompletedSteps(undefined);
        setCurrentStep(0);
        reset();
        setGeneralError("");
        setResentAttempts(0);
      }}
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
      }}
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
            {steps.single.title}
          </h3>
          {steps.single["input-fields"][0].type === "otp" && (
            <h4
              className={clsx("headline_medium-small", formStyles["subtitle"])}
            >
              {steps.single.subtitle}
            </h4>
          )}
          <p className="paragraph_16">
            {steps.single.description}
            {steps.single["input-fields"][0].type === "otp" &&
              ` ${scoreObject["project-details"].contactPhone}`}
          </p>
          {steps.single.type !== "otp" && (
            <p className={clsx(formStyles["validation"], "paragraph_16")}>
              {structure.registration["validation-general-copy"]}
            </p>
          )}
        </div>
        <form
          style={{ pointerEvents: loading ? "none" : "auto" }}
          onSubmit={handleSubmit((data) => onSubmit(data, currentStep))}
        >
          {steps.single["input-fields"].map((field, index) => (
            <div
              className={clsx(
                formStyles["field"],
                formStyles["row"],
                formStyles[`row-${field.row}`],
                field.type !== "checkbox"
                  ? formStyles["input"]
                  : formStyles["checkbox"],
                `input`
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
                      // menuPlacement="auto"
                      className={`dropdown paragraph_18 ${
                        field.name === "projectStartYear"
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
                        // field.name === "localAuthority"
                        //   ? townsList
                        //   :
                        field.name === "projectStartYear"
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
                field.type === "otp" ? (
                  <Controller
                    name={field.name}
                    control={control}
                    rules={{
                      required: false,
                      // minLength: {
                      //   value: 6,
                      // message: "OTP must be 5 characters long",
                      // },
                    }}
                    render={({ field }) => (
                      <div data-testid="otp-input">
                        <p
                          className={clsx(
                            "paragraph_18",
                            formStyles["otp-label"]
                          )}
                        >
                          {steps.single?.["input-fields"][0].label}
                          {steps.single?.["input-fields"][0].mandatory
                            ? " *"
                            : ""}
                        </p>
                        <MuiOtpInput
                          autoFocus
                          value={
                            typeof field.value === "string"
                              ? field.value
                              : field.value !== undefined &&
                                field.value !== null
                              ? String(field.value)
                              : ""
                          }
                          onChange={field.onChange}
                          sx={{
                            gap: 3,
                            direction: "ltr",
                          }}
                          length={6}
                          TextFieldsProps={{
                            inputMode: "numeric",
                            type: "tel",
                            autoComplete: "one-time-code",
                          }}
                          validateChar={(char: string) => /^[0-9]$/.test(char)}
                        />
                      </div>
                    )}
                  />
                ) : (
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
                          ? (value) =>
                              value === password || field["format-error"]
                          : undefined,
                    })}
                    onFocus={(e) => {
                      setGeneralError("");
                    }}
                  />
                )
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
            disabled={Object.keys(errors).length > 0 || generalError !== ""}
          >
            {structure.registration["nav-buttons"][currentStep]}
          </button>
          {steps.single["input-fields"][0].type === "otp" && (
            <div className={formStyles["secondery-cta-wrapper"]}>
              {resentAttempts < 3 &&
                (timeLeft === 0 ? (
                  <>
                    <span className="paragraph_18">
                      {steps.single?.["secondery-cta-copy"]?.text}
                    </span>
                    <button
                      className="link-button"
                      onClick={() => {
                        otpRequest(
                          scoreObject["project-details"].contactPhone as string
                        );
                        setTimeLeft(2);
                        timer();
                        setResentAttempts((prev) => prev + 1);
                        setGeneralError("");
                        reset({ verificationCode: "" });
                      }}
                    >
                      {steps.single?.["secondery-cta-copy"]?.button}
                    </button>
                  </>
                ) : (
                  <p className="paragraph_18">{`00:${String(timeLeft).padStart(
                    2,
                    "0"
                  )}`}</p>
                ))}
            </div>
          )}
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
