import React, {useState, useEffect, useRef} from 'react';
import {Button} from 'react-bootstrap';
import { Radio, Space } from 'antd';
import styles from '../styles/Button.module.css';


export default function SkeletonBtn(props) {
    /** 
        To annotate an object on the frame. Activate drawing on canvas.
        Props: 
            type: 'skeleton'
            data: [
                {index: 0, 
                btnType: 'skeleton',
                label: 'head',
                color: '#FFFFFF'
                },
                {index: 1, ...},
                ...
            ]
            drawType={drawType} //for skeleton, drawType='skeleton_{landmarkIndex}'
            setDrawType={setDrawType} 
            frameNum={frameNum}
            addAnnotationObj={addAnnotationObj}
            frameAnnotation={frameAnnotation} // this component needs to add the radio value to frameAnnotation 
            setFrameAnnotation={setFrameAnnotation}
    */
    const [clicked, setClicked] = useState(false);
    const [radioValue, setRadioValue] = useState(0);
    const annotationIdRef = useRef();
    const landmarkRef = useRef(); //null: not read for drawing; 0: drawing the first landmark; ...

    useEffect(() => {
        if (!props.drawType) { //canvas set drawType=null when drawing is done
            setClicked(false);
            annotationIdRef.current = null;
            landmarkRef.current = null;
        } else if (props.drawType.slice(0, 8) === 'skeleton') {
            //every time drawType change, adds default radioValue(0) to current landmark annotation
            landmarkRef.current = props.drawType.split('_')[1];
            addRadioToAnnotation(radioValue);
        }
    }, [props.drawType])


    function addRadioToAnnotation(value) {
        const annotation = {...props.frameAnnotation[annotationIdRef.current]};
        annotation.data[landmarkRef.current][2]=value;
        props.frameAnnotation[annotationIdRef.current] = annotation;
    }

    
    function clickHandler() {
        if (Number.isInteger(props.frameNum)) {
            const id = Date.now().toString();
            annotationIdRef.current = id;
            props.setDrawType('skeleton_0');
            props.addAnnotationObj({
                id: id,
                frameNum: props.frameNum,
                data: {},
                type: props.type,         
            });
            // console.log('shape called', props);
            setClicked(true);
        }
    }

    function onRadioChange(e) {
        console.log('radio checked', e.target.value);
        setRadioValue(e.target.value);

        // add radio value to annotation
        // const annotation = {...props.frameAnnotation[annotationIdRef.current]};
        // annotation.data[landmarkRef.current][2]=e.target.value;
        // props.frameAnnotation[annotationIdRef.current] = annotation;
        addRadioToAnnotation(e.target.value);
    };


    return (
        <div className='d-flex align-items-center'>
            <Button className={styles.btn}
                style={{color:clicked?'white':props.data[0].color, background: clicked?props.data[0].color:'white', border:'2px solid '+props.data[0].color}} 
                onClick={clickHandler}>
            {props.data[0].label}
            </Button>

            <Radio.Group className='ms-3' value={radioValue} onChange={onRadioChange}>
                <Space direction="vertical">
                    <Radio value={0}>clear</Radio>
                    <Radio value={1}>occluded but labelled</Radio>
                    <Radio value={2}>not labelled</Radio>
                </Space>
            </Radio.Group>
        </div>
        
    )
}