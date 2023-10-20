import React, {useState, useEffect, useRef} from 'react';
import { Button, Row, Col} from 'react-bootstrap';
import { Space, Radio, Slider } from 'antd';
import { ClearOutlined } from '@ant-design/icons';
import styles from '../styles/Button.module.css';
import { useStateSetters, useStates } from './AppContext';
import {defaultColor} from '../utils/utils.js';


// const defaultColor = '#1677FF';
const MIN_THICKNESS = 1;
const MAX_THICKNESS = 100;

export default function BrushBtn(props) {
    /**
     * To activate/deactivate brush segmentation drawing on canvas. Contains eraser btn and brush thichness slider
     * Brush segmentation annotation data structure:
     *      {id: {
                type: 'brush',
                color: '#000000',
                label: 'mouse',
                data: [128, 29, ...] //RLE format
            }}
     * 
     * Props: 
            type: 'brush'
            label: 'Mouse'. Required 
            color: 'red'. Optional. If not provided, use defaultColor
            minThinkness: int. To set the min value of slider to config the thickness of brush. Optional. If not provided, use MIN_THICKNESS
            maxThickness: int. To set the max value of slider to config the thickness of brush. Optional. If not provided, use MAX_THICKNESS
            enableCrowdRadio
     */
    const [radioValue, setRadioValue] = useState(0);
    // const [thickness, setThickness] = useState(5);
    const annotationIdRef = useRef(); // to remember the annotation id for this brush btn, to retrieve anno data so that can add crowded info, to reset annoIdtoDraw for parent 

    // get context
    const drawType = useStates().drawType;
    const frameNum = useStates().frameNum;
    const frameUrl = useStates().frameUrl;
    const setDrawType = useStateSetters().setDrawType;
    // const addAnnotationObj = useStateSetters().addAnnotationObj;
    const frameAnnotation = useStates().frameAnnotation;
    const setFrameAnnotation = useStateSetters().setFrameAnnotation;
    const useEraser = useStates().useEraser;
    const setUseEraser = useStateSetters().setUseEraser;
    const brushThickness = useStates().brushThickness;
    const setBrushThickness = useStateSetters().setBrushThickness;
    const setAnnoIdToDraw = useStateSetters().setAnnoIdToDraw;

    useEffect(()=>{
        if (!props.label) {
            throw Error('Label cannot be empty');
        }

        // initialize brushThickness
        if (!brushThickness) {
            setBrushThickness(5);
        }
    }, [])


    // useEffect(() => {
    //     if (!drawType) { 
    //         annotationIdRef.current = null;
    //     } 
    // }, [drawType])


    function clickHandler() {
        // draw brush, finish draw brush, can only be decided by clicking the btn, not by canvas
        if (drawType===null) {
            setDrawType('brush');
            
            if (Number.isInteger(frameNum) || frameUrl) {
                if (!annotationIdRef.current) { // brush seg reuse the same annoObj, so only initialize annoObj when first time click
                    // create anno obj, add to frameAnno, activate draw mode
                    const id = Date.now().toString();
                    annotationIdRef.current = id;
                    setDrawType('brush'); // drawType changed, useEffect will add default radio value
                    const annoObj = {
                        id: id,
                        type: 'brush',   
                        frameNum: frameNum,
                        label: props.label,
                        color: props.color ? props.color : defaultColor,
                        data: [],
                        isCrowd: 0
                    };
                    setFrameAnnotation({...frameAnnotation, [id]: annoObj});
                }
                setAnnoIdToDraw(annotationIdRef.current)
            }

        } else if (drawType==='brush') {
            setDrawType(null);
            setUseEraser(null);
        }
    }

    function onRadioChange(e) {        
        // update radio value to annotation
        if (drawType==='brush') { // only if already activated draw mode
            setRadioValue(e.target.value);
            const annotation = {...frameAnnotation[annotationIdRef.current]};
            annotation.isCrowd=e.target.value;
            setFrameAnnotation({...frameAnnotation, [annotationIdRef.current]: annotation});
        }
    };

    function sliderChangeHandler(newValue) {
        if (drawType==='brush') {
            setBrushThickness(newValue);
        }
    }

    function onEraserBtnClick() {
        if (drawType==='brush' && useEraser) {
            setUseEraser(null);
        } else if (drawType==='brush' && !useEraser) {
            setUseEraser(true);
        }
    }

    //direction="vertical"

    return (
        // <Row >
        <div className={styles.brushBtnContainer}>
            {/* <Col md={4} className={styles.brushBtn}> */}
            <div className={styles.brushBtn}>
                <Button className={styles.btn}
                    style={{color:drawType==='brush'?'white':(props.color?props.color:defaultColor), 
                            background: drawType==='brush'?(props.color?props.color:defaultColor):'white', 
                            border:'2px solid '+(props.color?props.color:defaultColor)}} 
                    onClick={clickHandler}>
                    {props.label}
                </Button> 
            </div>
            {/* </Col>
            
            <Col md={6}> */}
            <div >
                {/* <Row > */}
                <div className={styles.brushToolContainer}>
                    <Col xs={2} className={styles.eraserBtnContainer}>
                        <Button className={styles.eraserBtn}
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
                    <Col xs={10} className='px-1'>
                        <Slider 
                            min={props.minThickness?props.minThickness:MIN_THICKNESS}
                            max={props.maxThickness?props.maxThickness:MAX_THICKNESS}
                            // marks={{0:'0', []:`${totalFrameCount}`}}
                            onChange={sliderChangeHandler}
                            value={brushThickness}
                            />
                    </Col>
                </div>
                {/* </Row> */}
                {props.enableCrowdRadio ?
                    // <Row>
                    <div>
                        <Radio.Group value={radioValue} onChange={onRadioChange}>
                            <Space >
                                <Radio value={0}>single</Radio>
                                <Radio value={1}>is crowd</Radio>
                            </Space>
                        </Radio.Group>
                    {/* </Row>  */}
                    </div>
                    : null 
                }
                

            </div>    
            {/* </Col> */}
            
        </div>
        // </Row>
    )
}