import React, {useState, useEffect, useRef} from 'react';
import {Button} from 'react-bootstrap';
import { Radio, Space } from 'antd';
import styles from '../styles/Button.module.css';
import { useStateSetters, useStates } from './AppContext';
import { clearUnfinishedAnnotation } from '../utils/utils.js';


/** 
    To activate skeleton drawing on canvas. Update btn label for each lankmark, and allow setting visibility of the landmark.
    For reference, skeleton annotation data structure:
        {id: {
            type: 'skeleton',
            color: '#000000',
            label: btnGroupId,
            skeletonName: 'mouse',
            data: [
                [x, y, visibility],
                ...
            ]
        }}

    Props: 
        // groupIndex: '123456', //configure data, should not be accessible for user
        // data: [  //configure data, should not be accessible for user
            {index: 0, 
            btnType: 'skeleton',
            label: 'head',
            color: '#FFFFFF'
            },
            {index: 1, ...},
            ...
        ],
        skeletonName: 'mouse',
        // drawType={drawType} 
        // setDrawType={setDrawType} 
        // skeletonLandmark // indicate the current landmark index to draw, Canvas also has them
        // setSkeletonLandmark  // 
        // frameNum={frameNum}
        // addAnnotationObj={addAnnotationObj}
        // frameAnnotation={frameAnnotation} // this component needs to add the radio value to frameAnnotation 
        // setFrameAnnotation={setFrameAnnotation}
*/
export default function SkeletonBtn(props) {
    
    const [clicked, setClicked] = useState(false);
    const [radioValue, setRadioValue] = useState(2);
    const annotationIdRef = useRef(); // to remember the annotation id created by clicking the btn, to retrieve anno data so that can add visibility info 

    // get context
    const drawType = useStates().drawType;
    const frameNum = useStates().frameNum;
    const frameUrl = useStates().frameUrl;
    const setDrawType = useStateSetters().setDrawType;
    // const addAnnotationObj = useStateSetters().addAnnotationObj;
    const frameAnnotation = useStates().frameAnnotation;
    const setFrameAnnotation = useStateSetters().setFrameAnnotation;
    const skeletonLandmark = useStates().skeletonLandmark;
    const setSkeletonLandmark = useStateSetters().setSkeletonLandmark;
    const annoIdToDraw = useStates().annoIdToDraw;
    const setAnnoIdToDraw = useStateSetters().setAnnoIdToDraw;
    const setUndo = useStateSetters().setUndo;
    const setUseEraser = useStateSetters().setUseEraser;

    // console.log('skeleton', props);

    // useEffect(() => {
    //     if (!props.drawType) { //canvas set drawType=null when drawing is done
    //         setClicked(false);
    //         annotationIdRef.current = null;
    //         // setCurrentLandmark(null);
    //     } 
    // }, [props.drawType])

    useEffect(() => {
        if (!drawType || drawType!=='skeleton' || annotationIdRef.current!==annoIdToDraw) { //canvas set drawType=null when drawing is done
            setClicked(false);
            annotationIdRef.current = null;
            // setCurrentLandmark(null);
        } 
    }, [drawType])

    useEffect(()=> {
        // when in drawing mode, when go to another landmark, set radio value to be 2 
        if (clicked) {
            setRadioValue(2);
        }
    }, [skeletonLandmark])

    // useEffect(() => {
    //     if (!clicked) {
    //         setSkeletonLandmark(null);
    //     }
    // }, [clicked])


    // function addRadioToAnnotation(value) {
    //     // update radio value to annotation
    //     if (clicked) { // only if already activated draw mode
    //         const annotation = {...props.frameAnnotation[annotationIdRef.current]};
    //         annotation.data[props.skeletonLandmark][2]=value;
    //         props.frameAnnotation[annotationIdRef.current] = annotation;
    //     }
    // }

    function addRadioToAnnotation(value) {
        // update radio value to annotation
        if (clicked) { // only if already activated draw mode
            // const annotation = {...frameAnnotation[annotationIdRef.current]};
            // annotation.data[skeletonLandmark][2]=value;
            // setFrameAnnotation({...frameAnnotation, [annotationIdRef.current]: annotation});
            
            // directly modify frameAnno without using setFrameAnno to prevent trigger frameAnno useEffect in Canvas
            frameAnnotation[annotationIdRef.current].data[skeletonLandmark][2]=value;
        }
    }

    
    // function clickHandler() {
    //     if (Number.isInteger(props.frameNum) || props.frameUrl) {
    //         // create anno obj, add to frameAnno, activate draw mode
    //         const id = Date.now().toString();
    //         annotationIdRef.current = id;
    //         props.setDrawType('skeleton'); // drawType changed, useEffect will add default radio value
    //         props.setSkeletonLandmark(0);
    //         const initData = props.data.map(_ => [null, null, 2]); // initialize data holder and default visibility (2) to each landmark anno arr
    //         props.addAnnotationObj({
    //             id: id,
    //             frameNum: props.frameNum,
    //             data: initData,
    //             type: 'skeleton',   
    //             groupIndex: props.groupIndex,      
    //         });
    //         // console.log('shape called', props);
    //         setClicked(true);
    //     }
    // }

    function clickHandler() {
        if (Number.isInteger(frameNum) || frameUrl) {
            // clear unfinished polygon and skeleton annoObj before setting new annoIdToDraw
            const annoCopy = clearUnfinishedAnnotation({...frameAnnotation});
            // setFrameAnnotation(annoCopy);
            
            // create anno obj, add to frameAnno, activate draw mode
            const id = Date.now().toString();
            annotationIdRef.current = id;
            setDrawType('skeleton'); // drawType changed, useEffect will add default radio value
            setSkeletonLandmark(0);
            setRadioValue(2);
            const initData = props.data.map(_ => [null, null, 2]); // initialize data holder and default visibility (2) to each landmark anno arr
            const annoObj = {
                id: id,
                type: 'skeleton',   
                groupIndex: props.groupIndex, 
                frameNum: frameNum,
                label: props.skeletonName,
                data: initData,
            };
            // console.log('shape called', props);
            annoCopy[id] = annoObj;
            setFrameAnnotation(annoCopy);
            // setFrameAnnotation({...frameAnnotation, [id]: annoObj});
            setClicked(true);

            setAnnoIdToDraw(id);
            setUndo(0);
            setUseEraser(null);
        }
    }

    function onRadioChange(e) {
        // console.log('radio checked', e.target.value);
        setRadioValue(e.target.value);
        addRadioToAnnotation(e.target.value);

        // when set radio to invisible, should immediately go to next landmark
        if (clicked && e.target.value===0) { 
            if (skeletonLandmark < props.data.length-1) { // this is not the last landmark
                setSkeletonLandmark(skeletonLandmark+1);
            } else { // if this is the last landmark
                setDrawType(null);
                setSkeletonLandmark(null);
                setAnnoIdToDraw(null);
            }
            
        }
    };

    // console.log(props.skeletonLandmark,props.skeletonLandmark?props.skeletonLandmark:0, props.skeletonLandmark?props.skeletonLandmark:0 +1);


    return (
        <div className='d-flex align-items-center'>
            <Button className={styles.btn}
                style={{color:clicked?'white':props.data[skeletonLandmark?skeletonLandmark:0].color, 
                background: clicked?props.data[skeletonLandmark?skeletonLandmark:0].color:'white', 
                border:'2px solid '+props.data[skeletonLandmark?skeletonLandmark:0].color}} 
                onClick={clickHandler}>
            {/* {`${(skeletonLandmark?skeletonLandmark:0) +1} ${props.data[skeletonLandmark?skeletonLandmark:0].label}`} */}
                {Number.isInteger(skeletonLandmark) ? `${skeletonLandmark+1} ${props.data[skeletonLandmark].label}` : props.skeletonName}
            </Button>

            <Radio.Group className='ms-3' value={radioValue} onChange={onRadioChange}>
                <Space direction="vertical">
                    <Radio value={0}>not labelled</Radio>
                    <Radio value={1}>labeled but not visible</Radio>
                    <Radio value={2}>labeled and visible</Radio>
                </Space>
            </Radio.Group>
        </div>
        
    )
}