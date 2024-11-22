import React, {useState, useEffect, useRef} from 'react';
import { Button, Row, Col} from 'react-bootstrap';
import { Space, Radio, Slider } from 'antd';
import { ClearOutlined, RollbackOutlined } from '@ant-design/icons';
import styles from '../styles/Button.module.css';
import { useStateSetters, useStates } from './AppContext';
import BrushTool from './BrushTool';
import {defaultColor} from '../utils/utils.js';
import { clearUnfinishedAnnotation, createId } from '../utils/utils.js';


/**
 * Note: for developer, creating multiple BrushBtn of a same label will result in error, 
 * because these BrushBtn use label to distinguish from each other.
 *     For annotator, when use BtnGroupController, BtnConfiguration to configuire BrushBtns, 
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
export default function BrushBtn(props) {
    
    const [radioValue, setRadioValue] = useState(0);
    const annotationIdRef = useRef();
    const prevFrameUrlRef = useRef();

    const drawType = useStates().drawType;
    const frameNum = useStates().frameNum;
    const frameUrl = useStates().frameUrl;
    const setDrawType = useStateSetters().setDrawType;
    const frameAnnotation = useStates().frameAnnotation;
    const setFrameAnnotation = useStateSetters().setFrameAnnotation;
    const setUseEraser = useStateSetters().setUseEraser;
    const annoIdToDraw = useStates().annoIdToDraw;
    const setAnnoIdToDraw = useStateSetters().setAnnoIdToDraw;
    const setSkeletonLandmark = useStateSetters().setSkeletonLandmark;
    const setUndo = useStateSetters().setUndo;
    const videoId = useStates().videoId; 

    useEffect(()=>{
        if (!props.label) {
            throw Error('Label cannot be empty');
        }

    }, [])


    useEffect(() => {
        /** when switch to a new frame or img, this btn should be ready to create another annoObj, so change annoIdRef to null;
         *  when switch to a previous frame, it should first see if there is created annoObj. If yes, use that annoId; if not, set annoIdRef to null 
         */ 
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
       
    }, [frameAnnotation])

       

    


    function clickHandler() {
        if (Number.isInteger(frameNum) || frameUrl) {
            let annoCopy = clearUnfinishedAnnotation({...frameAnnotation});

            if (drawType === null || drawType !== 'brush') {
                if (!annotationIdRef.current) {
                    annoCopy = createNewAnnoObj(annoCopy);
                }
                setAnnoIdToDraw(annotationIdRef.current)
                setDrawType('brush');
    
            } else if (drawType==='brush') { 
                if (annoIdToDraw === annotationIdRef.current) {
                    setDrawType(null);
                    setAnnoIdToDraw(null);
                } else {
                    if (!annotationIdRef.current) {
                        annoCopy = createNewAnnoObj(annoCopy);
                        console.log(annoCopy);
                    }
                    setAnnoIdToDraw(annotationIdRef.current);
                }
            }
            console.log(annoCopy);
            setFrameAnnotation(annoCopy);
            setSkeletonLandmark(null);
            setUndo(0);
            setUseEraser(null);
        }
       
    }

    function createNewAnnoObj(annoCopy) {
        const id = createId(); 
        annotationIdRef.current = id;
        const annoObj = {
            id: id,
            videoId: videoId,
            type: 'brush',   
            frameNum: frameNum,
            label: props.label,
            color: props.color ? props.color : defaultColor,
            data: [],
            isCrowd: 0,
        };
        annoCopy[id] = annoObj;
        return annoCopy;
    }

    function onRadioChange(e) {        
        if (drawType==='brush' && annoIdToDraw===annotationIdRef.current) {
            setRadioValue(e.target.value);
            const annotation = {...frameAnnotation[annotationIdRef.current]};
            annotation.isCrowd=e.target.value;
            setFrameAnnotation({...frameAnnotation, [annotationIdRef.current]: annotation});
        }
    };



    return (
        <div className={styles.brushBtnContainer}
            style={{margin: ((props.enableBrushTool || !props.omitCrowdRadio) ? '0.2em' : '0') + ' 0'}}>
            {}
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
            {(props.enableBrushTool || !props.omitCrowdRadio) ?
                <div className='ms-2'>
                    {}
                    {props.enableBrushTool ? 
                        <BrushTool minThinkness={props.minThinkness} maxThickness={props.maxThickness}/> 
                        : null}
                    
                    {!props.omitCrowdRadio ?
                        <div>
                            <Radio.Group 
                                value={radioValue} 
                                onChange={onRadioChange} 
                                disabled={!(drawType==='brush'&&annoIdToDraw===annotationIdRef.current)}
                                >
                                {}
                                    <Radio value={0}>single</Radio>
                                    <Radio value={1}>crowd</Radio>
                                {}
                            </Radio.Group>
                        {}
                        </div>
                        : null 
                    }
                </div> 
                :null
            }   
            {}
            
        </div>
    )
}