"use client";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { PopUpContainer } from "../popUpContainer/popUpContainer";
import formStyles from "../popUpContainer/form.module.scss";
import popUpContainerStyles from "../popUpContainer/pop-up-container.module.scss";
import { useStore, structureProps, Popups } from "@/contexts/Store";
import { useRouter } from "next/navigation";

type deletePopupResponse = {
  success: boolean;
  data: string | { status: string };
  message?: string;
};

export function DeletePopup() {
  const {
    structure,
    url,
    deletePopup,
    setDeletePopup,
    getUserDashboardData,
    setLoggedInChecked,
  } = useStore();

  const [generalError, setGeneralError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  async function deleteFunction(
    structure: structureProps,
    project_id?: number,
    alternative_id?: number
  ): Promise<deletePopupResponse | void> {
    setLoading(true);
    try {
      const response = await fetch(`${url}/${deletePopup.type}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          ...(project_id && { project_id }),
          ...(alternative_id && {
            alternative_id,
          }),
        }),
      });

      const data = await response.json();

      if (data) {
        setLoading(false);

        if (data.success) {
          setDeletePopup({ type: "" });
          setGeneralError("");

          if (deletePopup.type === "delete-user") {
            setLoggedInChecked(false);
            router.push(
              `/tool/0/0/${structure.questionnaire.content[1]["chapter-slug"]}/1/1`
            );
          } else {
            setLoggedInChecked(true);
            getUserDashboardData(structure);
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

  const onSubmit = async (structure: structureProps) => {
    if (structure) {
      deleteFunction(
        structure,
        deletePopup.project_id,
        deletePopup.alternative_id
      );
    }
  };

  if (deletePopup.type === "" || !structure) return null;

  return (
    <PopUpContainer
      headline={structure["user-dashboard"]["pop-ups"][deletePopup.type].title}
      closeButton={() => setDeletePopup({ type: "" })}
    >
      <p
        className={clsx(
          popUpContainerStyles["description-text"],
          "paragraph_20"
        )}
      >
        {structure["user-dashboard"]["pop-ups"][deletePopup.type].description}
      </p>
      <div className={popUpContainerStyles["buttons"]}>
        {structure["user-dashboard"]["pop-ups"][deletePopup.type][
          "buttons-copy"
        ].map((button, index) => {
          if (index === 1) {
            // Submit  button
            return (
              <button
                key={button}
                className={clsx(
                  formStyles["submit-button"],
                  popUpContainerStyles["submit-button"],
                  "solid",
                  "basic-button",
                  "warning",
                  loading && "loading"
                )}
                type="button"
                onClick={() => onSubmit(structure)}
              >
                {button}
              </button>
            );
          } else {
            // Close button
            return (
              <button
                key={button}
                className="basic-button outline warning"
                type="button"
                onClick={() => setDeletePopup({ type: "" })}
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
    </PopUpContainer>
  );
}
