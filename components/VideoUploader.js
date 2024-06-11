import React, {useState, useEffect, useRef} from 'react';
// import { saveAs } from 'file-saver';
// import JSZip from "jszip";
import styles from '../styles/Video.module.css';
import { InputNumber, Slider, Space } from 'antd';
import { CaretRightOutlined, PauseOutlined } from '@ant-design/icons';
import {Row, Col, Form, Button} from 'react-bootstrap';
import { useStates, useStateSetters } from './AppContext';
import { postVideo, getVideoMeta, getFrame, getAdditionalData } from '../utils/requests';


// const FRAME_URL_ROOT = 'http://localhost:8000/api/frame';
// const ADDITIONAL_URL_ROOT = 'http://localhost:8000/api/additional-data';

/**
 * 
 * @param {*} props 
 *      hideSubmit: boolean. Whether to hide video path submit part.
 */
export default function VideoUploader(props) {
    // const videoRef = useRef(null);
    // const canvasRef = useRef(null);
    const [fps, setFps] = useState(0);
    // const [totalFrameCount, setTotalFrameCount] = useState(0);
    const [sliderValue, setSliderValue] = useState(0);
    const [playFps, setPlayFps] = useState(0);
    const [submitError, setSubmitError] = useState();
    const [frameError, setFrameError] = useState();
    const playInterval = useRef(null);

    // context
    const setFrameUrl = useStateSetters().setFrameUrl;
    const setFrameNum = useStateSetters().setFrameNum;
    // const videoId = useStates().videoId;
    const setVideoId = useStateSetters().setVideoId;
    const frameNumSignal = useStates().frameNumSignal;
    const totalFrameCount = useStates().totalFrameCount;
    const setTotalFrameCount = useStateSetters().setTotalFrameCount;
    const loadVideo = useStates().loadVideo; // trigger post request by VideoManager
    const setLoadVideo = useStateSetters().setLoadVideo;
    // const videoPathToGet = useStates().videoPathToGet; // trigger get request by VideoManager
    // const setVideoPathToGet = useStateSetters().setVideoPathToGet;
    const resetVideoPlay = useStates().resetVideoPlay;
    const setResetVideoPlay = useStateSetters().setResetVideoPlay;
    const videoData = useStates().videoData;
    const setVideoData = useStateSetters().setVideoData;
    // const projectConfigDataRef = useStates().projectConfigDataRef;
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

    // useEffect(() => {
    //     if (videoPathToGet) {
    //         const id = Object.keys(videoPathToGet)[0];
    //         console.log(id, videoPathToGet[id].path);
    //         getVideoByPath(id, videoPathToGet[id].path);

    //         setVideoPathToGet(null);
    //     }
    // }, [videoPathToGet])

    useEffect(() => {
        if (loadVideo) {
            // postAndLoadVideo(loadVideo);
            resetVideoStatus();
            setVideoId(loadVideo.videoId);
            initializePlay(loadVideo) // no need to use await

            setLoadVideo(null);
        }
    }, [loadVideo])


    useEffect(() => {
        if (frameNumSignal) {
            setFrame(frameNumSignal);
        }
    }, [frameNumSignal])
    

    useEffect(()=>{
        // when playFps changes, update playback effect if it's playing
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
        // console.log('increment called');
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

    // let playInterval;
    function playClickHandler() {
        if (!playInterval.current 
            && totalFrameCount > 0 
            && sliderValue < totalFrameCount 
            && playFps>0) { // make sure some frames are ready
            playInterval.current = setInterval(incrementFrame, Math.floor(1000/playFps));
            // playInterval = setInterval(incrementFrame, Math.floor(1000/playFps));
            // console.log('setInterval',playInterval.current);
        }
        
    }

    function pauseClickHandler() {
        if (playInterval.current) {
            clearInterval(playInterval.current);
            // console.log('clearInterval',playInterval.current);
            playInterval.current = null;
            // console.log('resetInterval',playInterval.current);
        }
    }

    function playFpsInputChangeHandler(newValue) {
        if (typeof newValue === 'number' 
        && Number.isInteger(newValue) 
        && newValue>=0 ) {
            // console.log('playfps changed');
            setPlayFps(newValue);
        }
    }


    
    async function videoPathSubmitHandler(e) {
        // console.log(e.target);
        e.preventDefault();
        e.stopPropagation(); 

        if (!projectId) {
            // throw new Error('Please initialize or upload a project first.');
            setSubmitError('Please initialize or upload a project first.');
            return
        }
        // resetVideoStatus();
        setSubmitError(null);
        const id = new Date().getTime().toString();
        // setVideoId(id);

        const form = new FormData(e.target);
        const videoPath = form.get('videoPath');
        const video = {projectId: projectId, name: videoPath, path: videoPath, additionalFields: []};
        // console.log('video', JSON.stringify(video), JSON.stringify(video).replaceAll("/", ""));

        // add video to videoManager
        const videoDataCopy = {...videoData};
        videoDataCopy[id] = {...video};
        setVideoData(videoDataCopy);

        video.videoId = id;
        await postAndLoadVideo(video);
    }


    // function postVideo(videoId, videoObj) {
    async function postAndLoadVideo(videoInfo) {
        resetVideoStatus();
        // const videoId = Object.keys(videoInfo)[0];
        setVideoId(videoInfo.videoId);
        // const videoInfoObj = {...videoInfo[videoId]};
        // videoInfoObj.videoId = videoId;
        // console.log(videoInfoObj);

        // fetch("http://localhost:8000/api/video", {
        //     method: 'POST',
        //     headers: {
        //         'Accept': 'application/json',
        //         'Content-Type': 'application/json'
        //       },
        //     body: JSON.stringify(videoInfoObj), //new FormData(e.target), 
        // }).then(res => {
        //     if (res.ok) {
        //         return res.json(); 
        //     } else {
        //         setSubmitError('Request failed');
        //     }
        // }).then((res)=>{
        //     if (res){
        //         if (res['error']) {
        //             // console.log(res['error']);
        //             setSubmitError(res['error']);
        //         } else {
        //             initializePlay(res, videoInfoObj);
        //         } 
        //     } 
        // })
        const res = await postVideo(videoInfo);
        // console.log(res);
        if (res['error']) {
            setSubmitError(res['error']);
        } else {
            await initializePlay(videoInfo);
        }
        
    }


    async function setFrame(newValue, videoInfoObj=null) {
        // console.log('setFrame called');
        if (newValue) {
            setSliderValue(newValue);
            // let url;
            if (newValue >= 1) {
                // request frame
                setFrameError(null);
                const res = await getFrame(newValue-1); //blob url or {error: ...}
                if (res['error']) {
                    setFrameError(res['error']);
                } else {
                    setFrameUrl(res);
                    setFrameNum(newValue-1);
                }
                    
                if (videoInfoObj) { // uploaded new video
                    getAdditionalFieldsData(newValue-1, videoInfoObj);
                } else { // video already uploaded beforehand, additionalFields data saved in videoData
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


    // function getFrame(frameNum) {
    //     ////window.vaFrames[frameNum];  /////
    //     setFrameError(null);
    //     fetch(`${FRAME_URL_ROOT}?num=${frameNum}`, {
    //         method: 'GET',
    //     }).then(res => {
    //         if (res.ok) {
    //             console.log('res.ok');
    //             return res.blob();
    //         } else {
    //             console.log('res.ok false');
    //             // console.log(res);
    //             setFrameError('Frame request failed');
    //         }
    //     }).then((res)=>{
    //         if (res){
    //             if (res['error']) {
    //                 setFrameError(res['error']);
    //             } else {
    //                 const url = URL.createObjectURL(res);
    //                 // props.setFrameUrl(url);
    //                 // props.setFrameNum(frameNum);
    //                 setFrameUrl(url);
    //                 setFrameNum(frameNum);
    //             } 
    //         } 
    //     })
    // }

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

    async function initializePlay(videoInfoObj) { //meta,
        const meta = await getVideoMeta(videoInfoObj.videoId);
        console.log(meta);
        if (meta['error']) {
            setSubmitError(meta['error']);
        } else {
            if (meta['frame_count'] > 0) {//TODO
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
        if (videoInfoObj.additionalFields?.length>0) { //videoInfoObj, videoInfoObj.additionalFields could be null
            const additionalData = {};
            videoInfoObj.additionalFields.forEach(async field => {
                if (videoAdditionalFieldsObj[field.name].uploadWithVideo) { 
                    // fetch(`${ADDITIONAL_URL_ROOT}/${field.name}/?videoId=${videoInfoObj.videoId}&num=${frameNum}`, {
                    //     method: 'GET',
                    // }).then(res => {
                    //     if (res.ok) {
                    //         console.log('res.ok');
                    //         return res.json();
                    //     } else {
                    //         console.log('res.ok false');
                    //         // console.log(res);
                    //         setFrameError('Additional data request failed');
                    //     }
                    // }).then((res)=>{
                    //     if (res){
                    //         if (res['error']) {
                    //             setFrameError(res['error']);
                    //         } else {
                    //             additionalData[field.name] = res;
                    //         } 
                    //     } 
                    // })
                    const res = await getAdditionalData(frameNum, videoInfoObj.videoId, field.name);
                    // console.log(res);
                    if (res['error']) {
                        setFrameError(res['error']);
                    } else {
                        additionalData[field.name] = res;
                    }
                }
            })
            
            //TODO: pass data to canvas and let canvas draw it.
        }
    }


//value='/Users/pengxi/video/numbered.mp4' 


    return (
        <div className={styles.videoUploaderContainer}>
            {/* <input type='file' id='videoInput' accept='.jpg, .mp4, .mov, .avi' onChange={submitVideoHandler}></input> */}
            <Row className={styles.videoPlayControlContainer}>
                <Col sm={3} className='px-0'>
                    <span className='me-1'>FPS</span>
                    <InputNumber className={styles.playFpsInput} 
                        min={totalFrameCount==0 ? 0 : 1}
                        max={fps===0 ? 0 : 2*fps} //TODO
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
                                // marks={{0:'0', [totalFrameCount]:`${totalFrameCount}`}}
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
