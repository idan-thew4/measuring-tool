"use client";
import { useStore } from "../../../contexts/Store";
import { useEffect, useReducer, useRef, useState } from "react";
import clsx from "clsx";
import { useForm, Controller, set } from "react-hook-form";
import { PopUpContainer } from "../popUpContainer/popUpContainer";
import formStyles from "../popUpContainer/form.module.scss";
import { useRouter } from "next/navigation";
import ReCAPTCHA from "react-google-recaptcha";

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
    setResetPasswordPopup,
  } = useStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();
  const [loading, setLoading] = useState<boolean>(false);
  const [generalError, setGeneralError] = useState<string>("");
  const router = useRouter();
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [recaptchaValue, setRecaptchaValue] = useState<string | null>(null);

  async function login(
    username: string,
    password: string,
    recaptchaToken: string,
  ) {
    // setLoading(true);
    try {
      const response = await fetch(`${url}/slil-login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ username, password, recaptchaToken }),
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
    setLoading(true);

    if (recaptchaRef.current) {
      const token = await recaptchaRef.current.executeAsync();
      recaptchaRef.current.reset();
      if (!token) {
        setGeneralError("reCAPTCHA verification failed. Please try again.");
        setLoading(false);
        return;
      }
      // Now proceed with your login logic
      const username = stepData.email as string;
      const password = stepData.password as string;
      login(username, password, token);
    }
  };

  if (!loginPopup) return null;
  if (!structure) return <div>Loading...</div>;

  return (
    <PopUpContainer
      headline={structure.login.title}
      closeButton={() => setLoginPopup(false)}>
      <div className={formStyles["form-container"]}>
        <p className="paragraph_18">
          {structure.login["text"][0]}
          <button
            style={{ display: "inline-block", marginLeft: "0.5rem" }}
            className="link paragraph_18"
            onClick={() => {
              setLoginPopup(false);
              setRegistrationPopup("register");
            }}>
            {structure.login["text"][1]}
          </button>
        </p>
        <form
          style={{ pointerEvents: loading ? "none" : "auto" }}
          onSubmit={handleSubmit((data) => onSubmit(data))}>
          {structure.login["input-fields"].map((field, index) => (
            <div
              className={clsx(
                formStyles["field"],
                formStyles["row"],
                formStyles[`row-${field.row}`],
                field.type !== "checkbox"
                  ? formStyles["input"]
                  : formStyles["checkbox"],
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
            className={clsx("link-button blue", formStyles["link-button"])}
            type="button"
            onClick={() => {
              setLoginPopup(false);
              setResetPasswordPopup(true);
            }}>
            שכחת את הסיסמא?
          </button>
          <ReCAPTCHA
            ref={recaptchaRef}
            sitekey="6LfFIEosAAAAAC1LbrFds9gFA6AgQLiGwqk0WAAc"
            size="invisible"
            badge="bottomright" // or "inline", "bottomleft"
            onChange={(token) => {
              setRecaptchaValue(token);
              setLoading(false);
            }}
          />
          <button
            className={clsx(
              formStyles["submit-button"],
              "basic-button solid",
              loading && "loading",
            )}
            type="submit"
            disabled={Object.keys(errors).length > 0}>
            {structure.login["button-copy"]}
          </button>
          {generalError && (
            <div
              className={clsx(
                formStyles["error-message"],
                formStyles["general-error"],
              )}>
              {generalError}
            </div>
          )}
        </form>
      </div>
    </PopUpContainer>
  );
}
