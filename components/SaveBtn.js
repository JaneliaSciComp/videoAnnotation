import React, {useState, useEffect} from 'react';
import {Button} from 'react-bootstrap';
import styles from '../styles/Button.module.css';
import { useStates, useStateSetters } from './AppContext';
import { clearUnfinishedAnnotation } from '../utils/utils.js';


/*
    Props: 
        type: 'annotation' / 'configuration'
        
*/
export default function SaveBtn(props) {
    
    // const [clicked, setClicked] = useState(false);

    const frameNum = useStates().frameNum;
    const frameUrl = useStates().frameUrl;
    // const frameAnnotation = useStates().frameAnnotation;
    // const setFrameAnnotation = useStateSetters().setFrameAnnotation;
    const setSaveConfig = useStateSetters().setSaveConfig;
    const setSaveAnnotation = useStateSetters().setSaveAnnotation;

    function clickHandler() {
        if (props.type === 'configuration') {
            setSaveConfig(true);
        } else if (props.type === 'annotation') {
            if (Number.isInteger(frameNum) || frameUrl) {
                setSaveAnnotation(true);
            }
        }
    }

    return (
        <Button className={styles.btn} onClick={clickHandler}>
            Save {props.type}
        </Button>
    )
}
