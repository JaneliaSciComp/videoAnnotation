import React, {useState, useEffect} from 'react';
import { useStates } from './AppContext';
import { clearUnfinishedAnnotation } from '../utils/utils';
import { postFrameAnnotation } from '../utils/requests';


export default function WindowMonitor() {
    // context
    const frameAnnotation = useStates().frameAnnotation;
    const videoId = useStates().videoId;

    useEffect(()=>{
        // before close the window, save annotation of the current frame to db 
        window.addEventListener("beforeunload", closeWindowHandler);

        return () => {
            window.removeEventListener("beforeunload", closeWindowHandler);
        }
    }, [frameAnnotation])

    function closeWindowHandler(e) {
        // e.preventDefault();
        // e.stopPropagation();
        // console.log('window beforeunload called');
        if ( Object.keys(frameAnnotation).length > 0) {
            const newFrameAnno = clearUnfinishedAnnotation({...frameAnnotation});
            // console.log(frameAnnotation, newFrameAnno);
            if (Object.keys(newFrameAnno).length > 0) {
                const frameAnnoObjs = {};
                frameAnnoObjs.annotations = Object.keys(newFrameAnno).map(id => newFrameAnno[id]);
                // console.log(frameAnnoObjs);
                postFrameAnnotation(frameAnnoObjs);
            } 
        } 
    }
}

