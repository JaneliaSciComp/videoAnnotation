import React, {useState, useEffect} from 'react';
import {Button} from 'react-bootstrap';
import styles from '../styles/Button.module.css';
import { useStates, useStateSetters } from './AppContext';
import { clearUnfinishedAnnotation } from '../utils/utils.js';



export default function ShapeBtn(props) {
    /*
        To annotate an object on the frame. Activate drawing on canvas.
        Props: 
            type='bbox'
            label='Mouse' 
            color='red'
            // drawType={drawType}
            // setDrawType={setDrawType} 
            // frameNum={frameNum}
            // frameUrl={frameUrl}
            // addAnnotationObj={addAnnotationObj}
    */
    const [clicked, setClicked] = useState(false);
    
    const drawType = useStates().drawType;
    const frameNum = useStates().frameNum;
    const frameUrl = useStates().frameUrl;
    const setDrawType = useStateSetters().setDrawType;
    const frameAnnotation = useStates().frameAnnotation;
    const setFrameAnnotation = useStateSetters().setFrameAnnotation;
    const annoIdToDraw = useStates().annoIdToDraw;
    const setAnnoIdToDraw = useStateSetters().setAnnoIdToDraw;
    const setSkeletonLandmark = useStateSetters().setSkeletonLandmark;
    const setUndo = useStateSetters().setUndo;
    const setUseEraser = useStateSetters().setUseEraser;
    const videoId = useStates().videoId; 



    useEffect(() => {
        if (!drawType || drawType !== props.type || frameAnnotation[annoIdToDraw].label !== props.label) {
            setClicked(false);
        }
    }, [drawType])

    
       

    function clickHandler() {
        if (Number.isInteger(frameNum) || frameUrl) {
            const annoCopy = clearUnfinishedAnnotation({...frameAnnotation});

            const id = Date.now().toString();
            setDrawType(props.type);
            const annoObj = {
                id: id,
                videoId: videoId,
                frameNum: frameNum,
                label: props.label,
                color: props.color,
                type: props.type,         
            };
            annoCopy[id] = annoObj;
            setFrameAnnotation(annoCopy);
            setClicked(true);
            setAnnoIdToDraw(id);
            setSkeletonLandmark(null);
            setUndo(0);
            setUseEraser(null);
            
        }
       
    }

    return (
        <Button className={styles.btn}
            style={{color:clicked?'white':props.color, background: clicked?props.color:'white', border:'2px solid '+props.color}} 
            onClick={clickHandler}>
        {props.label}
        </Button>
    )
}