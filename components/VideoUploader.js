import React, {useState, useEffect, useRef} from 'react';
import { saveAs } from 'file-saver';
import JSZip from "jszip";
import videoStyles from '../styles/Video.module.css';
import Script from 'next/script';
import { InputNumber, Row, Col, Slider } from 'antd';


const FRAME_FORMAT = 'jpg';


export default function Workspace(props) {
    // const videoRef = useRef(null);
    // const canvasRef = useRef(null);
    const imgRef = useRef();
    const framesRef = useRef();
    const [decodeStatus, setDecodeStatus] = useState('not started'); //not started; ongoing; done; failed
    
    const [fps, setFps] = useState(0);
    const [frameCount, setFrameCount] = useState(0);
    const [transferDone, setTransferDone] = useState(false);
    const [sliderValue, setSliderValue] = useState(0);

    console.log('VideoUploader render');

    const pyscript_code = `
        import cv2 as cv
        import os
        from datetime import datetime
        #import shutil
        #print(os.getcwd())  #/home/pyodide
        #print(os.listdir('/')) #['tmp', 'home', 'dev', 'proc', 'lib']

        import asyncio
        from js import document, console
        from pyodide.ffi import create_proxy

        #counter = 0 # counter = n, means the nth frame is being processed, (n-1)th frame is done

        async def extractFrames(input_file_name):
            try:
                #global counter
                os.makedirs('/tmp/frames', exist_ok=True)
                #frames = []
                cap = cv.VideoCapture(input_file_name)
                os.remove(input_file_name)
                print(os.listdir('/tmp/'))
                fps = cap.get(cv.CAP_PROP_FPS )
                frame_count = cap.get(cv.CAP_PROP_FRAME_COUNT)
                console.log(cap.get(cv.CAP_PROP_FPS ), cap.get(cv.CAP_PROP_FRAME_COUNT))
                counter = 0
                time = datetime.now()
                while counter<1200: # cap.isOpened(): #
                    if counter%200 == 0:
                        print(counter, datetime.now() - time)
                        time = datetime.now()
                    if counter%5 == 0:
                        await asyncio.sleep(0.005)
                    ret, frame = cap.read()
                    if not ret:
                        #print("Can't receive frame (stream end?). Exiting ...")
                        break
                    cv.imwrite(f'/tmp/frames/f_{counter}.jpg', frame)
                    counter += 1
                    #frames.append(frame)
                    #await asyncio.sleep(0.001)
                
                print(f'Extracted {counter} frames')
                cap.release()
                #img = cv.imread('/tmp/frames/f_0.jpg')
                #print(img.shape)
                #ret, buf_arr = cv.imencode(".jpg", img)
                #print(len(buf_arr))
                #print(buf_arr)

                #if counter == frame_count:
                return [fps, counter] #frame_count may be diff with counter
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
                with open('/tmp/video.mov', 'wb') as f:
                    f.write(data_bin)
                del data_bin
                print(os.listdir('/tmp/'))
                res = await extractFrames('/tmp/video.mov') #frame=
                #print(frame.shape)
                #ret, buf_arr = cv.imencode(".jpg", frame)
                #print(buf_arr.shape)
                #print(buf_arr)
                return res
            except Exception as e:
                print(e)
                return 'Something wrong with video decode'
        
        
        def get_frame(frame_num):
            # return buf_arr, diff with getFrame in js
            file_path = f'/tmp/frames/f_{frame_num}.jpg'
            if os.path.exists(file_path):
                frame = cv.imread(file_path)
                ret, buf_arr = cv.imencode(".jpg", frame)
                del frame
                return buf_arr
            else:
                return 'Frame is not in pyscript'
        

        def move_frame(frame_num):
            try:
                frame_path = f'/tmp/frames/f_{frame_num}.jpg'
                frame = cv.imread(frame_path)
                ret, buf_arr = cv.imencode(".jpg", frame)
                del frame
                os.remove(frame_path)
                return buf_arr
            except Exception as e:
                print(e)
                return 'Something wrong with move_frame'
    `


    // useEffect(() => {
    //     if (decodeStatus === 'done') { // collect frame data in pyscript
    //         setTransferDone(false);
    //         console.log('useEffect called');
    //         let tracker = 0;
    //         const moveFrame = pyscript.interpreter.globals.get('move_frame');
    //         const zip = new JSZip();
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
    //                 zip.file(`frames/f_${tracker}.jpg`, frame);
    //                 tracker++;
    //             }
    //         }
    //         if (tracker==frameCount) {
    //             framesRef.current = frames;
    //             zip.generateAsync({type: 'blob'})
    //                 .then(zipFile => {
    //                     saveAs(zipFile, `frames.zip`);
    //             });
    //             setTransferDone(true);
    //         }
    //     }


    //     // if (decodeStatus === 'ongoing') { // collect frame data in pyscript
    //     //     setTransferDone(false);
    //     //     console.log('useEffect called');
    //     //     let tracker = 0;
    //     //     const moveFrame = pyscript.interpreter.globals.get('move_frame');
    //     //     const zip = new JSZip();
    //     //     const frames = {};
    //     //     while (tracker < frameCount) {
    //     //         if (tracker%200 == 0) {
    //     //             console.log(tracker);
    //     //         }
    //     //         const res = moveFrame(tracker);
    //     //         if (typeof res === 'string'){
    //     //             console.log(res);
    //     //             break;
    //     //         } else {
    //     //             const res_js = res.toJs();
    //     //             res = null;
    //     //             const frame = new Blob([res_js], { type: 'image/jpg' })
    //     //             // console.log(img_data);
    //     //             const url = URL.createObjectURL(frame);
    //     //             frames[tracker] = url;
    //     //             zip.file(`frames/f_${tracker}.jpg`, frame);
    //     //             tracker++;
    //     //         }
    //     //     }
    //     //     if (tracker==frameCount) {
    //     //         framesRef.current = frames;
    //     //         zip.generateAsync({type: 'blob'})
    //     //             .then(zipFile => {
    //     //                 saveAs(zipFile, `frames.zip`);
    //     //         });
    //     //         setTransferDone(true);
    //     //     }
    //     // }

    //   }, [decodeStatus]
    // )

    // function getFrame(frameNum) {
    //     return framesRef.current[frameNum]; //return url
    // }

    function getFrame(frameNum) {
        const getFrame_py = pyscript.interpreter.globals.get('get_frame');
        let res = getFrame_py(frameNum);
            if (typeof res === 'string'){
                console.log(res);
            } else {
                const res_js = res.toJs();
                res = null;
                const frame = new Blob([res_js], { type: 'image/jpg' })
                // console.log(img_data);
                const url = URL.createObjectURL(frame);
                return url;
            }
    }


    async function submitVideoHandler(e) {
        e.preventDefault();
        e.stopPropagation();
        // console.log('webkitEntries', e.target.webkitEntries);
        setDecodeStatus('ongoing');
        setTransferDone(false);
        setFps(0);
        setFrameCount(0);
        setSliderValue(0);
        framesRef.current = null;
        const file = e.target.files[0];
        // console.log(file);

        const reader = new FileReader();
        reader.onload = async function() {
            let data = reader.result;
            // console.log(data);

            const js_processVideo = pyscript.interpreter.globals.get('process_video');
            const res = await js_processVideo(data);
            data=null;
            // console.log(typeof(res), res);
                        
            if (typeof res === 'string'){
                setDecodeStatus('failed');
            } else {
                const res_js = res.toJs();
                // console.log(typeof(res_js), res_js);
                setDecodeStatus('done');
                setFps(res_js[0]);
                setFrameCount(res_js[1]);
                setFrame(1);
            }

            // const worker = new Worker('./worker.js');
            // worker.addEventListener('message', (msg)=>{
            //     if (typeof msg === 'string'){
            //         setDecodeStatus('failed');
            //     } else {
            //         console.log('worker responded');
            //         const res_js = msg.toJs();
            //         console.log(typeof(res_js), res_js);
            //         setDecodeStatus('done');
            //         setFps(res_js[0]);
            //         setFrameCount(res_js[1]);
            //     }
            // })

            // worker.postMessage({
            //     cmd: 'decode',
            //     arr: data
            // })
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
        if (typeof newValue === 'number' && Number.isInteger(newValue) ) {
            // setSliderValue(newValue);
            // console.log(framesRef.current[newValue]);
            // props.setFrame(framesRef.current[newValue]);

            setFrame(newValue);
        }
    }

    function setFrame(newValue) {
        setSliderValue(newValue);
        const url = getFrame(newValue-1);
        props.setFrame(url);
    }

    //strategy='beforeInteractive'
    return (
        <>
            <Script defer src="https://pyscript.net/latest/pyscript.js" />
            <div>
                <input type='file' id='videoInput' 
                    accept='.jpg, .mp4, .mov, .avi' 
                    onChange={submitVideoHandler}>
                </input>
                <p className='videoStyles.decodeInfo'>
                    {`Decoding is ${decodeStatus}. `}
                    <span>
                        {decodeStatus==='done' ? 
                            `FPS: ${fps}, Frame Count: ${frameCount}`
                            : null
                        }
                    </span>
                </p>
                <Row className='videoStyles.sliderContainer'>
                    <Col span={10}>
                        <Slider
                            min={frameCount==0 ? 0 : 1}
                            max={frameCount}
                            marks={{0:'0', [frameCount]:`${frameCount}`}}
                            onChange={sliderChangeHandler}
                            value={sliderValue}
                            />
                    </Col>
                    <Col span={2} className='mx-2'>
                        <InputNumber
                            min={frameCount==0 ? 0 : 1}
                            max={frameCount}
                            defaultValue={frameCount==0 ? 0 : 1}
                            value={sliderValue}
                            onChange={inputNumerChangeHandler}
                            />
                    </Col>
                    
                </Row>
            </div>
            {/* <video ref={videoRef} width={500} height={500} controls className={videoStyles.videoTag}></video>*/}
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


  
