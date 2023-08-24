import React, {useState, useEffect, useRef} from 'react';
import { saveAs } from 'file-saver';
import JSZip from "jszip";
import videoStyles from '../styles/Video.module.css';
import Script from 'next/script';
import { InputNumber, Row, Col, Slider, Progress, Input } from 'antd';
import { CaretRightOutlined, PauseOutlined } from '@ant-design/icons';


const FRAME_FORMAT = 'jpg';


export default function VideoUploader(props) {
    // const videoRef = useRef(null);
    // const canvasRef = useRef(null);
    // const imgRef = useRef();
    const framesRef = useRef();
    const [decodeStatus, setDecodeStatus] = useState('not started'); //not started; ongoing; done; failed
    const [fps, setFps] = useState(0);
    var [frameCount, setFrameCount] = useState(0);
    const [totalFrameCount, setTotalFrameCount] = useState(0);
    // const [transferDone, setTransferDone] = useState(false); //// transfer frames after extracting all
    const [sliderValue, setSliderValue] = useState(0);
    const [playFps, setPlayFps] = useState(0);
    const playInterval = useRef(null);

    console.log('VideoUploader render');

    useEffect(()=>{
        window.setFrameWrapper = (n)=>{setFrame(n)};
        window.setFrameCountWrapper = (n)=>{setFrameCount(n)};
        window.setFpsWrapper = (n)=>{setFps(n)};
        window.setTotalFrameCountWrapper = (n) =>{setTotalFrameCount(n)};
        window.setPlayFpsWrapper = (n)=>{setPlayFps(n)};
        //window.vaFrames = {}; /////
        window.moveFrameToJsWrapper = (frameNum, frameData)=>{moveFrameToJs(frameNum,frameData)};
    },[])

    const pyscript_code = `
        import cv2 as cv
        import os
        from datetime import datetime
        #import shutil
        #print(os.getcwd())  #/home/pyodide
        #print(os.listdir('/')) #['tmp', 'home', 'dev', 'proc', 'lib']

        import asyncio
        from js import document, console, window
        from pyodide.ffi import create_proxy

        async def extractFrames(input_file_name):
            try:
                os.makedirs('/tmp/frames', exist_ok=True)
                cap = cv.VideoCapture(input_file_name)
                os.remove(input_file_name)
                #print(os.listdir('/tmp/'))
                fps = cap.get(cv.CAP_PROP_FPS )
                total_frame_count = cap.get(cv.CAP_PROP_FRAME_COUNT)
                window.setFpsWrapper(fps)
                window.setTotalFrameCountWrapper(total_frame_count)
                window.setPlayFpsWrapper(fps)
                console.log(cap.get(cv.CAP_PROP_FPS ), cap.get(cv.CAP_PROP_FRAME_COUNT))
                counter = 0
                time = datetime.now()
                while counter<600: #cap.isOpened(): # 
                    if counter%200 == 0:
                        print(counter, datetime.now() - time)
                        time = datetime.now()
                        window.setFrameCountWrapper(counter)
                        if counter//200==1: ### no transfer or ##### stream
                            window.setFrameWrapper(1) ### no transfer or ##### stream
                    if counter%5 == 0:
                        await asyncio.sleep(0.005)
                    ret, frame = cap.read()
                    if not ret:
                        #print("Can't receive frame (stream end?). Exiting ...")
                        break
                    #cv.imwrite(f'/tmp/frames/f_{counter}.jpg', frame) ### no transfer or #### transfer after extracting all
                    ret_, buf_arr = cv.imencode(".jpg", frame) ##### stream
                    window.moveFrameToJsWrapper(counter, buf_arr) ##### stream
                    counter += 1
                    #await asyncio.sleep(0.001)
                
                print(f'Extracted {counter} frames', datetime.now() - time)
                cap.release()
                
                #if counter == frame_count:
                return counter #frame_count may be diff with counter
                #else:
                #    return 'Something wrong with video decode'
            except Exception as e:
                print(e)
                return 'Something wrong with video decode'

            
        async def process_video(data): #(e)
            try:
                #data = e.target.result
                data_bin = data.to_py()
                del data
                #print(data.type, data_bin.type)
                video_path = '/tmp/video.mov'
                with open(video_path, 'wb') as f:
                    f.write(data_bin)
                del data_bin
                #print(os.listdir('/tmp/'))
                res = await extractFrames(video_path) 
                return res
            except Exception as e:
                print(e)
                return 'Something wrong with video decode'
        
        
        ### no transfer
        #def get_frame(frame_num):
        #    # return buf_arr, diff with getFrame in js
        #    file_path = f'/tmp/frames/f_{frame_num}.jpg'
        #    if os.path.exists(file_path):
        #        frame = cv.imread(file_path)
        #        ret, buf_arr = cv.imencode(".jpg", frame)
        #        del frame
        #        return buf_arr
        #    else:
        #        return 'Frame is not in pyscript'
        

        #### transfer after extracting all
        #def move_frame(frame_num):
        #    try:
        #        frame_path = f'/tmp/frames/f_{frame_num}.jpg'
        #        frame = cv.imread(frame_path)
        #        ret, buf_arr = cv.imencode(".jpg", frame)
        #        del frame
        #        os.remove(frame_path)
        #        return buf_arr
        #    except Exception as e:
        #        print(e)
        #        return 'Something wrong with move_frame'
    `


    ///// stream frames
    function moveFrameToJs(frameNum, frameData) {
        console.log('moveFrameToJs called');
        const frameData_js = frameData.toJs();
        const frame = new Blob([frameData_js], { type: 'image/jpg' });
        const url = URL.createObjectURL(frame);
        // window.vaFrames[frameNum] = url;
        framesRef.current = {...framesRef.current, [frameNum]:url};
    }


    //// transfer frames after extracting all
    // useEffect(() => {
    //     if (decodeStatus === 'done') { // collect frame data in pyscript
    //         setTransferDone(false);
    //         console.log('useEffect called');
    //         let tracker = 0;
    //         const moveFrame = pyscript.interpreter.globals.get('move_frame');
    //         // const zip = new JSZip();
    //         const frames = {};
    //         while (tracker < frameCount) {
    //             if (tracker%200 == 0) {
    //                 console.log(tracker);
    //             }
    //             const res = moveFrame(tracker);
    //             if (typeof res === 'string'){
    //                 console.log(res);
    //                 break;
    //             } else {
    //                 const res_js = res.toJs();
    //                 const frame = new Blob([res_js], { type: 'image/jpg' })
    //                 // console.log(img_data);
    //                 const url = URL.createObjectURL(frame);
    //                 frames[tracker] = url;
    //                 // zip.file(`frames/f_${tracker}.jpg`, frame);
    //                 tracker++;
    //             }
    //         }
    //         if (tracker==frameCount) {
    //             framesRef.current = frames;
    //             // zip.generateAsync({type: 'blob'})
    //             //     .then(zipFile => {
    //             //         saveAs(zipFile, `frames.zip`);
    //             // });
    //             setTransferDone(true);
    //             setFrame(1);
    //         }
    //     }

    //   }, [decodeStatus]
    // )
    

    ///// transfer frames after extracting all
    function getFrame(frameNum) {
        ////window.vaFrames[frameNum];  /////
        return framesRef.current[frameNum]; //return url
    }

    useEffect(()=>{
        // when playFps changes, update playback effect if it's playing
        if (playInterval.current) {
            clearInterval(playInterval.current);
            playInterval.current = setInterval(incrementFrame, Math.floor(1000/playFps));
        }
    }, [playFps])

    /// no transfer, get frame from python
    // function getFrame(frameNum) {
    //     const getFrame_py = pyscript.interpreter.globals.get('get_frame');
    //     let res = getFrame_py(frameNum);
    //         if (typeof res === 'string'){
    //             console.log(res);
    //         } else {
    //             const res_js = res.toJs();
    //             res = null;
    //             const frame = new Blob([res_js], { type: 'image/jpg' })
    //             // console.log(img_data);
    //             const url = URL.createObjectURL(frame);
    //             return url;
    //         }
    // }

    
    function resetDecodeStatus() {
        setDecodeStatus('ongoing');
        setFps(0);
        setFrameCount(0);
        setSliderValue(0);
        setPlayFps(0);
        setFrame(0);
        framesRef.current = null; //// transfer after extracting all or ///// stream
    }


    async function submitVideoHandler(e) {
        e.preventDefault();
        e.stopPropagation();
        // console.log('webkitEntries', e.target.webkitEntries);
        resetDecodeStatus();
        const file = e.target.files[0];
        // console.log(file);

        const reader = new FileReader();
        reader.onload = async function() {
            let data = reader.result;
            // console.log(data);

            const js_processVideo = pyscript.interpreter.globals.get('process_video');
            let res = await js_processVideo(data);
            data=null;
            // console.log(typeof(res), res);
                        
            if (typeof res === 'string'){
                setDecodeStatus('failed');
            } else {
                // const res_js = res.toJs();
                // console.log(typeof(res_js), res_js);
                setDecodeStatus('done');
                // setFps(res_js[0]);
                setFrameCount(res);
                setTotalFrameCount(res); // update real totalFrameCount
                // setFrame(1);
            }
        };
        reader.readAsArrayBuffer(file);
        // // reader.readAsDataURL(file);
        // reader.readAsBinaryString(file);
        
    }


    function submitFramesHandler(e) {
        e.preventDefault();
        e.stopPropagation();

    }


    function sliderChangeHandler(newValue) {
        // setSliderValue(newValue);
        // console.log(framesRef.current[newValue]);
        // props.setFrame(framesRef.current[newValue]);

        setFrame(newValue);
    }

    function inputNumerChangeHandler(newValue) {
        if (typeof newValue === 'number' && Number.isInteger(newValue) && newValue>=0 ) {
            // setSliderValue(newValue);
            // console.log(framesRef.current[newValue]);
            // props.setFrame(framesRef.current[newValue]);

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
            && frameCount > 0 
            && sliderValue < frameCount 
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
        // if (playInterval) {
        //     clearInterval(playInterval);
        //     console.log('clearInterval',playInterval);
        //     playInterval.current = null;
        //     console.log('resetInterval',playInterval);
        // }
        
    }

    function playFpsInputChangeHandler(newValue) {
        if (typeof newValue === 'number' 
        && Number.isInteger(newValue) 
        && newValue>=0 ) {
            console.log('playfps changed');
            setPlayFps(newValue);
        }
    }


    //strategy='beforeInteractive'
    return (
        <>
            <Script defer src="https://pyscript.net/latest/pyscript.js" />
            <div>
                <input type='file' id='videoInput' className='d-inline-flex'
                    accept='.jpg, .mp4, .mov, .avi' 
                    onChange={submitVideoHandler}>
                </input>
                {decodeStatus!=='not started' ?
                    <Progress type="circle" size={35}
                     percent={totalFrameCount==0 ? 0 : frameCount/totalFrameCount*100} 
                     status={decodeStatus==='failed' ? "exception" : null} />
                    : null
                }
                
                {decodeStatus==='done' ? 
                    <span className='videoStyles.decodeInfo'>                        
                        {`FPS: ${fps}, Frame Count: ${frameCount}`}
                    </span>
                    : null
                }
                <Row >
                    <Col span={7} className='mt-2 '>
                        <span className='me-1'>FPS</span>
                        <InputNumber className={videoStyles.playFpsInput} 
                            min={frameCount==0 ? 0 : 1}
                            max={fps==0 ? 0 : fps} //TODO
                            value={playFps}
                            onChange={playFpsInputChangeHandler}
                            size="small"/>
                        <CaretRightOutlined className=' ms-1' onClick={playClickHandler}/>
                        <PauseOutlined className=' ms-1' onClick={pauseClickHandler} />
                        <InputNumber className={videoStyles.sliderValueInput} size='small'
                            min={frameCount==0 ? 0 : 1}
                            max={frameCount}
                            defaultValue={frameCount==0 ? 0 : 1}
                            value={sliderValue}
                            onChange={inputNumerChangeHandler}
                            />
                    </Col>
                    <Col span={13}>
                        <Slider className='ms-1'
                            min={frameCount==0 ? 0 : 1}
                            max={frameCount}
                            marks={{0:'0', [frameCount]:`${frameCount}`}}
                            onChange={sliderChangeHandler}
                            value={sliderValue}
                            />
                    </Col>
                    {/* <Col span={2} className='ms-2'>
                        <InputNumber
                            min={frameCount==0 ? 0 : 1}
                            max={frameCount}
                            defaultValue={frameCount==0 ? 0 : 1}
                            value={sliderValue}
                            onChange={inputNumerChangeHandler}
                            />
                    </Col> */}
                    
                </Row>
            </div>
            {/* <video ref={videoRef} width={500} height={500} controls className={videoStyles.videoTag}></video> */}
            {/* <canvas ref={canvasRef} id='canvasTag' className={videoStyles.canvasTag}></canvas>  */}
            {/* <img ref={imgRef} id='imgOutput' width="300" height="200"  alt="No Image" /> */}
            {/* <input type='file' webkitdirectory='' id='framesInput'  onChange={submitFramesHandler}></input> */}
            
            <div className={videoStyles.pyscript}>
                <py-config >
                    packages = ["opencv-python", "numpy"]
                </py-config>
                <py-script  dangerouslySetInnerHTML={{__html: pyscript_code}} />
            </div>
        </>
    )

}


  
