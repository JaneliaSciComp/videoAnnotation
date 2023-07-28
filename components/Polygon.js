import React from 'react';
import {Button} from 'react-bootstrap';
import styles from '../styles/DrawBtn.module.css';


export default function Polygon(props) {
    function clickHandler() {
        const id = Date.now().toString();
        props.setDrawPolygon(!props.drawPolygon);
    }

    return (
        <Button className={styles.btn} onClick={clickHandler}>{props.label}</Button>
    )
}