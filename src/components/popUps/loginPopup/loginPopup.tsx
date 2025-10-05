"use client";
import { useStore } from "../../../contexts/Store";
import { useEffect, useReducer, useState } from "react";
import clsx from "clsx";
import { useForm, Controller, set } from "react-hook-form";
import { PopUpContainer } from "../popUpContainer/popUpContainer";
import formStyles from "../popUpContainer/form.module.scss";
import { useRouter } from "next/navigation";

type Inputs = {
  [key: string]: string | { value: string; label: string } | boolean | number;
};

export function LoginPopup() {
  const {
    structure,
    url,
    loginPopup,
    setLoginPopup,
    setRegistrationPopup,
    setLoggedInChecked,
  } = useStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();
  const [loading, setLoading] = useState<boolean>(false);
  const [generalError, setGeneralError] = useState<string>("");
  const router = useRouter();

  async function login(username: string, password: string) {
    setLoading(true);
    try {
      const response = await fetch(`${url}/slil-login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        setLoading(false);
        setLoginPopup(false);
        setLoggedInChecked(true);

        // Stay on the same page including project_id and alternative_id

        router.push(`/tool/user-dashboard`);
      } else {
        if (data.message) {
          setGeneralError(data.message);
          setLoading(false);
        }
      }
    } catch (error) {
      console.error("Error creating new user:", error);
    }
  }

  const onSubmit = async (stepData: Inputs) => {
    const username = stepData.email as string;
    const password = stepData.password as string;

    login(username, password);
  };

  if (!loginPopup) return null;
  if (!structure) return <div>Loading...</div>;

  return (
    <PopUpContainer
      headline={structure.login.title}
      closeButton={() => setLoginPopup(false)}>
      <div className={formStyles["form-container"]}>
        <form
          style={{ pointerEvents: loading ? "none" : "auto" }}
          onSubmit={handleSubmit((data) => onSubmit(data))}>
          <p className="paragraph_18">
            {structure.login["text"][0]}
            <button
              className="link"
              onClick={() => {
                setLoginPopup(false);
                setRegistrationPopup("register");
              }}>
              {structure.login["text"][1]}
            </button>
          </p>
          {structure.login["input-fields"].map((field, index) => (
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
              <input
                type={field.type ? field.type : "text"}
                placeholder={`${field.label}${field.mandatory ? " *" : ""}`}
                className="paragraph_18"
                {...register(field.name, {
                  required: field.mandatory ? field["validation-error"] : false,
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
          ))}
          <button
            className={clsx(
              formStyles["submit-button"],
              "basic-button solid",
              loading && "loading"
            )}
            type="submit"
            disabled={Object.keys(errors).length > 0}>
            {structure.login["button-copy"]}
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
