import React, {useState, useEffect} from 'react';
import {Button} from 'react-bootstrap';
import styles from '../styles/Button.module.css';


export default function BtnPrototype(props) {
    const [clicked, setClicked] = useState(false);

    useEffect(() => {
        if (!props.drawType) {
            setClicked(false);
        }
    }, [props.drawType])

    
    function clickHandler() {
        const id = Date.now().toString();
        props.setDrawType(props.type);
        props.addAnnotationObj({
            id: id,
            frameNum: props.frameNum,
            label: props.label,
            color: props.color,
            type: props.type,         
        });
        setClicked(true);
    }

    return (
        <Button className={styles.btn} 
            style={{color:clicked?'white':props.color, background: clicked?props.color:'white', border:'2px solid '+props.color}} 
            onClick={clickHandler}>
        {props.label}
        </Button>
    )
}