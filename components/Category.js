import React, {useState, useEffect} from 'react';
import {Button} from 'react-bootstrap';
import styles from '../styles/Button.module.css';
import { useStates, useStateSetters } from './AppContext';

export default function Category(props) {
    /*
        To annotate entire frame.
        Props: 
            label='chase'
            color='black'
            // frameNum={frameNum}
            // addAnnotationObj={addAnnotationObj}
            // setActiveIdObj={setActiveIdObj}
    */
    const [color, setColor] = useState('black');
    
    const frameNum = useStates().frameNum;
    const frameUrl = useStates().frameUrl;
    // const addAnnotationObj = useStateSetters().addAnnotationObj;
    const frameAnnotation = useStates().frameAnnotation;
    const setFrameAnnotation = useStateSetters().setFrameAnnotation;
    const setActiveAnnoObj = useStateSetters().setActiveAnnoObj;

    useEffect(()=> {
        if (props.color) {
            setColor(props.color);
        }
    }, [props.color])

    function clickHandler() {
        if (Number.isInteger(frameNum) || frameUrl) {
            const id = Date.now().toString();
            const annoObj = {
                id: id,
                frameNum: frameNum,
                label: props.label,
                color: color,
                type: 'category',         
            };
            // props.addAnnotationObj(idObj);
            setFrameAnnotation({...frameAnnotation, [id]: annoObj});
            setActiveAnnoObj(annoObj);
        }
    }

    return (
        <Button className={`${styles["btn-category"]} ${styles.btn}`} 
            style={{color: color, background: 'white', border:'2px solid '+color}} 
            onClick={clickHandler}>
        {props.label}
        </Button>
    )
}
