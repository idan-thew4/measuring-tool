"use client";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { PopUpContainer } from "../popUpContainer/popUpContainer";
import formStyles from "../popUpContainer/form.module.scss";
import popUpContainerStyles from "../popUpContainer/pop-up-container.module.scss";
import { structureProps, useStore } from "@/contexts/Store";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

type renameAddPopupResponse = {
  success: boolean;
  data: string | { status: string };
  message?: string;
};

type Inputs = {
  [key: string]: string | { value: string; label: string } | boolean | number;
};

export function AddRenamePopup() {
  const {
    structure,
    url,
    setAddRenamePopup,
    addRenamePopup,
    getUserDashboardData,
  } = useStore();

  const [generalError, setGeneralError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const params = useParams();
  const router = useRouter();

  const [chapter, subChapter, principle] = params?.chapters || [];

  const {
    register,
    handleSubmit,
    reset,
    setValue,

    formState: { errors },
  } = useForm<Inputs>();

  useEffect(() => {
    if (addRenamePopup) {
      reset();
      if (addRenamePopup.alternative_name) {
        setValue("alternativeName", addRenamePopup.alternative_name);
      }
      if (addRenamePopup.project_name) {
        setValue("projectName", addRenamePopup.project_name);
      }
    }
  }, [addRenamePopup, reset, setValue]);

  async function addRenameFunction(
    structure: structureProps,
    project_id?: number,
    project_name?: string,
    alternative_id?: number,
    alternative_name?: string
  ): Promise<renameAddPopupResponse | void> {
    setLoading(true);
    try {
      const response = await fetch(`${url}/${addRenamePopup.type}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          ...(project_id && { project_id }),
          ...(project_name && { project_name }),
          ...(alternative_id && { alternative_id }),
          ...(alternative_name && { alternative_name }),
        }),
      });

      const data = await response.json();

      if (data) {
        setLoading(false);

        if (data.success) {
          setAddRenamePopup({ type: "" });
          setGeneralError("");
          getUserDashboardData(structure);

          if (params.chapters) {
            router.push(
              `/tool/${data.data.project_id}/${data.data.alternative_id}/${chapter}/${subChapter}/${principle}`
            );
          }
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
    console.log("stepData", stepData);
    const alternativeName =
      (stepData.alternativeName as string) ||
      (stepData.addAlternative as string);
    const projectName = stepData.projectName as string;
    if (structure) {
      addRenameFunction(
        structure,
        addRenamePopup.project_id ? addRenamePopup.project_id : undefined,
        projectName ? projectName : undefined,
        addRenamePopup.alternative_id
          ? addRenamePopup.alternative_id
          : undefined,
        alternativeName ? alternativeName : undefined
      );
    }
  };

  if (addRenamePopup.type === "" || !structure) return null;

  return (
    <PopUpContainer
      headline={
        structure["user-dashboard"]["pop-ups"][addRenamePopup.type].title
      }
      closeButton={() => setAddRenamePopup({ type: "" })}>
      <div className={formStyles["form-container"]}>
        <form
          style={{ pointerEvents: loading ? "none" : "auto" }}
          onSubmit={handleSubmit((data) => onSubmit(data))}>
          {structure["user-dashboard"]["pop-ups"][addRenamePopup.type][
            "input-fields"
          ]?.map((field, index) => {
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

          <div className={popUpContainerStyles["buttons"]}>
            {structure["user-dashboard"]["pop-ups"][addRenamePopup.type][
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
                    disabled={Object.keys(errors).length > 0}>
                    {button}
                  </button>
                );
              } else {
                // Close button
                return (
                  <button
                    key={button}
                    className="basic-button outline"
                    type="button"
                    onClick={() => setAddRenamePopup({ type: "" })}>
                    {button}
                  </button>
                );
              }
            })}
          </div>
        </form>
      </div>

      {generalError && (
        <div
          className={clsx(
            formStyles["error-message"],
            formStyles["general-error"]
          )}>
          {generalError}
        </div>
      )}
    </PopUpContainer>
  );
}
