import {useState, useEffect} from 'react';
import {Button} from 'react-bootstrap';
import styles from '../styles/Button.module.css';
import { useStates, useStateSetters } from './AppContext.js';
import {postVideoAnnotation} from '../utils/requests.js';


/*
    Save annotation to backend db when clicked.
    Props: 
        mode: 'inMenu' / 'sole', 'sole' by default. 'inMenu' is for embedding into DropdownMenu, there will not be btn UI. The developer should follow the DropdownMenu's rule to provide label for the comp, while the onClick event handler is already handled in DropdownMenu.
        
*/
export default function SaveAnnotationBtn(props) {
    

    const frameUrl = useStates().frameUrl;
    const videoId = useStates().videoId;
    const annotationRef = useStates().annotationRef;
    const setGlobalInfo = useStateSetters().setGlobalInfo;

    async function clickHandler() {
        if (videoId || frameUrl) {
            const annotations = Object.values(annotationRef.current).map(frameAnno => Object.values(frameAnno))
            const data = {
                annotations: annotations.flat(),
                videoId: videoId,
            }
            const res = await postVideoAnnotation(data);
            console.log('save annotation to db', res);
            if (res.success) {
                setGlobalInfo('Annotation successfully saved to database.');
            } else {
                setGlobalInfo('Failed to save annotation to database.');
            }
        } else {
            setGlobalInfo('No video to save.');
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
