import { Button } from "react-bootstrap";
import styles from "../styles/Button.module.css";
import { useStates, useStateSetters } from "./AppContext.js";

/*
    Save annotation to backend db when clicked.
    Props:
        mode: 'inMenu' / 'sole', 'sole' by default.
          'inMenu' is for embedding into DropdownMenu, there will not be btn UI.
          The developer should follow the DropdownMenu's rule to provide label for
          the comp, while the onClick event handler is already handled in DropdownMenu.

*/
export default function SaveAnnotationBtn({ mode, children }) {
  const frameUrl = useStates().frameUrl;
  const videoId = useStates().videoId;
  const setGlobalInfo = useStateSetters().setGlobalInfo;
  const setSaveAnnotation = useStateSetters().setSaveAnnotation;

  async function clickHandler() {
    if (videoId || frameUrl) {
      setSaveAnnotation(true);
    } else {
      setGlobalInfo("No video to save.");
    }
  }

  return (
    <>
      {mode !== "inMenu" ? (
        <Button className={styles.btn} onClick={clickHandler}>
          {children}
        </Button>
      ) : null}
    </>
  );
}
