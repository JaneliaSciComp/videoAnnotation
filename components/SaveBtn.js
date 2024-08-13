import React, {useState, useEffect} from 'react';
import {Button} from 'react-bootstrap';
import styles from '../styles/Button.module.css';
import { useStates, useStateSetters } from './AppContext';
import { clearUnfinishedAnnotation } from '../utils/utils.js';


/*
    Props: 
        type: 'annotation' / 'configuration'
        mode: 'inMenu' / 'sole', 'sole' by default. 'inMenu' is for embedding into DropdownMenu, there will not be btn UI. The developer should follow the DropdownMenu's rule to provide label for the comp, while the onClick event handler is already handled in DropdownMenu.
        
*/
export default function SaveBtn(props) {
    

    const frameUrl = useStates().frameUrl;
    const setSaveConfig = useStateSetters().setSaveConfig;
    const setSaveAnnotation = useStateSetters().setSaveAnnotation;
    const projectId = useStates().projectId;

    function clickHandler() {
        if (props.type === 'configuration') {
            if (projectId || frameUrl) {
                setSaveConfig(true);
            }
        } else if (props.type === 'annotation') {
            if (projectId || frameUrl) {
                setSaveAnnotation(true);
            }
        }
    }
    return (
        <>
            {props.mode !== 'inMenu' ?
                <Button className={styles.btn} onClick={clickHandler}>
                    {props.children}
                </Button>
                :
                null
            }
        </>
    )
}
