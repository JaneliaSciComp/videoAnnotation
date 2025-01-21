import React, {useState, useEffect, useRef} from 'react';
import styles from '../styles/Video.module.css';
import { InputNumber, Slider, Space } from 'antd';
import { CaretRightOutlined, PauseOutlined } from '@ant-design/icons';
import {Row, Col, Form, Button} from 'react-bootstrap';
import { useStates, useStateSetters } from './AppContext';
import { postVideo, getVideoMeta, getFrame, getAdditionalData, getVideoAnnotation } from '../utils/requests';



/**
 * 
 * @param {*} props 
 *      hideSubmit: boolean. Whether to hide video path submit part.
 */
export default function VideoUploader(props) {
    const [fps, setFps] = useState(0);
    const [totalFrameCount, setTotalFrameCount] = useState(0);
    const [sliderValue, setSliderValue] = useState(0);
    const [playFps, setPlayFps] = useState(0);
    const [submitError, setSubmitError] = useState();
    const [frameError, setFrameError] = useState();
    const playInterval = useRef(null);
    const [playControl, setPlayControl] = useState();

    const setFrameUrl = useStateSetters().setFrameUrl;
    const setFrameNum = useStateSetters().setFrameNum;
    const setVideoId = useStateSetters().setVideoId;
    const frameNumSignal = useStates().frameNumSignal;
    const loadVideo = useStates().loadVideo;
    const setLoadVideo = useStateSetters().setLoadVideo;
    const resetVideoPlay = useStates().resetVideoPlay;
    const setResetVideoPlay = useStateSetters().setResetVideoPlay;
    const videoData = useStates().videoData;
    const setVideoData = useStateSetters().setVideoData;
    const videoId = useStates().videoId;
    const projectId = useStates().projectId;
    const additionalDataNameToRetrieve = useStates().additionalDataNameToRetrieve;
    const setAdditionalData = useStateSetters().setAdditionalData;
    const videoMetaRef = useStates().videoMetaRef;
    const intervalAnno = useStates().intervalAnno;
    const intervalErasing = useStates().intervalErasing;
    const setGlobalInfo = useStateSetters().setGlobalInfo;
    const annotationRef = useStates().annotationRef;
    const additionalDataRef = useStates().additionalDataRef;
    const realFpsRef = useStates().realFpsRef;



    useEffect(() => {
        if (resetVideoPlay) {
            resetVideoStatus();
            setResetVideoPlay(false);
        }
    }, [resetVideoPlay])



    useEffect(() => {
        if (loadVideo) {
            resetVideoStatus();
            setVideoId(loadVideo.videoId);
            initializePlay(loadVideo)

            setLoadVideo(null);
        }
    }, [loadVideo])


    useEffect(() => {
        if (frameNumSignal) {
            setFrame(frameNumSignal);
        }
    }, [frameNumSignal])
    

    useEffect(()=>{
        if (playInterval.current) {
            clearInterval(playInterval.current);
                playInterval.current = setInterval(incrementFrame, Math.floor(1000/playFps));
            
        }
    }, [playFps])


    useEffect(() => {
        if (playInterval.current) {
            clearInterval(playInterval.current);
                playInterval.current = setInterval(incrementFrame, Math.floor(1000/playFps));
            
        }
    }, [sliderValue])


    function sliderChangeHandler(newValue) {
        if (newValue >= 1) {
            if (playControl !== 'play') {
                setFrame(newValue);
            }  else if (playInterval.current) {
                setSliderValue(newValue);
            }
        }
    }

    function inputNumerChangeHandler(newValue) {
        if (typeof newValue === 'number' && Number.isInteger(newValue) && newValue>=1 ) {
            if (playControl !== 'play') {
                setFrame(newValue);
            }  else if (playInterval.current) {
                setSliderValue(newValue);
            }
        }
    }

    
    let currentSliderValue =sliderValue;
    function incrementFrame() {
        let fpsMultiple;
        if (!realFpsRef.current || realFpsRef.current >= playFps ) { 
            fpsMultiple = 1;
        } 
        else {
            fpsMultiple = Math.floor(playFps/realFpsRef.current);
        }
        currentSliderValue = currentSliderValue + fpsMultiple;
        let newFrameNum = currentSliderValue;
        if (newFrameNum <= totalFrameCount ) {
            setFrame(newFrameNum);
        } 
        else if (newFrameNum - totalFrameCount < fpsMultiple) {
            newFrameNum = totalFrameCount;
            setFrame(newFrameNum);
            currentSliderValue = newFrameNum;
        }
        else {
            if (playInterval.current) {
                clearInterval(playInterval.current);
                playInterval.current = null;
                setPlayControl(null);
                setSliderValue(0);
            }
        }
    }

    function playClickHandler() {
        if ((!playInterval.current
            && totalFrameCount > 0 
            && playFps>0)
            && ((playControl !== 'play' && sliderValue < totalFrameCount)
                || (!playControl && sliderValue === totalFrameCount))
        ) {
            playInterval.current = setInterval(incrementFrame, Math.floor(1000/playFps));
            setPlayControl('play');
        }

        if (playControl === 'play' 
            && playInterval.current) {
            setPlayControl('pause');
            clearInterval(playInterval.current);
            playInterval.current = null;
        }

    }


    function playFpsInputChangeHandler(newValue) {
        if (typeof newValue === 'number' 
        && Number.isInteger(newValue) 
        && newValue>=0 ) {
            setPlayFps(newValue);
        }
    }

    
    async function videoPathSubmitHandler(e) {
        e.preventDefault();
        e.stopPropagation(); 

        if (!projectId) {
            setSubmitError('Please initialize or upload a project first.');
            return
        }
        setSubmitError(null);
        const id = new Date().getTime().toString();

        const form = new FormData(e.target);
        const videoPath = form.get('videoPath');
        const video = {projectId: projectId, name: videoPath, path: videoPath, additionalFields: []};

        video.videoId = id;
        await postAndLoadVideo(video);
    }


    async function postAndLoadVideo(videoInfo) {
        resetVideoStatus();
        const videoId = videoInfo.videoId;

        const res = await postVideo(videoInfo);
        if (res['error']) {
            setSubmitError(res['error']);
        } else {
            delete(videoInfo['videoId']);
            const videoDataCopy = {...videoData};
            videoDataCopy[videoId] = {...videoInfo};
            setVideoData(videoDataCopy);
            setVideoId(videoId);
            videoInfo['videoId'] = videoId;
            await initializePlay(videoInfo);
        }
        
    }


    async function setFrame(newValue, videoInfoObj=null) {
        if (newValue) {
            setSliderValue(newValue);
            if (newValue >= 1) {
                setFrameError(null);
                console.log('frameSpeed request', newValue-1);
                const timestamp = Date.now();
                const res = await getFrame(newValue-1);
                console.log('frameSpeed Retrieval', newValue-1, (Date.now()-timestamp)/1000);
                if (res['error']) {
                    setFrameError(res['error']);
                } else {
                    setFrameUrl(res);
                    setFrameNum(newValue-1);
                }
                    
            }
        } else {
            setFrameUrl(null);
        }
        
    }



    function resetVideoStatus() {
        console.log('resetVideoStatus');
        setFps(0);
        setTotalFrameCount(0);
        setSliderValue(0);
        setPlayFps(0);
        setFrameError(null);
        setSubmitError(null);
        setFrame(null);
        setVideoId(null);
        setPlayControl(null);
    }

    async function initializePlay(videoInfoObj) { 
        videoMetaRef.current = {};
        const meta = await getVideoMeta(videoInfoObj.videoId);
        if (meta['error']) {
            setSubmitError(meta['error']);
        } else {
            if (meta['frame_count'] > 0) {
                setFps(meta['fps']);
                setPlayFps(meta['fps']);
                setTotalFrameCount(meta['frame_count']);
                videoMetaRef.current = {fps: meta['fps'], totalFrameCount: meta['frame_count']};
            } else {
                setFps(25);
                setPlayFps(25);
                setTotalFrameCount(10000);
                videoMetaRef.current = {fps: 25, totalFrameCount:10000};
            }
            
            setAdditionalData({});
            if (additionalDataNameToRetrieve?.length>0) {
                const res = await getAdditionalData(videoInfoObj.videoId, additionalDataNameToRetrieve);
                if (res['error']) {
                    setSubmitError(res['error']);
                } else {
                    additionalDataNameToRetrieve.forEach(name => {
                        additionalDataRef.current[name] = res[name];
                    })
                }
            }
                await retrieveVideoAnnotations(videoInfoObj.videoId);
            
                await setFrame(1);
        }
    }

    async function retrieveVideoAnnotations(videoId) {
        setGlobalInfo('Retrieving video annotation from database ...');
        const res = await getVideoAnnotation(videoId);
        setGlobalInfo(null);
        if (res['error']) {
            setGlobalInfo(res);
        } else {
            const annotations = res.annotations;
            const newRef = {};
            annotations.forEach(anno => {
                const frameNum = anno.frameNum;
                const id = anno.id;
                if (newRef[frameNum]) {
                    newRef[frameNum][id] = anno;
                } else {
                    newRef[frameNum] = {[id]: anno};
                }
            })
            annotationRef.current = newRef;
        }
    }

            




    return (
        <div className={styles.videoUploaderContainer}>
            {}
            <Row className={styles.videoPlayControlContainer}>
                <Col sm={3} className='px-0'>
                    <span className='me-1'>FPS</span>
                    <InputNumber className={styles.playFpsInput} 
                        min={totalFrameCount==0 ? 0 : 1}
                        value={playFps}
                        onChange={playFpsInputChangeHandler}
                        size="small"/>
                    <InputNumber className={styles.sliderValueInput} size='small'
                        min={0}
                        max={totalFrameCount}
                        defaultValue={0}
                        value={sliderValue}
                        onChange={inputNumerChangeHandler}
                        />
                </Col>
                <Col sm={9} className='px-0'>
                    <div className={styles.videoBtnSliderContainer}>
                        <div className={styles.videoBtnContainer} onClick={playClickHandler}>
                            {playControl !== 'play' ?
                                <CaretRightOutlined className=' ms-1'/>
                                :
                                <PauseOutlined className=' ms-1'/>
                            }
                        </div>
                        <div className={styles.videoSliderContainer}>
                            <span className={styles.sliderMark}>0</span>
                            <Slider className={styles.videoSlider}
                                min={0}
                                max={totalFrameCount}
                                onChange={sliderChangeHandler}
                                value={sliderValue}
                                />
                            <span className={styles.sliderMark}>{totalFrameCount}</span>
                        </div>
                    </div>
                </Col>
            </Row>
            {frameError ?
                <p >{frameError}</p>
                : null}
            <Row>
                {props.hideSubmit ?
                    (submitError ?
                        <p >{submitError}</p>
                        : null)
                    :
                    <Form onSubmit={videoPathSubmitHandler} encType='multipart/form-data'>
                        <Form.Group as={Row} controlId='videoPath'>
                            <Form.Label column sm={2}>Video path</Form.Label>
                            <Col sm={6}>
                                <Form.Control type='string' defaultValue='/Users/pengxi/video/numbered.mp4' name='videoPath' placeholder='E.g. /somePath/videoName.avi' required />
                                <Form.Control.Feedback type='invalid'>Please provide video path in your local computer, e.g. /somePath/videoName.avi</Form.Control.Feedback>
                                {submitError ?
                                <p >{submitError}</p>
                                : null}
                            </Col>
                            <Col sm={1}>
                                <Button type='submit' className='btn-submit' >Submit</Button>
                            </Col>
                        </Form.Group>
                    </Form>
                }
            </Row>
        </div>
    )

}
