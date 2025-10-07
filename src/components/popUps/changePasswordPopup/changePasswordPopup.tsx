"use client";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { useForm } from "react-hook-form";
import { PopUpContainer } from "../popUpContainer/popUpContainer";
import formStyles from "../popUpContainer/form.module.scss";
import popUpContainerStyles from "../popUpContainer/pop-up-container.module.scss";
import { useStore } from "@/contexts/Store";

type Inputs = {
  [key: string]: string | { value: string; label: string } | boolean | number;
};

type changePasswordResponse = {
  success: boolean;
  data: string | { status: string };
  message?: string;
};

export function ChangePasswordPopup() {
  const { structure, changePasswordPopup, setChangePasswordPopup, url } =
    useStore();

  const {
    register,
    handleSubmit,
    watch,
    reset,

    formState: { errors },
  } = useForm<Inputs>();

  useEffect(() => {
    if (changePasswordPopup) {
      reset();
    }
  }, [changePasswordPopup]);

  const [generalError, setGeneralError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  async function changePassword(
    old_password: string,
    new_password: string,
    confirm_password: string
  ): Promise<changePasswordResponse | void> {
    setLoading(true);
    try {
      const response = await fetch(`${url}/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ old_password, new_password, confirm_password }),
      });

      const data = await response.json();

      if (data) {
        setLoading(false);

        if (data.success) {
          setChangePasswordPopup(false);
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
    const password = stepData.currentPassword as string;
    const newPassword = stepData.newPassword as string;
    const confirmNewPassword = stepData.confirmNewPassword as string;

    changePassword(password, newPassword, confirmNewPassword);
  };

  const password = watch("newPassword");

  if (!changePasswordPopup || !structure) return <div>Loading...</div>;

  return (
    <PopUpContainer
      headline={structure["user-dashboard"]["pop-ups"]["change-password"].title}
      closeButton={() => setChangePasswordPopup(false)}
    >
      <div className={formStyles["form-container"]}>
        <form
          style={{ pointerEvents: loading ? "none" : "auto" }}
          onSubmit={handleSubmit((data) => onSubmit(data))}
        >
          {structure["user-dashboard"]["pop-ups"]["change-password"][
            "input-fields"
          ]?.map((field, index) => (
            <div
              className={clsx(
                formStyles["field"],
                formStyles["row"],
                formStyles[`row-${field.row}`],
                formStyles["input"]
              )}
              key={index}
            >
              <input
                type={field.type ? field.type : "text"}
                placeholder={`${field.label}${field.mandatory ? " *" : ""}`}
                className="paragraph_18"
                {...register(field.name, {
                  required: field.mandatory ? field["validation-error"] : false,
                  pattern: {
                    value: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/,
                    message: field["format-error"],
                  },
                  validate:
                    field.name === "confirmNewPassword"
                      ? (value) => value === password || field["format-error"]
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
          ))}

          <div className={popUpContainerStyles["buttons"]}>
            {structure["user-dashboard"]["pop-ups"]["change-password"][
              "buttons-copy"
            ].map((button, index) => {
              if (index === 0) {
                // Submit  button
                return (
                  <button
                    key={button}
                    className={clsx(
                      formStyles["submit-button"],
                      "solid",
                      "basic-button",
                      loading && "loading"
                    )}
                    type="submit"
                    disabled={Object.keys(errors).length > 0}
                  >
                    {button}
                  </button>
                );
              } else {
                // Close button
                return (
                  <button
                    key={button}
                    className={clsx("basic-button", "outline")}
                    type="button"
                    onClick={() => setChangePasswordPopup(false)}
                  >
                    {button}
                  </button>
                );
              }
            })}
          </div>
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
