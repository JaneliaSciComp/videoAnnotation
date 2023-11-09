import React, {useState, useEffect, useRef} from 'react';
import { Button, Row, Col} from 'react-bootstrap';
import { Space, Radio, Slider } from 'antd';
import { ClearOutlined, RollbackOutlined } from '@ant-design/icons';
import styles from '../styles/Button.module.css';
import { useStateSetters, useStates } from './AppContext';
import BrushTool from './BrushTool';
import {defaultColor} from '../utils/utils.js';
import { clearUnfinishedAnnotation } from '../utils/utils.js';

// const defaultColor = '#1677FF';


export default function BrushBtn(props) {
    /**
     * Note: for developer, creating multiple BrushBtn of a same label will result in error, 
     * because these BrushBtn use label to distinguish from each other.
     *     For annotator, when use BtnGroupController, Design to configuire BrushBtns, 
     * using a same label for multiple BrushBtns will result in error too.
     * 
     * To activate/deactivate brush segmentation drawing on canvas. Contains eraser btn and brush thichness slider
     * Each frame/img each label only has one brush annotation obj.
     * Brush segmentation annotation data structure:
     *      {id: {
                type: 'brush',
                color: '#000000',
                label: 'mouse',
                iscrowd: 0 or 1. Indicates the segmentation covers single or multiple target objects.
                first: 0 or 1. Indicates the first number in data(rle) is inside (1) segmentation or not (0)
                data: [128, 29, ...]. RLE format
                pathes: [pathStr1, pathStr2, ...]. The stringified fabric path objs for this brush btn.
            }}
     * 
     * Props: 
            label: 'Mouse'. Required 
            color: 'red'. Optional. If not provided, use defaultColor
            minThinkness: int. To set the min value of slider to config the thickness of brush. Optional. If not provided, use MIN_THICKNESS
            maxThickness: int. To set the max value of slider to config the thickness of brush. Optional. If not provided, use MAX_THICKNESS
            enableBrushTool: useful when there is only one brush btn. not recommended for multiple brush btns since one brushTool controls all brush drawing. 
            disableCrowdRadio
     */
    const [radioValue, setRadioValue] = useState(0);
    // const [thickness, setThickness] = useState(5);
    const annotationIdRef = useRef(); // to remember the annotation id for this brush btn, to retrieve anno data so that can add crowded info, to reset annoIdtoDraw for parent 
    const prevFrameUrlRef = useRef();

    // get context
    const drawType = useStates().drawType;
    const frameNum = useStates().frameNum;
    const frameUrl = useStates().frameUrl;
    const setDrawType = useStateSetters().setDrawType;
    // const addAnnotationObj = useStateSetters().addAnnotationObj;
    const frameAnnotation = useStates().frameAnnotation;
    const setFrameAnnotation = useStateSetters().setFrameAnnotation;
    // const useEraser = useStates().useEraser;
    const setUseEraser = useStateSetters().setUseEraser;
    // const brushThickness = useStates().brushThickness;
    // const setBrushThickness = useStateSetters().setBrushThickness;
    // const undo = useStates().undo;
    // const setUndo = useStateSetters().setUndo;
    const annoIdToDraw = useStates().annoIdToDraw;
    const setAnnoIdToDraw = useStateSetters().setAnnoIdToDraw;
    const setSkeletonLandmark = useStateSetters().setSkeletonLandmark;
    const setUndo = useStateSetters().setUndo;

    useEffect(()=>{
        if (!props.label) {
            throw Error('Label cannot be empty');
        }

        // // initialize brushThickness
        // if (!brushThickness) {
        //     setBrushThickness(5);
        // }
    }, [])


    useEffect(() => {
        /** when switch to a new frame or img, this btn should be ready to create another annoObj, so change annoIdRef to null;
         *  when switch to a previous frame, it should first see if there is created annoObj. If yes, use that annoId; if not, set annoIdRef to null 
         */ 
        // console.log('brushbtn1', annotationIdRef.current); 
        if (frameUrl !== prevFrameUrlRef.current) {
            annotationIdRef.current = null;
            if (frameAnnotation) {
                const annoObj = Object.values(frameAnnotation).filter(obj=> obj.type==='brush' && obj.label===props.label)[0];
                if (annoObj) {
                    annotationIdRef.current = annoObj.id;
                }
            }
            prevFrameUrlRef.current = frameUrl;
        }
        // console.log('brushbtn frameAnno useEffect', annotationIdRef.current); 
       
    }, [frameAnnotation])

    // useEffect(() => {
    //     /** when switch to a new frame or img, this btn should be ready to create another annoObj, so change annoIdRef to null;
    //      *  when switch to a previous frame, it should first see if there is created annoObj. If yes, use that annoId; if not, set annoIdRef to null 
    //      */ 
    //     // console.log('brushbtn1', annotationIdRef.current); 
    //     prevFrameUrlRef.current = 
    //     // console.log('brushbtn frameUrl useEffect', annotationIdRef.current); 
    //     // if (frameAnnotation) {
    //     //     const annoObj = Object.values(frameAnnotation).filter(obj=> obj.type==='brush' && obj.label===props.label)[0];
    //     //     if (annoObj) {
    //     //         annotationIdRef.current = annoObj.id;
    //     //     }
    //     // }
    //     // console.log('brushbtn3', annotationIdRef.current); 
       
    // }, [frameUrl])

    


    function clickHandler() {
        // draw brush, finish draw brush, can only be decided by clicking the btn, not by canvas
        if (Number.isInteger(frameNum) || frameUrl) {
            let annoCopy = clearUnfinishedAnnotation(frameAnnotation);

            if (drawType === null || drawType !== 'brush') { // no btn is activated or non-brush btn is activated               
                if (!annotationIdRef.current) { // brushBtn reuse the same annoObj, so only initialize annoObj when first time click
                    annoCopy = createNewAnnoObj(annoCopy);
                }
                setAnnoIdToDraw(annotationIdRef.current)
                setDrawType('brush'); // drawType changed, useEffect will add default radio value
    
            } else if (drawType==='brush') { 
                if (annoIdToDraw === annotationIdRef.current) { // this btn is the activated brush btn, should deactivate it
                    setDrawType(null);
                    setAnnoIdToDraw(null); // should be set canvas, since canvas needs annoId to generate rle 
                } else { // this is an inactivated btn, should activate it
                    if (!annotationIdRef.current) {
                        annoCopy = createNewAnnoObj(annoCopy);
                    }
                    setAnnoIdToDraw(annotationIdRef.current);
                }
            }
            setFrameAnnotation(annoCopy);
            setSkeletonLandmark(null);
            setUndo(0);
            setUseEraser(null);
        }
       
    }

    function createNewAnnoObj(annoCopy) {
        // create anno obj, add to frameAnno, activate draw mode
        const id =Date.now().toString(); //'123'; // 
        annotationIdRef.current = id;
        const annoObj = {
            id: id,
            type: 'brush',   
            frameNum: frameNum,
            label: props.label,
            color: props.color ? props.color : defaultColor,
            data: [],
            first: null,
            isCrowd: 0,
            // hasPath: false // indicate if at least one path obj is created for this annoObj
        };
        annoCopy[id] = annoObj;
        return annoCopy;
    }

    function onRadioChange(e) {        
        // update radio value to annotation
        if (drawType==='brush' && annoIdToDraw===annotationIdRef.current) { // only if draw mode is activated, and this btn is activated 
            setRadioValue(e.target.value);
            const annotation = {...frameAnnotation[annotationIdRef.current]};
            annotation.isCrowd=e.target.value;
            setFrameAnnotation({...frameAnnotation, [annotationIdRef.current]: annotation});
        }
    };


    //direction="vertical"

    return (
        // <Row >
        <div className={styles.brushBtnContainer}
            style={{margin: ((props.enableBrushTool || !props.disableCrowdRadio) ? '0.2em' : '0') + ' 0'}}>
            {/* <Col md={4} className={styles.brushBtn}> */}
            <div className={styles.brushBtn}>
                <Button className={styles.btn}
                    style={{color: (drawType==='brush'&&annoIdToDraw===annotationIdRef.current)?'white':(props.color?props.color:defaultColor), 
                            background: (drawType==='brush'&&annoIdToDraw===annotationIdRef.current)?(props.color?props.color:defaultColor):'white', 
                            border:'2px solid '+(props.color?props.color:defaultColor)}} 
                    onClick={clickHandler}>
                    {props.label}
                </Button> 
            </div>
            {/* </Col>
            
            <Col md={6}> */}
            {(props.enableBrushTool || !props.disableCrowdRadio) ?
                <div className='ms-2'>
                    {/* <Row > */}
                    {props.enableBrushTool ? 
                        <BrushTool minThinkness={props.minThinkness} maxThickness={props.maxThickness}/> 
                        : null}
                    
                    {!props.disableCrowdRadio ?
                        // <Row>
                        <div>
                            <Radio.Group 
                                value={radioValue} 
                                onChange={onRadioChange} 
                                disabled={!(drawType==='brush'&&annoIdToDraw===annotationIdRef.current)}
                                >
                                {/* <Space > */}
                                    <Radio value={0}>single</Radio>
                                    <Radio value={1}>crowd</Radio>
                                {/* </Space> */}
                            </Radio.Group>
                        {/* </Row>  */}
                        </div>
                        : null 
                    }
                </div> 
                :null
            }   
            {/* </Col> */}
            
        </div>
        // </Row>
    )
}