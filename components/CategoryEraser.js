import {useState, useEffect} from 'react';
import {Button} from 'react-bootstrap';
import { ClearOutlined } from '@ant-design/icons';
import styles from '../styles/Button.module.css';
import { useStateSetters, useStates } from './AppContext';
import {defaultColor} from '../utils/utils.js';
import { deleteCategoryAnnotationInterval } from '../utils/requests.js';


/*
    To switch intervalErasing on/off to remove category anno of its btn group for frames gone through.
    Props: 
        btnGroupId: which btn group this eraser belongs to.
        color: color of the earser when it's turned on.
            
*/
export default function CategoryEraser(props) {
    const [Info, setInfo] = useState(null);

    const intervalErasing = useStates().intervalErasing;
    const setIntervalErasing = useStateSetters().setIntervalErasing;
    const frameNum = useStates().frameNum;
    const frameUrl = useStates().frameUrl;
    const intervalAnno = useStates().intervalAnno;
    const videoId = useStates().videoId;
    const cancelIntervalErasing = useStates().cancelIntervalErasing;
    const setCancelIntervalErasing = useStateSetters().setCancelIntervalErasing;
    const lastFrameNumForIntervalErasingRef = useStates().lastFrameNumForIntervalErasingRef;
    const singleCategoriesRef = useStates().singleCategoriesRef;


    useEffect(()=> {
        if (cancelIntervalErasing) {
            console.log('cancelIntervalErasing useEffect');
            endIntervalErasing().then(()=>{
                const erasingCopy = {...intervalErasing};
                erasingCopy[props.btnGroupId] = {...intervalErasing[props.btnGroupId], on: false, videoId: null, startFrame: null};
                setInterval({on:false, videoId:null, startFrame: null, label: null, color: null, annotatedFrames: new Set()});
                setCancelIntervalErasing(false);
            });
        }
    }, [cancelIntervalErasing])


    async function clickHandler() {
        if (Number.isInteger(frameNum) || frameUrl) {
            if (intervalAnno.on) {
                setInfo('Please end interval annotation first.'); 
                return;
            };

            console.log('CategoryEraser clickHandler', props.btnGroupId, intervalErasing);
            const erasingOn = intervalErasing[props.btnGroupId].on;
            console.log('erasingOn', erasingOn);
            if (erasingOn) {
                await endIntervalErasing();
            }

            const erasingCopy = {...intervalErasing};
            erasingCopy[props.btnGroupId].on = !erasingOn;
            erasingCopy[props.btnGroupId].startFrame = erasingOn ? null : frameNum;
            erasingCopy[props.btnGroupId].videoId = erasingOn ? null : videoId;
            console.log('reset intervalErasing', erasingCopy);
            setIntervalErasing(oldvalue => erasingCopy);
            lastFrameNumForIntervalErasingRef.current = erasingOn ? null :frameNum;
        }
    }

    async function endIntervalErasing() {
       console.log('endIntervalErasing', intervalErasing, frameNum, lastFrameNumForIntervalErasingRef.current);
       const erasingObj = intervalErasing[props.btnGroupId];
       if (erasingObj && Number.isInteger(erasingObj?.startFrame)
        ) {
            const lastFrameNum = frameNum ? frameNum : lastFrameNumForIntervalErasingRef.current;
            const res = await deleteCategoryAnnotationInterval(erasingObj.videoId, erasingObj.labels, [erasingObj.startFrame, lastFrameNum]);
            if (res.error) {
                console.log('endIntervalErasing error', res.error);
                setInfo('Failed to erase category annotation.');
            } else {
                console.log('endIntervalErasing success', res);
            }
            
            const singleCategoriesCopy = {...singleCategoriesRef.current};
            for (let i = erasingObj.startFrame; i <= lastFrameNum; i++) {
                if (singleCategoriesCopy[i]) {
                    const annos = singleCategoriesCopy[i];
                    Object.keys(annos).forEach(id => {
                        if (erasingObj.labels.includes(annos[id].label)) {
                            delete annos[id];
                        }
                    });
                    if (Object.keys(annos).length === 0) {
                        delete singleCategoriesCopy[i];
                    } 
                }
            }
            console.log('endIntervalErasing singleCategoriesRef', singleCategoriesRef.current, singleCategoriesCopy);
            singleCategoriesRef.current = singleCategoriesCopy;

        }
    }

    return (
        <>
            <Button className={[styles.categoryEraserBtn, styles.btn]}
                size='sm'
                variant="light"
                style={{
                        color: intervalErasing[props.btnGroupId]?.on ? 'white' : 'rgb(100, 100, 100)', 
                        background: intervalErasing[props.btnGroupId]?.on ? (props.color??defaultColor) : 'white', 
                        border: intervalErasing[props.btnGroupId]?.on ? ('1px solid'+(props.color??defaultColor)) : '1px solid rgb(100, 100, 100)'
                    }} 
                onClick={clickHandler}
                disabled={Object.entries(intervalErasing).some(([id,obj])=>props.btnGroupId!==id && obj.on)}
                >
                    <ClearOutlined />
            </Button>
            {Info && <p>{Info}</p>}
        </>
    )
}
