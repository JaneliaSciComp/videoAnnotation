import React, {useState, useEffect} from 'react';
import {Button} from 'react-bootstrap';
import styles from '../styles/Button.module.css';
import { useStates, useStateSetters } from './AppContext';
import { clearUnfinishedAnnotation } from '../utils/utils.js';


export default function TrainBtn(props) {
    /*
        
        Props: 
            onClick: 
    */

    const frameNum = useStates().frameNum;
    const frameUrl = useStates().frameUrl;
    const frameAnnotation = useStates().frameAnnotation;
    const setFrameAnnotation = useStateSetters().setFrameAnnotation;

    function clickHandler() {
        // if (Number.isInteger(frameNum) || frameUrl) {
        //     //TODO: trigger getBrushData()
            
        //     // clear unfinished polygon and skeleton annoObj before setting new annoIdToDraw
        //     const annoCopy = clearUnfinishedAnnotation(frameAnnotation);
        //     setFrameAnnotation(annoCopy);

        //     const json = JSON.stringify(annoCopy);
        //     const a = document.createElement("a");
        //     const file = new Blob([json], {type: 'text/plain'});
        //     a.href = URL.createObjectURL(file);
        //     a.download = 'annotations.json';
        //     a.click();
        //     URL.revokeObjectURL(a.href);
        // }
        if (props.onClick) {
            props.onClick();
        }
        
    }

    return (
        <Button className={styles.btn} onClick={clickHandler} variant="success">
            Train
        </Button>
    )
}
