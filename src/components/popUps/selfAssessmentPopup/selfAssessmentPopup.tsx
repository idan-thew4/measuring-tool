"use client";
import { useStore } from "../../../contexts/Store";
import { PopUpContainer } from "../popUpContainer/popUpContainer";
import popUpContainerStyles from "../popUpContainer/pop-up-container.module.scss";
import { useParams, useRouter } from "next/navigation";

export function SelfAssessmentPopup() {
  const { structure, setSelfAssessmentPopup, selfAssessmentPopup } = useStore();
  const params = useParams();
  const [chapter, subChapter, principle] = params?.chapters || [];

  const router = useRouter();

  if (!selfAssessmentPopup) return null;
  if (!structure) return <div>Loading...</div>;

  const selfAssessment = {
    "pop-up": {
      title: "האם אתה מעוניין בהערכה עצמית של המייזם",
      "buttons-copy": ["הערכת המיזם", "החל במדידה"],
    },
    headline: "הערכה עצמית לרמת הקיימות של המיזם",
    "sub-headline":
      "הזז את המחלק (סליידר) לציון אותו אתה מעריך שהמיזם יקבל בסיום ההערכה",
    "summary-title": "הערכה עצמית",
    "graph-headlines": [
      "רמת הקיימות המוערכת של המיזם לפי פרק",
      "רמת הקיימות המוערכת של המיזם בפרק עיצוב ותכנון",
    ],
  };

  return (
    <PopUpContainer
      // Change hard copy to. copy from strcture
      headline={selfAssessment["pop-up"].title}
      closeButton={() => setSelfAssessmentPopup(false)}
    >
      <div className={popUpContainerStyles["buttons"]}>
        {selfAssessment["pop-up"]["buttons-copy"].map((button, index) => (
          <button
            className={`basic-button ${index === 0 ? "solid" : "outline"}`}
            key={index}
            onClick={() => {
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
        ))}
      </div>
    </PopUpContainer>
  );
}
