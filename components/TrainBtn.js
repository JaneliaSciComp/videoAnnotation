import React from "react";
import { Button } from "react-bootstrap";
import styles from "../styles/Button.module.css";

/*
  Props:
    onClick:
*/
export default function TrainBtn({ onClick }) {

  function clickHandler() {
    if (onClick) {
      onClick();
    }
  }

  return (
    <Button className={styles.btn} onClick={clickHandler} variant="success">
      Train
    </Button>
  );
}
