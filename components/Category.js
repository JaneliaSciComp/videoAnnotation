import React, {useState, useEffect, useRef} from 'react';
import {Button} from 'react-bootstrap';
import styles from '../styles/Button.module.css';
import { useStates, useStateSetters } from './AppContext';
import { clearUnfinishedAnnotation, createId, addCategoryAnnoToFrameAnnotation } from '../utils/utils.js';


export default function Category(props) {
    /*
        To annotate entire frame.
        Props: 
            label='chase'
            color='black'
            btnGroupId: which btn group this btn belongs to.
            // frameNum={frameNum}
            // addAnnotationObj={addAnnotationObj}
            // setActiveIdObj={setActiveIdObj}
    */
    const [color, setColor] = useState('black');
    const [info, setInfo] = useState(null);
    
    const frameNum = useStates().frameNum;
    const frameUrl = useStates().frameUrl;
    const frameAnnotation = useStates().frameAnnotation;
    const setFrameAnnotation = useStateSetters().setFrameAnnotation;
    const setActiveAnnoObj = useStateSetters().setActiveAnnoObj;
    const setDrawType = useStateSetters().setDrawType;
    const setSkeletonLandmark = useStateSetters().setSkeletonLandmark;
    const setUndo = useStateSetters().setUndo;
    const setUseEraser = useStateSetters().setUseEraser;
    const videoId = useStates().videoId;
    const intervalAnno = useStates().intervalAnno;
    const setIntervalAnno = useStateSetters().setIntervalAnno;
    const cancelIntervalAnno = useStates().cancelIntervalAnno;
    const setCancelIntervalAnno = useStateSetters().setCancelIntervalAnno;
    const setUpdateAnnotationChart = useStateSetters().setUpdateAnnotationChart;
    const lastFrameNumForIntervalAnnoRef = useStates().lastFrameNumForIntervalAnnoRef;
    const intervalErasing = useStates().intervalErasing;
    const annotationRef = useStates().annotationRef;
    const mutualExclusiveCategory = useStates().mutualExclusiveCategory;
    

    useEffect(()=> {
        if (cancelIntervalAnno) {
            console.log('cancelIntervalAnno useEffect');
            checkIntervalAnnotation('sameLabel')
            setIntervalAnno(oldObj => {return {on:false, videoId:null, startFrame: null, label: null, color: null, annotatedFrames: new Set()}});
            setCancelIntervalAnno(false);
        }
    }, [cancelIntervalAnno])

    useEffect(()=> {
        if (props.color) {
            setColor(props.color);
        }
    }, [props.color])

    let timer;
    console.log('Category btn rerender', timer);
    function clickHandler() {
        console.log('clickHandler', timer);
        if (intervalErasing[props.btnGroupId].on) {
            setInfo('Please turn off interval erasing first');
            return;
        }
        setInfo(null);
        if (timer) {
            clearTimeout(timer);
            manageIntervalAnnotation();
        } else {
            timer = setTimeout(createSingleAnnotation, 200);
        }
    }


    function createSingleAnnotation() {
        console.log('createSingleAnnotation');
        setInfo(null);
        if ((Number.isInteger(frameNum) || frameUrl) && !(intervalAnno.on && intervalAnno.label===props.label)) {
            if (intervalAnno.on && intervalAnno.label!==props.label) {
                checkIntervalAnnotation('differentLabel');
                setIntervalAnno(oldObj => {return {on:false, startFrame: null, videoId:null, label: null, color: null, annotatedFrames: new Set()}});
            }

            const annoCopy = clearUnfinishedAnnotation({...frameAnnotation});

            const id = createId();
            const annoObj = {
                id: id,
                videoId: videoId,
                frameNum: frameNum,
                label: props.label,
                color: color,
                type: 'category',        
            };
            addCategoryAnnoToFrameAnnotation(annoObj, annoCopy,  mutualExclusiveCategory)
            console.log('createSingleAnnotation', annoCopy);
            setFrameAnnotation(oldObj => annoCopy);
            setActiveAnnoObj(annoObj);
            setDrawType(null);
            setSkeletonLandmark(null);
            setUndo(0);
            setUseEraser(null);
            annotationRef.current[frameNum] = annoCopy;
            setUpdateAnnotationChart(true);
        }
    }

    async function manageIntervalAnnotation() {
        console.log('intervalAnno');
        if ((Number.isInteger(frameNum) || frameUrl)) {
            if (intervalAnno.on) {
                if (intervalAnno.label === props.label) {
                    console.log('same label');
                    checkIntervalAnnotation('sameLabel');
                    setIntervalAnno(oldObj => {return {on:false, startFrame: null, videoId:null, label: null, color: null, annotatedFrames: new Set()}});
                } else {
                    console.log('different label');
                    checkIntervalAnnotation('differentLabel');
                    createSingleAnnotation();
                    setIntervalAnno(oldObj => {return {on:true, startFrame: frameNum, vdieoId: videoId, label: props.label, color: color, annotatedFrames: new Set([frameNum])}});
                }
            } else {
                createSingleAnnotation();
                setIntervalAnno(oldObj => {return {on:true, startFrame: frameNum, videoId: videoId, label: props.label, color: color, annotatedFrames: new Set([frameNum])}});
            }
        }
    }

    function checkIntervalAnnotation(type) {
       console.log('checkIntervalAnnotation', intervalAnno, frameNum, lastFrameNumForIntervalAnnoRef.current);
       if (Number.isInteger(intervalAnno.startFrame)
        ) {
            const lastFrameNum = frameNum ? frameNum : lastFrameNumForIntervalAnnoRef.current;
            const frameMissedArr = [];
            const end = type==='sameLabel'?lastFrameNum:(lastFrameNum-1);
            for (let i = intervalAnno.startFrame; i <= end; i++) {
                if (!intervalAnno.annotatedFrames.has(i)) {
                    frameMissedArr.push(i);
                }
            }
            console.log('frameMissedArr', frameMissedArr);

            frameMissedArr.forEach(async i => {
                const id = createId();
                const annoObj = {
                    id: id,
                    videoId: intervalAnno.videoId,
                    frameNum: i,
                    label: intervalAnno.label,
                    color: intervalAnno.color,
                    type: 'category',         
                };

                if  (i === frameNum) {
                    const frameAnnoCopy = {...frameAnnotation};
                    frameAnnoCopy[id] = annoObj;
                    setFrameAnnotation(frameAnnoCopy);
                } 
                if (annotationRef.current[i]) {
                    annotationRef.current[i][id] = annoObj;
                } else {
                    annotationRef.current[i] = {[id]: annoObj};
                }
            });

            setUpdateAnnotationChart(true);

            if (!frameNum) {
                lastFrameNumForIntervalAnnoRef.current = null;
            }
       }
    }


    return (
        <>
            <Button className={`${styles["btn-category"]} ${styles.btn}`} 
                style={{color: (intervalAnno.on&&intervalAnno.label===props.label)?'white':color, background: (intervalAnno.on&&intervalAnno.label===props.label)?color:'white', border: '2px solid '+color}} 
                onClick={clickHandler}
                >
            {props.label}
            </Button>
            {info && <p>{info}</p>}
        </>
    )
}
