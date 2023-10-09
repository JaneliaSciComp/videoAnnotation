import React, {useState, useEffect} from 'react';
import {Button} from 'react-bootstrap';
import styles from '../styles/Button.module.css';
import { useStates, useStateSetters } from './StatesContext';


export default function ShapeBtn(props) {
    /*
        To annotate an object on the frame. Activate drawing on canvas.
        Props: 
            type='bbox'
            label='Mouse' 
            color='red'
            drawType={drawType}
            setDrawType={setDrawType} 
            frameNum={frameNum}
            frameUrl={frameUrl}
            addAnnotationObj={addAnnotationObj}
    */
    const [clicked, setClicked] = useState(false);
    
    const drawType = useStates().drawType;
    const frameNum = useStates().frameNum;
    const frameUrl = useStates().frameUrl;
    const setDrawType = useStateSetters().setDrawType;
    const addAnnotationObj = useStateSetters().addAnnotationObj;
    
    console.log(drawType, frameNum,frameUrl,setDrawType, addAnnotationObj);

    // useEffect(() => {
    //     if (!props.drawType) {
    //         setClicked(false);
    //     }
    // }, [props.drawType])

    useEffect(() => {
        if (!drawType) {
            setClicked(false);
        }
    }, [drawType])

    
    function clickHandler() {
        if (Number.isInteger(props.frameNum) || props.frameUrl) {
            const id = Date.now().toString();
            props.setDrawType(props.type);
            props.addAnnotationObj({
                id: id,
                frameNum: props.frameNum,
                label: props.label,
                color: props.color,
                type: props.type,         
            });
            // console.log('shape called', props);
            setClicked(true);
        }
       
    }

    function clickHandler() {
        if (Number.isInteger(frameNum) || frameUrl) {
            const id = Date.now().toString();
            setDrawType(props.type);
            addAnnotationObj({
                id: id,
                frameNum: frameNum,
                label: props.label,
                color: props.color,
                type: props.type,         
            });
            // console.log('shape called', props);
            setClicked(true);
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