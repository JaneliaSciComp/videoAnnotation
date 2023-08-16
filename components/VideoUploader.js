import React, {useState, useEffect, useRef} from 'react';
import { saveAs } from 'file-saver';
import JSZip from "jszip";
import videoStyles from '../styles/Video.module.css';

const FRAME_FORMAT = 'jpg';


export default function Workspace(props) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    function submitVideoHandler(e) {
        e.preventDefault();
        e.stopPropagation();
        // console.log('webkitEntries', e.target.webkitEntries);
        const file = e.target.files[0];
        console.log(file);

        const reader = new FileReader();
        reader.onload = function() {
            var data = reader.result;
            // var node = document.getElementById('output');
            // node.innerText = text;
            console.log(data);
        };
        // reader.readAsArrayBuffer(file);
        // reader.readAsDataURL(file);
        reader.readAsBinaryString(file);
        
        // if (file) {
        //     videoRef.current.src = URL.createObjectURL(file);
        //     console.log(videoRef.current.videoTracks);
        //     const captureStream = videoRef.current.captureStream();
        //     videoRef.current.play();
        //     // const frames = extractFrames(videoRef.current);
        
        //     console.log(captureStream);
        //     // const track = file.getVideoTracks()[0];
        //     const media_processor = new MediaStreamTrackProcessor(captureStream);

        //     const reader = media_processor.readable.getReader();
        //     // while (true) {
        //         const result =  reader.read(); //=await
        //         // if (result.done) break;

        //         let frame = result.value;
        //         const ctx = canvasRef.current.getContext('2d');
        //         ctx.drawImage(frame,0,0);
        //     // }
        // }
        
        
    }

    function extractFrames(videoElem) {
        const cap = new cv.VideoCapture(videoElem);
        console.log(videoElem, cap);
        // console.log(cap.get(cv.CAP_PROP_FPS ), cap.get(cv.CAP_PROP_FRAME_COUNT))
        if (cap) {
            const res = [];
            const zip = new JSZip();
            let counter = 0;
            let frame = new cv.Mat(videoElem.height, videoElem.width, cv.CV_8UC4); //
            console.log(videoElem.height, videoElem.width);
            do {
                // ret, frame = cap.read();
                cap.read(frame);
                console.log(frame);
                // res.push(frame);

                cv.imshow(canvasRef.current.id, frame);
                canvasRef.current.toBlob((blob)=>{
                    zip.file(`frames/f_${counter}.${FRAME_FORMAT}`, blob);
                    let frameObj = {
                        frameNum: counter,
                        blobData: blob,
                        url: URL.createObjectURL(blob)
                    };
                    res.push(frameObj);
                }, `image/${FRAME_FORMAT}`);
                counter++;
            } while (counter<1); // (ret);  
            // cap.delete();
            zip.generateAsync({type: 'blob'}).then(zipFile => {
                const currentDate = new Date().getTime();
                const fileName = `frames_${currentDate}.zip`;
                saveAs(zipFile, fileName);
              });
            return res;
        } else {
            //TODO: show info to user
            return null;
        }
    }

    function submitFramesHandler(e) {
        e.preventDefault();
        e.stopPropagation();

    }


    return (
        <>
            <input type='file' id='videoInput' accept='.jpg, .mp4, .mov, .avi' onChange={submitVideoHandler}></input>
            <video ref={videoRef} width={500} height={500} controls className={videoStyles.videoTag}></video>
            <canvas ref={canvasRef} id='canvasTag' className={videoStyles.canvasTag}></canvas>
            <input type='file' webkitdirectory='' id='framesInput'  onChange={submitFramesHandler}></input>
        </>
    )

}
