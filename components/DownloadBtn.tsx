import { Button } from "react-bootstrap";
import styles from "../styles/Button.module.css";
import { useStates, useStateSetters } from "./AppContext";

/*
    Props: 
        type: 'annotation' / 'configuration'
        mode: 'inMenu' / 'sole', 'sole' by default. 'inMenu' is for embedding into DropdownMenu, there will not be btn UI. The developer should follow the DropdownMenu's rule to provide label for the comp, while the onClick event handler is already handled in DropdownMenu.
        
*/

interface DownloadBtnProps{
  type: 'configuration' | 'annotation',
  mode: string,
  children?: any
}

export default function DownloadBtn({type, mode, children}: DownloadBtnProps) {
  const frameUrl = useStates().frameUrl;
  const setDownloadConfig = useStateSetters().setDownloadConfig;
  const setDownloadAnnotation = useStateSetters().setDownloadAnnotation;
  const projectId = useStates().projectId;

  function clickHandler() {
    if (type === "configuration") {
      if (projectId || frameUrl) {
        setDownloadConfig(true);
      }
    } else if (type === "annotation") {
      if (projectId || frameUrl) {
        setDownloadAnnotation(true);
      }
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
