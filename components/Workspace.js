import React, {useState, useEffect, useRef} from 'react';
import styles from '../styles/Workspace.module.css';
import Canvas from './Canvas';
import Rectangle from './Rectangle';
import Polygon from './Polygon';
import KeyPoint from './Keypoint';
import Category from './Category';
import AnnotationDisplay from './AnnotationDisplay';
import {Form, Row, Col} from 'react-bootstrap';
import { saveAs } from 'file-saver';
import JSZip from "jszip";
import videoStyles from '../styles/Video.module.css';

const ROOT_DIR = 'http://localhost';
const FRAME_FORMAT = 'jpg';


export default function Workspace(props) {
    const [frame, setFrame] = useState('/fly.png');
    // const [annotation, setAnnotation] = useState([]);
    const [activeIdObj, setActiveIdObj] = useState();
    const [categoryId, setCategoryId] = useState({});
    const [keyPointIdList, setKeyPointIdList] = useState({});
    const [drawKeyPoint, setDrawKeyPoint] = useState(false);
    const [rectIdList, setRectIdList] = useState({});
    const [drawRect, setDrawRect] = useState(false);
    const [polygonIdList, setPolygonIdList] = useState({});
    const [drawPolygon, setDrawPolygon] = useState(false);

    const videoRef = useRef(null);
    const canvasRef = useRef(null);


    console.log('workspace render');

    // function setCategoryId(idObj) {
    //     setCategoryIdList({[idObj.id]: idObj});
    // }

    function addKeyPointId(idObj) {
        setKeyPointIdList({...keyPointIdList, [idObj.id]: idObj});
    }

    function addRectId(idObj) {
        setRectIdList({...rectIdList, [idObj.id]: idObj});
    }
    
    function addPolygonId(idObj) {
        setPolygonIdList({...polygonIdList, [idObj.id]: idObj});
    }

    function submitVideoHandler(e) {
        e.preventDefault();
        e.stopPropagation();
        // console.log('webkitEntries', e.target.webkitEntries);
        // const file = e.target.files[0];
        
        if (e.target.files[0]) {
            videoRef.current.src = URL.createObjectURL(e.target.files[0]);
            // console.log(videoRef.current.src);
            videoRef.current.play();
            const frames = extractFrames(videoRef.current);
        }
        
        
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
                // blob = new Blob(frame);
                // saveAs(frame, 'test.jpg');
                // zip.file(`f_${counter}.jpg`, frame);
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
//         const zip = JsZip();
//   blobs.forEach((blob, i) => {
//     zip.file(`file-${i}.csv`, blob);
//   });
//   zip.generateAsync({type: 'blob'}).then(zipFile => {
//     const currentDate = new Date().getTime();
//     const fileName = `combined-${currentDate}.zip`;
//     return FileSaver.saveAs(zipFile, fileName);
        
    }

    function submitFramesHandler(e) {
        e.preventDefault();
        e.stopPropagation();

    }
    // 

    return (
        <div className={styles.container}>
          <main className={styles.main}>
            <Row >
                <Col xs={6}>
                    <Row className='mx-1 my-1'>
                        <Category
                            label='chase'
                            color='black'
                            setCategoryId={setCategoryId}
                            setActiveIdObj={setActiveIdObj}
                            >
                        </Category>
                    </Row>
                    <Row className='mx-1 my-1'> 
                        <KeyPoint
                            label='head'
                            color='lightblue'
                            type='keyPoint' 
                            drawKeyPoint={drawKeyPoint}
                            setDrawKeyPoint={setDrawKeyPoint}
                            addKeyPointId={addKeyPointId}
                            >
                        </KeyPoint>
                    </Row>
                
                    <Row className='mx-1 my-1'>
                        <Rectangle 
                            label='rectangle' 
                            color='red'
                            drawRect={drawRect}
                            setDrawRect={setDrawRect} 
                            addRectId={addRectId} 
                            />
                        <Rectangle 
                            label='rect' 
                            color='blue'
                            drawRect={drawRect}
                            setDrawRect={setDrawRect} 
                            addRectId={addRectId} 
                            />
                    </Row>
                        
                    <Row className='mx-1 my-1'>
                        <Polygon 
                            label='polygon' 
                            color='red'
                            drawPolygon={drawPolygon}
                            setDrawPolygon={setDrawPolygon} 
                            addPolygonId={addPolygonId}
                            />
                    </Row>
                </Col>
                <Col xs={6}>
                    <AnnotationDisplay idObj={activeIdObj}/>
                </Col>
            </Row>
            
            <Row className='mx-1 my-1'>
                <Canvas 
                    img={frame}
                    drawKeyPoint={drawKeyPoint}
                    setDrawKeyPoint={setDrawKeyPoint}
                    keyPointIdList={keyPointIdList}
                    setKeyPointIdList={setKeyPointIdList}
                    drawRect={drawRect}
                    setDrawRect={setDrawRect}
                    rectIdList={rectIdList}
                    setRectIdList={setRectIdList}
                    drawPolygon={drawPolygon}
                    setDrawPolygon={setDrawPolygon}
                    polygonIdList={polygonIdList}
                    setPolygonIdList={setPolygonIdList}
                    setActiveIdObj={setActiveIdObj}
                    />
                
            </Row>
            
            <Row className='my-3'>
                <input type='file' id='videoInput' accept='.jpg, .mp4, .mov, .avi' onChange={submitVideoHandler}></input>
                <video ref={videoRef} width={500} height={500} controls className={videoStyles.videoTag}></video>
                <canvas ref={canvasRef} id='canvasTag' className={videoStyles.canvasTag}></canvas>
                <input type='file' webkitdirectory='' id='framesInput'  onChange={submitFramesHandler}></input>
            </Row>
            
          </main>
        </div>
    )
}