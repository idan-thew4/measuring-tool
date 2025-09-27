"use client";
import { useStore } from "../../../contexts/Store";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import { PopUpContainer } from "../popUpContainer/popUpContainer";

type Inputs = {
  [key: string]: string | { value: string; label: string } | boolean | number;
};

export function LoginPopup() {
  const { structure, url, loginStatus, setLoginStatus } = useStore();

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

  async function Login(email: string, password: string) {
    setLoading(true);
    try {
      const response = await fetch(`${url}/????`, {
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

  const onSubmit = async (stepData: Inputs) => {
    const email = stepData.email as string;
    const password = stepData.password as string;
  };
  if (!structure) return <div>Loading...</div>;

  return (
    <PopUpContainer
      //   headline={structure.login.title}
      headline={"temp"}
      closeButton={() => setLoginStatus(false)}
    >
      <form
        style={{ pointerEvents: loading ? "none" : "auto" }}
        onSubmit={handleSubmit((data) => onSubmit(data))}
      >
        {structure.login["input-fields"].map((field, index) => (
          <div
            className={clsx(
              styles["field"],
              styles["row"],
              styles[`row-${field.row}`],
              field.type !== "checkbox" ? styles["input"] : styles["checkbox"]
            )}
            key={index}
          >
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

            <Controller
              name={field.name}
              control={control}
              rules={{
                required: field.mandatory ? field["validation-error"] : false,
              }}
              render={({ field: controllerField }) => (
                <label className={styles["checkbox-label"]}>
                  <input
                    type="checkbox"
                    checked={!!controllerField.value}
                    onChange={(e) => controllerField.onChange(e.target.checked)}
                  />
                  <span className="paragraph_14">
                    {field.label}
                    {field.mandatory ? " *" : ""}
                  </span>
                </label>
              )}
            />

            {typeof errors[field.name]?.message === "string" ? (
              <span className={styles["error-message"]}>
                {errors[field.name]?.message as string}
              </span>
            ) : null}
          </div>
        ))}
        <button
          className={clsx(
            styles["submit-button"],
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
            className={clsx(styles["error-message"], styles["general-error"])}
          >
            {generalError}
          </div>
        )}
      </form>
    </PopUpContainer>
  );
}
