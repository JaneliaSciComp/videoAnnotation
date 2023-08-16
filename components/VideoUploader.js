import React, {useState, useEffect, useRef} from 'react';
import { saveAs } from 'file-saver';
import JSZip from "jszip";
import videoStyles from '../styles/Video.module.css';
import Script from 'next/script';


const FRAME_FORMAT = 'jpg';


export default function Workspace(props) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const pyscript_code = `
        import cv2 as cv
        import os
        import shutil
        #print(os.getcwd())  #/home/pyodide
        #print(os.listdir('/')) #['tmp', 'home', 'dev', 'proc', 'lib']

        import asyncio
        from js import document, console
        from pyodide.ffi import create_proxy

        

        def extractFrames(input_file_name):
            os.makedirs('/tmp/frames', exist_ok=True)
            #frames = []
            cap = cv.VideoCapture(input_file_name)
            console.log(cap.get(cv.CAP_PROP_FPS ), cap.get(cv.CAP_PROP_FRAME_COUNT))
            counter = 0
            while cap.isOpened(): #counter<1: 
                if counter%100 == 0:
                    print(counter)
                ret, frame = cap.read()
                #print(ret)
                if not ret:
                    #print("Can't receive frame (stream end?). Exiting ...")
                    break
                cv.imwrite(f'/tmp/frames/f_{counter}.jpg', frame)
                counter += 1
                #frames.append(frame)
            
            print(len(os.listdir('/tmp/frames/')))
            print(f'Extracted {counter} frames')
            cap.release()
            zip_file = shutil.make_archive('/tmp/frames', 'zip', root_dir='/tmp/frames')
            return zip_file



        async def process_video(e):
            #print('event handler called')
            files = e.target.files
            
            #console.log(files)
            #console.log(files.0)
            for video in files:
                reader = js.FileReader.new()
                onload_event = create_proxy(save_video)
                reader.onload = onload_event
                reader.readAsArrayBuffer(video)
                #frames = reader.readAsArrayBuffer(video)
                break
            #return frames

            
        def save_video(data): #(e)
            #print('save_v called')
            #data = e.target.result
            data_bin = data.to_py()
            print(data.type, data_bin.type)
            with open('/tmp/video.mov', 'wb') as f:
                f.write(data_bin)
            print(os.listdir('/tmp/'))
            zip_file = extractFrames('/tmp/video.mp4')
            #frames = extractFrames('/tmp/video.mov')
            #extractFrames('/tmp/video.mov')
            return zip_file

        
        def main():
            change_handler = create_proxy(process_video)
            elem = document.getElementById('videoInput')
            elem.addEventListener('change', change_handler)
            #print('event added')
            #console.log(elem)

        main()
    `

    async function submitVideoHandler(e) {
        e.preventDefault();
        e.stopPropagation();
        // console.log('webkitEntries', e.target.webkitEntries);
        const file = e.target.files[0];
        // console.log(file);

        const reader = new FileReader();
        reader.onload = function() {
            var data = reader.result;
            // var node = document.getElementById('output');
            // node.innerText = text;
            console.log(data);

            const js_processVideo = pyscript.interpreter.globals.get('save_video');
            const zip_file = js_processVideo(data);
            console.log(typeof(zip_file));
            // saveAs()
        };
        // // reader.readAsArrayBuffer(file);
        // // reader.readAsDataURL(file);
        // reader.readAsBinaryString(file);
        const js_processVideo = pyscript.interpreter.globals.get('process_video');
        const frames = await js_processVideo(e)
        // .then((frames)=>{
        //     console.log(frames, typeof(frames));
        // });
        console.log(frames, typeof(frames));
        
        
        
        
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
            <input type='file' id='videoInput' accept='.jpg, .mp4, .mov, .avi' ></input>
            {/* <video ref={videoRef} width={500} height={500} controls className={videoStyles.videoTag}></video>
            <canvas ref={canvasRef} id='canvasTag' className={videoStyles.canvasTag}></canvas> */}
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


  
