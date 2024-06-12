import React, {useState, useEffect} from 'react';
import { useStates } from './AppContext';
import { clearUnfinishedAnnotation } from '../utils/utils';
import { postFrameAnnotation } from '../utils/requests';


export default function WindowMonitor() {
    const frameAnnotation = useStates().frameAnnotation;
    const videoId = useStates().videoId;

    useEffect(()=>{
        window.addEventListener("beforeunload", closeWindowHandler);

        return () => {
            window.removeEventListener("beforeunload", closeWindowHandler);
        }
    }, [frameAnnotation])

    function closeWindowHandler(e) {
        if ( Object.keys(frameAnnotation).length > 0) {
            const newFrameAnno = clearUnfinishedAnnotation({...frameAnnotation});
            if (Object.keys(newFrameAnno).length > 0) {
                const frameAnnoObjs = {};
                frameAnnoObjs.annotations = Object.keys(newFrameAnno).map(id => newFrameAnno[id]);
                postFrameAnnotation(frameAnnoObjs);
            } 
        } 
    }
}

