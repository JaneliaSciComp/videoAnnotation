import React, {useState, useEffect} from 'react';
import {Button} from 'react-bootstrap';
import styles from '../styles/Button.module.css';
import { useApp } from './AppContext';
import { clearUnfinishedAnnotation, createId } from '../utils/utils.js';



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
    
    const drawType = useApp().drawType;
    const frameNum = useApp().frameNum;
    const frameUrl = useApp().frameUrl;
    const setDrawType = useApp().setDrawType;
    const frameAnnotation = useApp().frameAnnotation;
    const setFrameAnnotation = useApp().setFrameAnnotation;
    const annoIdToDraw = useApp().annoIdToDraw;
    const setAnnoIdToDraw = useApp().setAnnoIdToDraw;
    const setSkeletonLandmark = useApp().setSkeletonLandmark;
    const setUndo = useApp().setUndo;
    const setUseEraser = useApp().setUseEraser;
    const videoId = useApp().videoId; 



    useEffect(() => {
        if (!drawType || drawType !== props.type || frameAnnotation[annoIdToDraw].label !== props.label) {
            setClicked(false);
        }
    }, [drawType])

    
       

    function clickHandler() {
        if (Number.isInteger(frameNum) || frameUrl) {
            const annoCopy = clearUnfinishedAnnotation({...frameAnnotation});

            const id = createId();
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