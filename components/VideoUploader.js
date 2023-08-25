import React, {useState, useEffect, useRef} from 'react';
// import { saveAs } from 'file-saver';
// import JSZip from "jszip";
import videoStyles from '../styles/Video.module.css';
import { InputNumber, Row, Col, Slider, Input, Button, Form } from 'antd';
import { CaretRightOutlined, PauseOutlined } from '@ant-design/icons';

const FRAME_FORMAT = 'jpg';


export default function VideoUploader(props) {
    // const videoRef = useRef(null);
    // const canvasRef = useRef(null);
    const [fps, setFps] = useState(0);
    const [totalFrameCount, setTotalFrameCount] = useState(0);
    const [sliderValue, setSliderValue] = useState(0);
    const [playFps, setPlayFps] = useState(0);
    const playInterval = useRef(null);

    console.log('VideoUploader render');


    function getFrame(frameNum) {
        ////window.vaFrames[frameNum];  /////
        return 'frame url' //return url
    }

    useEffect(()=>{
        // when playFps changes, update playback effect if it's playing
        if (playInterval.current) {
            clearInterval(playInterval.current);
            playInterval.current = setInterval(incrementFrame, Math.floor(1000/playFps));
        }
    }, [playFps])


    // function submitVideoHandler(e) {
    //     e.preventDefault();
    //     e.stopPropagation(); 
        
    // }

    function sliderChangeHandler(newValue) {
        setFrame(newValue);
    }

    function inputNumerChangeHandler(newValue) {
        if (typeof newValue === 'number' && Number.isInteger(newValue) && newValue>=0 ) {
            setFrame(newValue);
        }
    }

    function setFrame(newValue) {
        // console.log('setFrame called');
        setSliderValue(newValue);
        let url;
        if (newValue >= 1) {
            url = getFrame(newValue-1);
        } else {
            url = null;
        }
        props.setFrame(url);
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


    

    


    return (
        <>
            {/* <input type='file' id='videoInput' accept='.jpg, .mp4, .mov, .avi' onChange={submitVideoHandler}></input> */}
            <Row >
                    <Col span={7} className='mt-2 '>
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
                    <Col span={13}>
                        <Slider className='ms-1'
                            min={0}
                            max={totalFrameCount}
                            marks={{0:'0', [totalFrameCount]:`${totalFrameCount}`}}
                            onChange={sliderChangeHandler}
                            value={sliderValue}
                            />
                    </Col>
                    
                </Row>
        </>
    )

}
