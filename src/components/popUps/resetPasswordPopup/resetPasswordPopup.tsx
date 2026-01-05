"use client";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { PopUpContainer } from "../popUpContainer/popUpContainer";
import formStyles from "../popUpContainer/form.module.scss";
import popUpContainerStyles from "../popUpContainer/pop-up-container.module.scss";
import {
  ResetPasswordStep,
  RegistrationStep,
  useStore,
} from "@/contexts/Store";
import { useForm } from "react-hook-form";

type resetPasswordResponse = {
  success: boolean;
  data: string | { status: string };
  message?: string;
};

type Inputs = {
  [key: string]: string;
};

export function ResetPasswordPopup() {
  const {
    structure,
    url,
    resetPasswordPopup,
    setResetPasswordPopup,
    addConfirmPasswordToSteps,
    paramsValue,
    setParamsValue,
  } = useStore();
  const [generalError, setGeneralError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [steps, setSteps] = useState<{
    array: RegistrationStep[] | ResetPasswordStep[] | undefined;
    single: RegistrationStep | ResetPasswordStep | undefined;
  }>({
    array: [],
    single: undefined,
  });
  const [confirmationMessage, setConfirmationMessage] = useState<string>("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<Inputs>();

  useEffect(() => {
    let stepsArray: RegistrationStep[] | ResetPasswordStep[] | undefined = [];

    stepsArray = structure?.login["password-reset"].steps;

    stepsArray = addConfirmPasswordToSteps(stepsArray);

    let step = undefined;

    if (paramsValue.keyValue || paramsValue.login) {
      step = stepsArray ? stepsArray[1] : undefined;
    } else {
      step = stepsArray ? stepsArray[0] : undefined;
    }

    setSteps({ array: stepsArray, single: step });
  }, [structure, paramsValue]);

  async function resetPasswordFunction(
    email?: string,
    key?: string,
    login?: string,
    password?: string
  ): Promise<resetPasswordResponse | void> {
    setLoading(true);

    let ending: string = "";

    if (paramsValue.keyValue || paramsValue.login) {
      ending = "set-password";
    } else {
      ending = "forget-password";
    }

    try {
      const response = await fetch(`${url}/${ending}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          ...(email && { email }),
          ...(key && { key }),
          ...(login && { login }),
          ...(password && { password }),
        }),
      });

      const data = await response.json();

      if (data) {
        setLoading(false);

        if (data.success || data.status === "success") {
          setGeneralError("");

          setConfirmationMessage(steps.single?.["confimarion-message"] || "");
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

  const onSubmit = async (stepData: Inputs) => {
    resetPasswordFunction(
      stepData.email ? stepData.email : undefined,
      paramsValue.keyValue ? paramsValue.keyValue : undefined,
      paramsValue.login ? paramsValue.login : undefined,
      stepData.password ? stepData.password : undefined
    );
  };

  if (!resetPasswordPopup || !structure) return null;

  return (
    <PopUpContainer
      headline={steps.single?.title || ""}
      closeButton={() => {
        setResetPasswordPopup(false);
        setConfirmationMessage("");
        setGeneralError("");
        reset();
        setParamsValue({ keyValue: null, login: null });
      }}>
      {!confirmationMessage ? (
        <div className={formStyles["form-container"]}>
          <form
            style={{ pointerEvents: loading ? "none" : "auto" }}
            onSubmit={handleSubmit((data) => onSubmit(data))}>
            {steps.single?.["input-fields"].map((field, index) => {
              return (
                <div
                  className={clsx(
                    formStyles["field"],
                    formStyles["row"],
                    formStyles[`row-${field.row}`],
                    formStyles["input"]
                  )}
                  key={index}>
                  <input
                    type={field.type}
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
                          : field.type === "password"
                          ? {
                              value:
                                /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/,
                              message: field["format-error"],
                            }
                          : undefined,
                    })}
                    onFocus={(e) => {
                      setGeneralError("");
                    }}
                  />

                  {typeof errors[field.name]?.message === "string" ? (
                    <span className={formStyles["error-message"]}>
                      {errors[field.name]?.message as string}
                    </span>
                  ) : null}
                </div>
              );
            })}

            <button
              className={clsx(
                formStyles["submit-button"],
                popUpContainerStyles["submit-button"],
                "solid",
                "basic-button",
                loading && "loading"
              )}
              type="submit"
              disabled={Object.keys(errors).length > 0 || generalError !== ""}>
              {steps.single?.["call-to-action"]}
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
      ) : (
        <p className="paragraph_18">{confirmationMessage}</p>
      )}
    </PopUpContainer>
  );
}
