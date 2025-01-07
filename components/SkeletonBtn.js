import React, {useState, useEffect, useRef} from 'react';
import {Button} from 'react-bootstrap';
import { Radio, Space } from 'antd';
import styles from '../styles/Button.module.css';
import { useStateSetters, useStates } from './AppContext';
import { clearUnfinishedAnnotation, createId } from '../utils/utils.js';


/** 
 *  Note: This component should not be directly used to hard-code buttons because it needs btnConfigData for V and E info. Use ProjectManager, BtnConfiguration, or BtnGroupController instead.
    
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
    const annotationIdRef = useRef();

    const drawType = useStates().drawType;
    const frameNum = useStates().frameNum;
    const frameUrl = useStates().frameUrl;
    const setDrawType = useStateSetters().setDrawType;
    const frameAnnotation = useStates().frameAnnotation;
    const setFrameAnnotation = useStateSetters().setFrameAnnotation;
    const skeletonLandmark = useStates().skeletonLandmark;
    const setSkeletonLandmark = useStateSetters().setSkeletonLandmark;
    const annoIdToDraw = useStates().annoIdToDraw;
    const setAnnoIdToDraw = useStateSetters().setAnnoIdToDraw;
    const setUndo = useStateSetters().setUndo;
    const setUseEraser = useStateSetters().setUseEraser;
    const videoId = useStates().videoId;



    useEffect(() => {
        if (!drawType || drawType!=='skeleton' || annotationIdRef.current!==annoIdToDraw) {
            setClicked(false);
            annotationIdRef.current = null;
        } 
    }, [drawType])

    useEffect(()=> {
        if (clicked) {
            setRadioValue(2);
        }
    }, [skeletonLandmark])




    function addRadioToAnnotation(value) {
        if (clicked) {
            
            frameAnnotation[annotationIdRef.current].data[skeletonLandmark][2]=value;
        }
    }

    

    function clickHandler() {
        if (Number.isInteger(frameNum) || frameUrl) {
            const annoCopy = clearUnfinishedAnnotation({...frameAnnotation});
            
            const id = createId();
            annotationIdRef.current = id;
            setDrawType('skeleton');
            setSkeletonLandmark(0);
            setRadioValue(2);
            const initData = props.data.map(_ => [null, null, 2]);
            const annoObj = {
                id: id,
                videoId: videoId,
                type: 'skeleton',   
                groupIndex: props.groupIndex, 
                frameNum: frameNum,
                label: props.skeletonName,
                data: initData,
            };
            annoCopy[id] = annoObj;
            setFrameAnnotation(annoCopy);
            setClicked(true);

            setAnnoIdToDraw(id);
            setUndo(0);
            setUseEraser(null);
        }
    }

    function onRadioChange(e) {
        setRadioValue(e.target.value);
        addRadioToAnnotation(e.target.value);

        if (clicked && e.target.value===0) { 
            if (skeletonLandmark < props.data.length-1) {
                setSkeletonLandmark(skeletonLandmark+1);
            } else {
                setDrawType(null);
                setSkeletonLandmark(null);
                setAnnoIdToDraw(null);
            }
            
        }
    };



    return (
        <div className='d-flex align-items-center'>
            <Button className={styles.btn}
                style={{color:clicked?'white':props.data[skeletonLandmark?skeletonLandmark:0].color, 
                background: clicked?props.data[skeletonLandmark?skeletonLandmark:0].color:'white', 
                border:'2px solid '+props.data[skeletonLandmark?skeletonLandmark:0].color}} 
                onClick={clickHandler}>
            {}
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