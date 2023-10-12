import React, {useState, useEffect, useRef} from 'react';
// import { saveAs } from 'file-saver';
// import JSZip from "jszip";
import videoStyles from '../styles/Video.module.css';
import { InputNumber, Slider } from 'antd';
import { CaretRightOutlined, PauseOutlined } from '@ant-design/icons';
import {Row, Col, Form, Button} from 'react-bootstrap';
import { useStateSetters } from './AppContext';


const FRAME_URL_ROOT = 'http://localhost:8000/api/frame';


export default function VideoUploader(props) {
    // const videoRef = useRef(null);
    // const canvasRef = useRef(null);
    const [fps, setFps] = useState(0);
    const [totalFrameCount, setTotalFrameCount] = useState(0);
    const [sliderValue, setSliderValue] = useState(0);
    const [playFps, setPlayFps] = useState(0);
    const [submitError, setSubmitError] = useState();
    const [frameError, setFrameError] = useState();
    const playInterval = useRef(null);

    const setFrameUrl = useStateSetters().setFrameUrl;
    const setFrameNum = useStateSetters().setFrameNum;
    const setVideoId = useStateSetters().setVideoId;


    console.log('VideoUploader render');


    

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
            console.log('setInterval',playInterval.current);
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
            console.log('playfps changed');
            setPlayFps(newValue);
        }
    }


    
    function videoPathSubmitHandler(e) {
        // console.log(e.target);
        e.preventDefault();
        e.stopPropagation(); 
        resetVideoStatus();
        const id = new Date().getTime();
        // props.setVideoId(id);
        setVideoId(id);

        fetch("http://localhost:8000/api/videopath", {
            method: 'POST',
            body: new FormData(e.target),
        }).then(res => {
            if (res.ok) {
                // console.log('res.ok');
                return res.json(); 
            } else {
                // console.log('res.ok false');
                setSubmitError('Request failed');
            }
        }).then((res)=>{
            if (res){
                if (res['error']) {
                    // console.log(res['error']);
                    setSubmitError(res['error']);
                } else {
                    if (res['frame_count'] > 0) {//TODO
                        setFps(res['fps']);
                        setPlayFps(res['fps']);
                        setTotalFrameCount(res['frame_count']);
                    } else {
                        setFps(25);
                        setPlayFps(25);
                        setTotalFrameCount(10000);
                    }
                    setFrame(1);
                } 
            } 
        })
    }
    

    function setFrame(newValue) {
        // console.log('setFrame called');
        if (newValue) {
            setSliderValue(newValue);
            // let url;
            if (newValue >= 1) {
                getFrame(newValue-1);
            }
        } else {
            // props.setFrameUrl(null);
            // props.setFrameNum(null);
        }
        
    }


    function getFrame(frameNum) {
        ////window.vaFrames[frameNum];  /////
        setFrameError(null);
        fetch(`${FRAME_URL_ROOT}?num=${frameNum}`, {
            method: 'GET',
        }).then(res => {
            if (res.ok) {
                console.log('res.ok');
                return res.blob();
            } else {
                console.log('res.ok false');
                // console.log(res);
                setFrameError('Frame request failed');
            }
        }).then((res)=>{
            if (res){
                if (res['error']) {
                    setFrameError(res['error']);
                } else {
                    const url = URL.createObjectURL(res);
                    // props.setFrameUrl(url);
                    // props.setFrameNum(frameNum);
                    setFrameUrl(url);
                    setFrameNum(frameNum);
                } 
            } 
        })
    }

    function resetVideoStatus() {
        setFps(0);
        setTotalFrameCount(0);
        setSliderValue(0);
        setPlayFps(0);
        setFrameError(null);
        setSubmitError(null);
        setFrame(null);
    }





    return (
        <>
            {/* <input type='file' id='videoInput' accept='.jpg, .mp4, .mov, .avi' onChange={submitVideoHandler}></input> */}
            <Row >
                <Col sm={5} className='mt-2 '>
                    <span className='me-1'>FPS</span>
                    <InputNumber className={videoStyles.playFpsInput} 
                        min={totalFrameCount==0 ? 0 : 1}
                        max={fps==0 ? 0 : 2*fps} //TODO
                        value={playFps}
                        onChange={playFpsInputChangeHandler}
                        size="small"/>
                    <CaretRightOutlined className=' ms-1' onClick={playClickHandler}/>
                    <PauseOutlined className=' ms-1' onClick={pauseClickHandler} />
                    <InputNumber className={videoStyles.sliderValueInput} size='small'
                        min={0}
                        max={totalFrameCount}
                        defaultValue={0}
                        value={sliderValue}
                        onChange={inputNumerChangeHandler}
                        />
                </Col>
                <Col sm={7}>
                    <Slider className='ms-1'
                        min={0}
                        max={totalFrameCount}
                        marks={{0:'0', [totalFrameCount]:`${totalFrameCount}`}}
                        onChange={sliderChangeHandler}
                        value={sliderValue}
                        />
                </Col>
            </Row>
            {submitError ?
                <p >{frameError}</p>
                : null}
            <Row>
                <Form onSubmit={videoPathSubmitHandler} encType='multipart/form-data'>
                    <Form.Group as={Row} controlId='videoPath'>
                        <Form.Label column sm={2}>Video path</Form.Label>
                        <Col sm={6}>
                            <Form.Control type='string' name='video_path' placeholder='E.g. /somePath/videoName.avi' required />
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
            </Row>
        </>
    )

}
