import React from 'react';
import {Button} from 'react-bootstrap';
import styles from '../styles/Button.module.css';


export default function Rectangle(props) {
    function clickHandler() {
        const id = Date.now().toString();
        props.setDrawRect(true);
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