import React, {useState, useEffect} from 'react';
import { useStates, useStateSetters } from './AppContext';
import { clearUnfinishedAnnotation } from '../utils/utils';
import { postFrameAnnotation, postAnnotation } from '../utils/requests';


export default function WindowMonitor() {
    const frameAnnotation = useStates().frameAnnotation;
    const intervalAnno = useStates().intervalAnno;
    const frameNum = useStates().frameNum;
    const lastFrameNumForIntervalAnnoRef = useStates().lastFrameNumForIntervalAnnoRef;
    const lastFrameNumForIntervalErasingRef = useStates().lastFrameNumForIntervalErasingRef;

    useEffect(()=>{
        window.addEventListener("beforeunload", closeWindowHandler);

        return () => {
            window.removeEventListener("beforeunload", closeWindowHandler);
        }
    }, [frameAnnotation, intervalAnno])

    function closeWindowHandler(e) {
        if (frameAnnotation && Object.keys(frameAnnotation).length > 0) {
            const newFrameAnno = clearUnfinishedAnnotation({...frameAnnotation});
            if (Object.keys(newFrameAnno).length > 0) {
                const frameAnnoObjs = {};
                frameAnnoObjs.annotations = Object.keys(newFrameAnno).map(id => newFrameAnno[id]);
                postFrameAnnotation(frameAnnoObjs);
            } 

            if (intervalAnno.on) {
                checkIntervalAnnotation('sameLabel');
            }
        } 
    }

    async function checkIntervalAnnotation(type) {
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
 
             await Promise.all(frameMissedArr.map(async i => {
                 const id = createId();
                 const annoObj = {
                     id: id,
                     videoId: intervalAnno.videoId,
                     frameNum: i,
                     label: intervalAnno.label,
                     color: intervalAnno.color,
                     type: 'category',         
                 };
 
                 const res = await postAnnotation(annoObj);
             }));
 
        }
     }
}

