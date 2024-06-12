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
