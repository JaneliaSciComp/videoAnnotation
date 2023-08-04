import React from 'react';
import {Button} from 'react-bootstrap';
import styles from '../styles/DrawBtn.module.css';


export default function Polygon(props) {
    function clickHandler() {
        const id = Date.now().toString();
        console.log('polygon class ', id);
        props.setDrawPolygon(true);
        props.addPolygonId({
            // [id]: {
                id: id,
                label: props.label,
                color: props.color,
                type: 'polygon' 
            // }
        });
    }

    return (
        <Button className={styles.btn} onClick={clickHandler}>{props.label}</Button>
    )
}