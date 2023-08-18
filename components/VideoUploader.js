import React, {useState, useEffect, useRef} from 'react';
import { saveAs } from 'file-saver';
import JSZip from "jszip";
import videoStyles from '../styles/Video.module.css';
import Script from 'next/script';


const FRAME_FORMAT = 'jpg';


export default function Workspace(props) {
    // const videoRef = useRef(null);
    // const canvasRef = useRef(null);
    const imgRef = useRef(null);
    const framesRef = useRef({});
    const [decodeStatus, setDecodeStatus] = useState('not started'); //not started; ongoing; done; failed
    const [fps, setFps] = useState();
    const [frameCount, setFrameCount] = useState();

    console.log('VideoUploader render');

    const pyscript_code = `
        import cv2 as cv
        import os
        #import shutil
        #print(os.getcwd())  #/home/pyodide
        #print(os.listdir('/')) #['tmp', 'home', 'dev', 'proc', 'lib']

        import asyncio
        from js import document, console
        from pyodide.ffi import create_proxy

        #counter = 0 # counter = n, means the nth frame is being processed, (n-1)th frame is done

        def extractFrames(input_file_name):
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
                while cap.isOpened(): #counter<1: # 
                    if counter%200 == 0:
                        print(counter)
                    ret, frame = cap.read()
                    if not ret:
                        #print("Can't receive frame (stream end?). Exiting ...")
                        break
                    cv.imwrite(f'/tmp/frames/f_{counter}.jpg', frame)
                    counter += 1
                    #frames.append(frame)
                
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

            
        def process_video(data): #(e)
            try:
                #data = e.target.result
                data_bin = data.to_py()
                del data
                #print(data.type, data_bin.type)
                with open('/tmp/video.mov', 'wb') as f:
                    f.write(data_bin)
                del data_bin
                print(os.listdir('/tmp/'))
                res = extractFrames('/tmp/video.mov') #frame=
                #print(frame.shape)
                #ret, buf_arr = cv.imencode(".jpg", frame)
                #print(buf_arr.shape)
                #print(buf_arr)
                return res
            except Exception as e:
                print(e)
                return 'Something wrong with video decode'
        
        
        def get_frame(frame_num):
            if os.path.exists(file_path):
                frame = cv.imread(f'/tmp/frames/f_{frame_num}.jpg')
                ret, buf_arr = cv.imencode(".jpg", frame)
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


    useEffect(() => {
        if (decodeStatus === 'done') { // collect frame data in pyscript
            console.log('useEffect called');
            let tracker = 0;
            const moveFrame = pyscript.interpreter.globals.get('move_frame');
            const zip = new JSZip();
            while (tracker < frameCount) {
                const res = moveFrame(tracker);
                if (typeof res === 'string'){
                    console.log(res);
                    break;
                } else {
                    const res_js = res.toJs();
                    const frame = new Blob([res_js], { type: 'image/jpg' })
                    // console.log(img_data);
                    const url = URL.createObjectURL(frame);
                    framesRef.current = {...framesRef.current, [tracker]: url}
                    zip.file(`frames/f_${tracker}.jpg`, frame);
                    tracker++;
                }
            }
            if (tracker==frameCount) {
                zip.generateAsync({type: 'blob'})
                    .then(zipFile => {
                        saveAs(zipFile, `frames.zip`);
                });
            }
        }

      }, [decodeStatus]
    )

    function getFrame(frameNum) {
        return framesRef.current[frameNum];
    }


    function submitVideoHandler(e) {
        e.preventDefault();
        e.stopPropagation();
        // console.log('webkitEntries', e.target.webkitEntries);
        setDecodeStatus('ongoing');
        setFps(null);
        setFrameCount(null);
        const file = e.target.files[0];
        // console.log(file);

        const reader = new FileReader();
        reader.onload = function() {
            let data = reader.result;
            // console.log(data);

            const js_processVideo = pyscript.interpreter.globals.get('process_video');
            const res = js_processVideo(data);
            data=null;
            console.log(typeof(res), res);
                        
            if (typeof res === 'string'){
                setDecodeStatus('failed');
            } else {
                const res_js = res.toJs();
                console.log(typeof(res_js), res_js);
                setDecodeStatus('done');
                setFps(res_js[0]);
                setFrameCount(res_js[1]);
            }
            // const img_data = new Blob([frame_js], { type: 'image/jpg' } /* (1) */)
            // console.log(img_data);
            // const url = URL.createObjectURL(img_data);
            // imgRef.current.src = url;
            // console.log(url);
            
            // saveAs(img_data, 'test.jpg');
        };
        reader.readAsArrayBuffer(file);
        // // reader.readAsDataURL(file);
        // reader.readAsBinaryString(file);
        // const zip = new JSZip();
            // frames.forEach((f, i) => {
            //     zip.file(`f_${i}.jpg`, f);
            // });
            // console.log(zip);
            // zip.generateAsync({type: 'blob'}).then(zipFile => {
            //     const currentDate = new Date().getTime();
            //     const fileName = `combined-${currentDate}.zip`;
            //     console.log(fileName)
            //     saveAs(zipFile, fileName);
            //     // return FileSaver.saveAs(zipFile, fileName);
            // });
        
    }

    // function extractFrames(videoElem) {
    //     const cap = new cv.VideoCapture(videoElem);
    //     console.log(videoElem, cap);
    //     // console.log(cap.get(cv.CAP_PROP_FPS ), cap.get(cv.CAP_PROP_FRAME_COUNT))
    //     if (cap) {
    //         const res = [];
    //         const zip = new JSZip();
    //         let counter = 0;
    
    //             counter++;
    
    //         return res;
    //     } else {
    //         //TODO: show info to user
    //         return null;
    //     }
    // }

    function submitFramesHandler(e) {
        e.preventDefault();
        e.stopPropagation();

    }

    //onChange={submitVideoHandler}


    return (
        <>
            <Script defer src="https://pyscript.net/latest/pyscript.js" strategy='beforeInteractive'/>
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
            </div>
            {/* <video ref={videoRef} width={500} height={500} controls className={videoStyles.videoTag}></video>*/}
            {/* <canvas ref={canvasRef} id='canvasTag' className={videoStyles.canvasTag}></canvas>  */}
            <img ref={imgRef} id='imgOutput' width="300" height="200"  alt="No Image" />
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


  
