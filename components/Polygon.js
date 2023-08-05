import React, {useState, useEffect} from 'react';
import {Button} from 'react-bootstrap';
import styles from '../styles/Button.module.css';


export default function Polygon(props) {
    const [clicked, setClicked] = useState(false);

    // const style = {
    //     color:clicked?'white':props.color,
    //     background: clicked ? props.color:'white', 
    //     border:'1px solid props.color'
    // };
    
    useEffect(() => {
        if (!props.drawPolygon) {
            setClicked(false);
        }
    }, [props.drawPolygon])

    function clickHandler() {
        const id = Date.now().toString();
        console.log('polygon class ', id);
        props.setDrawPolygon(true);
        props.addPolygonId({
            id: id,
            label: props.label,
            color: props.color,
            type: 'polygon' 
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