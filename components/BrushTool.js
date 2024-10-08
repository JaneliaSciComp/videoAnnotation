import React, {useState, useEffect, useRef} from 'react';
import { Button, Row, Col} from 'react-bootstrap';
import { Space, Radio, Slider } from 'antd';
import { ClearOutlined, RollbackOutlined } from '@ant-design/icons';
import styles from '../styles/Button.module.css';
import { useStateSetters, useStates } from './AppContext';
import {defaultColor} from '../utils/utils.js';

const MIN_THICKNESS = 1;
const MAX_THICKNESS = 100;


/**
 *  props:
 *      minThinkness: int. To set the min value of slider to config the thickness of brush. Optional. If not provided, use MIN_THICKNESS
        maxThickness: int. To set the max value of slider to config the thickness of brush. Optional. If not provided, use MAX_THICKNESS
*/
export default function BrushTool(props) {

    const drawType = useStates().drawType;
    const brushThickness = useStates().brushThickness;
    const setBrushThickness = useStateSetters().setBrushThickness;
    const useEraser = useStates().useEraser;
    const setUseEraser = useStateSetters().setUseEraser;
    const undo = useStates().undo;
    const setUndo = useStateSetters().setUndo;

    function undoClickHandler() {
        if (drawType==='brush') {
            setUndo(undo+1);
        } 
    }

    function onEraserBtnClick() {
            setUseEraser(!useEraser);
    }

    function sliderChangeHandler(newValue) {
            setBrushThickness(newValue);
    }

    return (
        <div className={styles.brushToolContainer}>
            <Col xs={1} className={styles.iconBtnContainer}> 
                <Button className={[styles.iconBtn, styles.undoBtn, styles.btn]}
                    size='sm'
                    variant="light"
                    onClick={undoClickHandler}
                    >
                        <RollbackOutlined />
                </Button>
            </Col>
            <Col xs={1} className={styles.iconBtnContainer}> 
                <Button className={[styles.iconBtn, styles.btn]}
                    size='sm'
                    variant="light"
                    style={{color:useEraser?'white':'rgb(100, 100, 100)', 
                            background: useEraser?defaultColor:'white', 
                            border: useEraser?('1px solid'+defaultColor):'1px solid rgb(100, 100, 100)'}} 
                    onClick={onEraserBtnClick}
                    >
                        <ClearOutlined />
                </Button>
            </Col>
            <Col xs={8} className={styles.brushSliderContainer}>
                <Slider 
                    min={props.minThickness?props.minThickness:MIN_THICKNESS}
                    max={props.maxThickness?props.maxThickness:MAX_THICKNESS}
                    onChange={sliderChangeHandler}
                    value={brushThickness}
                    />
            </Col>
        </div>
        
    )
}