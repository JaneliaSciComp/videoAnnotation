import React, {useState, useEffect, useRef} from 'react';
import styles from '../styles/Video.module.css';
import { InputNumber, Slider, Space } from 'antd';
import { CaretRightOutlined, PauseOutlined } from '@ant-design/icons';
import {Row, Col, Form, Button} from 'react-bootstrap';
import { useStates, useStateSetters } from './AppContext';
import { postVideo, getVideoMeta, getFrame, getAdditionalData } from '../utils/requests';



/**
 * 
 * @param {*} props 
 *      hideSubmit: boolean. Whether to hide video path submit part.
 */
export default function VideoUploader(props) {
    const [fps, setFps] = useState(0);
    const [sliderValue, setSliderValue] = useState(0);
    const [playFps, setPlayFps] = useState(0);
    const [submitError, setSubmitError] = useState();
    const [frameError, setFrameError] = useState();
    const playInterval = useRef(null);

    const setFrameUrl = useStateSetters().setFrameUrl;
    const setFrameNum = useStateSetters().setFrameNum;
    const setVideoId = useStateSetters().setVideoId;
    const frameNumSignal = useStates().frameNumSignal;
    const totalFrameCount = useStates().totalFrameCount;
    const setTotalFrameCount = useStateSetters().setTotalFrameCount;
    const loadVideo = useStates().loadVideo;
    const setLoadVideo = useStateSetters().setLoadVideo;
    const resetVideoPlay = useStates().resetVideoPlay;
    const setResetVideoPlay = useStateSetters().setResetVideoPlay;
    const videoData = useStates().videoData;
    const setVideoData = useStateSetters().setVideoData;
    const videoAdditionalFieldsObj = useStates().videoAdditionalFieldsObj;
    const videoId = useStates().videoId;
    const projectId = useStates().projectId;


    console.log('VideoUploader render');

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


    function sliderChangeHandler(newValue) {
        if (newValue >= 1) {
            setFrame(newValue);
        }
    }

    function inputNumerChangeHandler(newValue) {
        if (typeof newValue === 'number' && Number.isInteger(newValue) && newValue>=1 ) {
            setFrame(newValue);
        }
    }

    
    let currentSliderValue =sliderValue;
    function incrementFrame() {
        let newFrameNum = ++currentSliderValue;
        if (newFrameNum <= totalFrameCount ) {
            setFrame(newFrameNum);
        } else {
            if (playInterval.current) {
                clearInterval(playInterval.current);
                playInterval.current = null;
            }
        }
    }

    function playClickHandler() {
        if (!playInterval.current 
            && totalFrameCount > 0 
            && sliderValue < totalFrameCount 
            && playFps>0) {
            playInterval.current = setInterval(incrementFrame, Math.floor(1000/playFps));
        }
        
    }

    function pauseClickHandler() {
        if (playInterval.current) {
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

        const videoDataCopy = {...videoData};
        videoDataCopy[id] = {...video};
        setVideoData(videoDataCopy);

        video.videoId = id;
        await postAndLoadVideo(video);
    }


    async function postAndLoadVideo(videoInfo) {
        resetVideoStatus();
        setVideoId(videoInfo.videoId);

        const res = await postVideo(videoInfo);
        if (res['error']) {
            setSubmitError(res['error']);
        } else {
            await initializePlay(videoInfo);
        }
        
    }


    async function setFrame(newValue, videoInfoObj=null) {
        if (newValue && videoId) {
            setSliderValue(newValue);
            if (newValue >= 1) {
                setFrameError(null);
                const res = await getFrame(newValue-1);
                if (res['error']) {
                    setFrameError(res['error']);
                } else {
                    setFrameUrl(res);
                    setFrameNum(newValue-1);
                }
                    
                if (videoInfoObj) {
                    getAdditionalFieldsData(newValue-1, videoInfoObj);
                } else {
                    const videoInfo = {...videoData[videoId]};
                    videoInfo.videoId = videoId;
                    getAdditionalFieldsData(newValue-1, videoInfo);
                }
            }
        } else {
            setFrameUrl(null);
            setFrameNum(null);
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
    }

    async function initializePlay(videoInfoObj) {
        const meta = await getVideoMeta(videoInfoObj.videoId);
        console.log(meta);
        if (meta['error']) {
            setSubmitError(meta['error']);
        } else {
            if (meta['frame_count'] > 0) {
                setFps(meta['fps']);
                setPlayFps(meta['fps']);
                setTotalFrameCount(meta['frame_count']);
            } else {
                setFps(25);
                setPlayFps(25);
                setTotalFrameCount(10000);
            }
            await setFrame(1, videoInfoObj);
        }
    }

    async function getAdditionalFieldsData(frameNum, videoInfoObj) {
        if (videoInfoObj.additionalFields?.length>0) {
            const additionalData = {};
            videoInfoObj.additionalFields.forEach(async field => {
                if (videoAdditionalFieldsObj[field.name].uploadWithVideo) { 
                    const res = await getAdditionalData(frameNum, videoInfoObj.videoId, field.name);
                    if (res['error']) {
                        setFrameError(res['error']);
                    } else {
                        additionalData[field.name] = res;
                    }
                }
            })
            
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
                        max={fps===0 ? 0 : 2*fps}
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
                        <div className={styles.videoBtnContainer}>
                            <CaretRightOutlined className=' ms-1' onClick={playClickHandler}/>
                            <PauseOutlined className=' ms-1' onClick={pauseClickHandler} />
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
            {submitError ?
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
