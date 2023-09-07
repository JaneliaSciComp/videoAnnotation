import React, {useState, useEffect, useRef} from 'react';
import styles from '../styles/Workspace.module.css';
import Canvas from './Canvas';
import BoundingBox from './BoundingBox';
import Polygon from './Polygon';
import KeyPoint from './Keypoint';
import Category from './Category';
import AnnotationDisplay from './AnnotationDisplay';
import VideoUploader from './VideoUploader';
import {Row, Col} from 'react-bootstrap';



export default function Workspace(props) {
    const [videoId, setVideoId] = useState();
    const [frameUrl, setFrameUrl] = useState(); //'/fly.png'
    const [frameNum, setFrameNum] = useState();
    const prevFrameNum = useRef();
    const annotationRef = useRef({});
    const [frameAnnotation, setFrameAnnotation] = useState({});
    const [activeIdObj, setActiveIdObj] = useState();
    // const [categoryId, setCategoryId] = useState({});
    // const [keyPointIdList, setKeyPointIdList] = useState({});
    // const [drawKeyPoint, setDrawKeyPoint] = useState(false);
    // const [rectIdList, setRectIdList] = useState({});
    // const [drawRect, setDrawRect] = useState(false);
    // const [polygonIdList, setPolygonIdList] = useState({});
    // const [drawPolygon, setDrawPolygon] = useState(false);
    const [drawType, setDrawType] = useState();

    

    console.log('workspace render');

    useEffect(() => {
        /* when videouploader switch to a new frame, save the annotation for current frame
           then retrieve the annotation for the new frame
         */
        // console.log('useEffect called ', prevFrameNum.current, frameNum, frameAnnotation);
        if (Number.isInteger(prevFrameNum.current) && Object.keys(frameAnnotation).length > 0) {
            // annotationRef.current = {...annotationRef.current, [frameNum]: frameAnnotation};
            // console.log('save called', prevFrameNum.current);
            annotationRef.current[prevFrameNum.current] = frameAnnotation; ////???
        }
        prevFrameNum.current = frameNum;
        
        setActiveIdObj(null);
        if (Number.isInteger(frameNum) && annotationRef.current[frameNum]) {
            // console.log('retrieve1 called', frameNum, annotationRef.current[frameNum]);
            setFrameAnnotation({...annotationRef.current[frameNum]});
        } else {
            // console.log('retrieve2 called');
            setFrameAnnotation({});
        }
        
        // return ()=>{
        //     console.log('return1 called', frameNum, frameAnnotation);
        //     if (Number.isInteger(frameNum) && Object.keys(frameAnnotation).length > 0) {
        //         // annotationRef.current = {...annotationRef.current, [frameNum]: frameAnnotation};
        //         console.log('return2 called', frameNum);
        //         annotationRef.current[frameNum] = frameAnnotation; ////???
        //     }
        // }
      }, [frameNum]
    )


    function addAnnotationObj(idObj) {
        // setFrameAnnotation({...frameAnnotation, [idObj.id]: idObj});
        frameAnnotation[idObj.id] = idObj; 
    }


    // function addKeyPointId(idObj) {
    //     setKeyPointIdList({...keyPointIdList, [idObj.id]: idObj});
    // }

    // function addRectId(idObj) {
    //     setRectIdList({...rectIdList, [idObj.id]: idObj});
    // }
    
    // function addPolygonId(idObj) {
    //     setPolygonIdList({...polygonIdList, [idObj.id]: idObj});
    // }

    

    return (
        <div className={styles.container}>
          <main className={styles.main}>
            <Row >
                <Col xs={6}>
                    <Row className='mx-1 my-1'>
                        <Category
                            label='chase'
                            color='black'
                            frameNum={frameNum}
                            addAnnotationObj={addAnnotationObj}
                            setActiveIdObj={setActiveIdObj}
                            >
                        </Category>
                    </Row>
                    <Row className='mx-1 my-1'> 
                        <KeyPoint
                            label='head'
                            color='lightblue'
                            drawType={drawType}
                            setDrawType={setDrawType} 
                            // addKeyPointId={addKeyPointId}
                            frameNum={frameNum}
                            addAnnotationObj={addAnnotationObj}
                            >
                        </KeyPoint>
                    </Row>
                
                    <Row className='mx-1 my-1'>
                        <BoundingBox 
                            label='male' 
                            color='red'
                            drawType={drawType}
                            setDrawType={setDrawType} 
                            // addRectId={addRectId} 
                            frameNum={frameNum}
                            addAnnotationObj={addAnnotationObj}
                            />
                        <BoundingBox 
                            label='female' 
                            color='blue'
                            drawType={drawType}
                            setDrawType={setDrawType}  
                            // addRectId={addRectId} 
                            frameNum={frameNum}
                            addAnnotationObj={addAnnotationObj}
                            />
                    </Row>
                        
                    <Row className='mx-1 my-1'>
                        <Polygon 
                            label='fly' 
                            color='red'
                            drawType={drawType}
                            setDrawType={setDrawType}
                            // addPolygonId={addPolygonId}
                            frameNum={frameNum}
                            addAnnotationObj={addAnnotationObj}
                            />
                    </Row>
                </Col>
                <Col xs={6}>
                    <AnnotationDisplay idObj={activeIdObj}/>
                </Col>
                
            </Row>
            
            <Row className='mx-1 my-1'>
                <Canvas 
                    videoId={videoId}
                    imgUrl={frameUrl}
                    frameNum={frameNum}
                    drawType={drawType}
                    setDrawType={setDrawType}
                    frameAnnotation={frameAnnotation}
                    setFrameAnnotation={setFrameAnnotation}
                    // drawKeyPoint={drawKeyPoint}
                    // setDrawKeyPoint={setDrawKeyPoint}
                    // keyPointIdList={keyPointIdList}
                    // setKeyPointIdList={setKeyPointIdList}
                    // drawRect={drawRect}
                    // setDrawRect={setDrawRect}
                    // rectIdList={rectIdList}
                    // setRectIdList={setRectIdList}
                    // drawPolygon={drawPolygon}
                    // setDrawPolygon={setDrawPolygon}
                    // polygonIdList={polygonIdList}
                    // setPolygonIdList={setPolygonIdList}
                    setActiveIdObj={setActiveIdObj}
                    />
                
            </Row>
            
            <Row className='my-3'>
                <VideoUploader setFrameUrl={setFrameUrl} setFrameNum={setFrameNum} setVideoId={setVideoId} />
            </Row>
            
          </main>
        </div>
    )
}