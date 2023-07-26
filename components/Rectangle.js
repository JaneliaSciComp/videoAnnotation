import React, {useState, useEffect, useRef} from 'react';
import {Button} from 'react-bootstrap';
import styles from '../styles/Rectangle.module.css';


export default function Rectangle(props) {
    function clickHandler() {
        const id = Date.now().toString();
        props.addRectId({
            id: id,
            label: props.label,
            color: props.color,
            type: 'rect'         
        });
    }

    return (
        <Button className={styles.btn} onClick={clickHandler}>{props.label}</Button>
    )
}