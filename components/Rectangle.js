import React, {useState, useEffect, useRef} from 'react';
import {Button} from 'react-bootstrap';


export default function Rectangle(props) {
    function clickHandler() {
        props.addRect()
    }

    return (
        <Button onClick={clickHandler}>{props.label}</Button>
    )
}