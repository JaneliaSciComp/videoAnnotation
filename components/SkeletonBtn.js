import React, {useState, useEffect, useRef} from 'react';
import {Button} from 'react-bootstrap';
import { Radio, Space } from 'antd';
import styles from '../styles/Button.module.css';


export default function SkeletonBtn(props) {
    /** 
        To activate skeleton drawing on canvas. Update btn label for each lankmark, and allow setting visibility of the landmark.
        For reference, skeleton annotation data structure:
            {id: {
                type: 'skeleton',
                color: '#000000',
                label: btnGroupId,
                data: [
                    [x, y, visibility],
                    ...
                ]
            }}

        Props: 
            type: 'skeleton'
            groupIndex: '123456',  
            data: [
                {index: 0, 
                btnType: 'skeleton',
                label: 'head',
                color: '#FFFFFF'
                },
                {index: 1, ...},
                ...
            ]
            drawType={drawType} 
            setDrawType={setDrawType} 
            skeletonLandmark // indicate the current landmark index to draw, Canvas also has them
            setSkeletonLandmark  // 
            frameNum={frameNum}
            addAnnotationObj={addAnnotationObj}
            frameAnnotation={frameAnnotation} // this component needs to add the radio value to frameAnnotation 
            setFrameAnnotation={setFrameAnnotation}
    */
    const [clicked, setClicked] = useState(false);
    const [radioValue, setRadioValue] = useState(2);
    const annotationIdRef = useRef(); // to remember the annotation id created by clicking the btn, to retrieve anno data so that can add visibility info 
    // const [currentLandmark, setCurrentLandmark] = useState(0); //null: not read for drawing; 0: drawing the first landmark; ...

    useEffect(() => {
        if (!props.drawType) { //canvas set drawType=null when drawing is done
            setClicked(false);
            annotationIdRef.current = null;
            // setCurrentLandmark(null);
        } 
        // else if (props.drawType.slice(0, 8) === 'skeleton') {
        //     //every time drawType change (new landmark), adds default radioValue(2) to current landmark annotation
        //     setCurrentLandmark(Number(props.drawType.split('_')[1]));
        //     // addRadioToAnnotation(radioValue);
        // }
    }, [props.drawType])

    // useEffect(() => {
    //     if (props.skeletonLandmark && annotationIdRef.current) {// avoid initial render and nake sure btn is clicked
    //         if (!props.frameAnnotation[annotationIdRef.current].data[props.skeletonLandmark]) { 
    //             // when switch to current landmark, initialize data array, and add default radioValue(2) to it
    //             const newData = [null, null, radioValue];
    //             props.frameAnnotation[annotationIdRef.current].data[props.skeletonLandmark] = newData;
    //         }
    //     } 
    //   }, [props.skeletonLandmark] 
    // )


    function addRadioToAnnotation(value) {
        // update radio value to annotation
        if (clicked) { // only if already activated draw mode
            const annotation = {...props.frameAnnotation[annotationIdRef.current]};
            annotation.data[props.skeletonLandmark][2]=value;
            props.frameAnnotation[annotationIdRef.current] = annotation;
        }
    }

    
    function clickHandler() {
        if (Number.isInteger(props.frameNum) || props.frameUrl) {
            // create anno obj, add to frameAnno, activate draw mode
            const id = Date.now().toString();
            annotationIdRef.current = id;
            props.setDrawType('skeleton'); // drawType changed, useEffect will add default radio value
            props.setSkeletonLandmark(0);
            const initData = props.data.map(item => [null, null, 2]); // initialize data holder and default visibility (2) to each landmark anno arr
            props.addAnnotationObj({
                id: id,
                frameNum: props.frameNum,
                data: initData,
                type: props.type,   
                groupIndex: props.groupIndex,      
            });
            // console.log('shape called', props);
            setClicked(true);
        }
    }

    function onRadioChange(e) {
        console.log('radio checked', e.target.value);
        setRadioValue(e.target.value);
        addRadioToAnnotation(e.target.value);
    };

    console.log(props.skeletonLandmark,props.skeletonLandmark?props.skeletonLandmark:0, props.skeletonLandmark?props.skeletonLandmark:0 +1);


    return (
        <div className='d-flex align-items-center'>
            <Button className={styles.btn}
                style={{color:clicked?'white':props.data[props.skeletonLandmark?props.skeletonLandmark:0].color, 
                background: clicked?props.data[props.skeletonLandmark?props.skeletonLandmark:0].color:'white', 
                border:'2px solid '+props.data[props.skeletonLandmark?props.skeletonLandmark:0].color}} 
                onClick={clickHandler}>
            {`${(props.skeletonLandmark?props.skeletonLandmark:0) +1}-${props.data[props.skeletonLandmark?props.skeletonLandmark:0].label}`}
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