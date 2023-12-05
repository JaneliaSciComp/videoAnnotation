import React, {useState, useEffect} from 'react';
import {Button} from 'react-bootstrap';
import styles from '../styles/Button.module.css';
import { useStates, useStateSetters } from './AppContext';
import { clearUnfinishedAnnotation } from '../utils/utils.js';


export default function SaveBtn(props) {
    /*
        
        Props: 
            
    */
    const [clicked, setClicked] = useState(false);

    const frameNum = useStates().frameNum;
    const frameUrl = useStates().frameUrl;
    const frameAnnotation = useStates().frameAnnotation;
    const setFrameAnnotation = useStateSetters().setFrameAnnotation;
    const setSave = useStateSetters().setSave;

    function clickHandler() {
        if (Number.isInteger(frameNum) || frameUrl) {
            //TODO: trigger getBrushData()
            
            // // clear unfinished polygon and skeleton annoObj before setting new annoIdToDraw
            // const annoCopy = clearUnfinishedAnnotation(frameAnnotation);
            // setFrameAnnotation(annoCopy);
            setSave(true);

            // const json = JSON.stringify(annoCopy);
            // const a = document.createElement("a");
            // const file = new Blob([json], {type: 'text/plain'});
            // a.href = URL.createObjectURL(file);
            // a.download = 'annotations.json';
            // a.click();
            // URL.revokeObjectURL(a.href);
        }
    }

    return (
        <Button className={styles.btn} onClick={clickHandler}>
            Save
        </Button>
    )
}
