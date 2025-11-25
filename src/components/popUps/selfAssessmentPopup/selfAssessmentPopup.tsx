"use client";
import { useStore } from "../../../contexts/Store";
import { PopUpContainer } from "../popUpContainer/popUpContainer";
import popUpContainerStyles from "../popUpContainer/pop-up-container.module.scss";
import { useParams, useRouter } from "next/navigation";
import { use, useEffect } from "react";

export function SelfAssessmentPopup() {
  const {
    structure,
    setSelfAssessmentPopup,
    selfAssessmentPopup,
    setActiveSideMenu,
  } = useStore();
  const params = useParams();
  const [chapter, subChapter, principle] = params?.chapters || [];

  const router = useRouter();

  if (!selfAssessmentPopup) return null;
  if (!structure) return <div>Loading...</div>;

  return (
    <PopUpContainer
      headline={structure["self-assessment"]["pop-up"].title}
      closeButton={() => setSelfAssessmentPopup(false)}
    >
      <div className={popUpContainerStyles["buttons"]}>
        {structure["self-assessment"]["pop-up"]["buttons-copy"].map(
          (button, index) => (
            <button
              className={`basic-button ${index === 0 ? "solid" : "outline"}`}
              key={index}
              onClick={() => {
                setSelfAssessmentPopup(false);
                setActiveSideMenu(false);

                if (index === 0) {
                  router.push(
                    `/tool/${params.project_id}/${params.alternative_id}/self-assessment`
                  );
                } else {
                  router.push(
                    `/tool/${params.project_id}/${params.alternative_id}/${structure.questionnaire.content[0]["chapter-slug"]}/1/1`
                  );
                }
              }}
            >
              {button}
            </button>
          )
        )}
      </div>
    </PopUpContainer>
  );
}
