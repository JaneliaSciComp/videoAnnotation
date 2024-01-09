import React, {useState, useEffect, useRef} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import styles from '../styles/Workspace.module.css';
import Canvas from './Canvas';
// import BoundingBox from './BoundingBox';
// import Polygon from './Polygon';
// import KeyPoint from './Keypoint';
// import ShapeBtn from './ShapeBtn';
// import Category from './Category';
import ActiveAnnotation from './ActiveAnnotation';
import VideoUploader from './VideoUploader';
import {Row, Col, Button} from 'react-bootstrap';
import BtnGroup from './BtnGroup';
import BrushTool from './BrushTool';
// import BtnGroupController from './BtnGroupController';
// import Design from './BtnConfiguration';
import { StatesProvider } from './AppContext';
import { clearUnfinishedAnnotation } from '../utils/utils';


export default function Workspace(props) {
    /**
     * props:
     *      btnConfigData
     *      url: image url or video url // or put this in Canvas
     */
    const [videoId, setVideoId] = useState();
    const [frameUrl, setFrameUrl] = useState(); //'/fly.png'
    const [frameNum, setFrameNum] = useState();
    const prevFrameNum = useRef();
    const annotationRef = useRef({});
    const [frameAnnotation, setFrameAnnotation] = useState({});
    const [activeAnnoObj, setActiveAnnoObj] = useState();
    // const [categoryId, setCategoryId] = useState({});
    // const [keyPointIdList, setKeyPointIdList] = useState({});
    // const [drawKeyPoint, setDrawKeyPoint] = useState(false);
    // const [rectIdList, setRectIdList] = useState({});
    // const [drawRect, setDrawRect] = useState(false);
    // const [polygonIdList, setPolygonIdList] = useState({});
    // const [drawPolygon, setDrawPolygon] = useState(false);
    const [drawType, setDrawType] = useState();
    const [skeletonLandmark, setSkeletonLandmark] = useState(); // the current landmark index to draw, pass to skeletonBtn and Canvas
    const [useEraser, setUseEraser] = useState(); //for brush, boolean
    const [brushThickness, setBrushThickness] = useState(); //for brush
    const [undo, setUndo] = useState(0); // int, for brush, when undo+1 (by BrushBtn), remove the latest path with the same annoId (by Canvas).
    const [annoIdToDraw, setAnnoIdToDraw] = useState();
    const [annoIdToDelete, setAnnoIdToDelete] = useState(); // set by AnnotationTable, reset to null by Canvas after deleting from canvas and fabricObjRef
    const [annoIdToShow, setAnnoIdToShow] = useState([]);
    const [btnConfigData, setBtnConfigData] = useState({});
    const [btnGroups, setBtnGroups] = useState();
    // const [projectType, setProjectType] = useState('image'); //'image' or 'video'
    const [frameNumSignal, setFrameNumSignal] = useState(); // Chart use it to tell VideoUploader which frame to go to. 1-based
    const [totalFrameCount, setTotalFrameCount] = useState(0);
    const [save, setSave] = useState(false);
    // const [chartMetric, setChartMetric] = useState();

    console.log('workspace render');

    const states = {
        videoId: videoId,
        frameUrl: frameUrl,
        frameNum: frameNum,
        frameAnnotation: frameAnnotation,
        activeAnnoObj: activeAnnoObj,
        drawType: drawType,
        skeletonLandmark: skeletonLandmark,
        useEraser: useEraser,
        brushThickness: brushThickness,
        undo: undo,
        annoIdToDraw: annoIdToDraw,
        annoIdToDelete: annoIdToDelete,
        annoIdToShow: annoIdToShow,
        btnConfigData: btnConfigData,
        btnGroups: btnGroups,
        annotationRef: annotationRef,
        // projectType: projectType,
        frameNumSignal: frameNumSignal,
        totalFrameCount: totalFrameCount,
        save: save,
        // chartMetric: chartMetric,
    }

    const stateSetters = {
        setVideoId: setVideoId,
        setFrameUrl: setFrameUrl,
        setFrameNum: setFrameNum,
        setFrameAnnotation: setFrameAnnotation,
        setActiveAnnoObj: setActiveAnnoObj,
        setDrawType: setDrawType,
        setSkeletonLandmark: setSkeletonLandmark,
        setUseEraser: setUseEraser,
        setUndo: setUndo,
        setAnnoIdToDraw: setAnnoIdToDraw,
        setAnnoIdToDelete: setAnnoIdToDelete,
        setAnnoIdToShow: setAnnoIdToShow,
        setBrushThickness: setBrushThickness,
        setBtnConfigData: setBtnConfigData,
        setBtnGroups: setBtnGroups,
        // setProjectType: setProjectType,
        setFrameNumSignal: setFrameNumSignal,
        setTotalFrameCount: setTotalFrameCount,
        setSave: setSave,
        // setChartMetric: setChartMetric,
    }


    useEffect(()=> {
        if (save) {
            const annoCopy = clearUnfinishedAnnotation(frameAnnotation);
            annotationRef.current[frameNum] = annoCopy;
            const json = JSON.stringify(annotationRef.current);
            const a = document.createElement("a");
            const file = new Blob([json], {type: 'text/plain'});
            a.href = URL.createObjectURL(file);
            a.download = 'annotations.json';
            a.click();
            URL.revokeObjectURL(a.href);
            setSave(false);
        }
    }, [save])

    useEffect(()=> {
        if (props.btnConfigData) {
            setBtnConfigData({...props.btnConfigData});
        }
    }, [props.btnConfigData])


    useEffect(() => {
        //save frame anno data for last video
        saveAnnotationAndUpdateStates();
        //update totoal anno data for current video. will be replace by retrieving from DB later on.
        annotationRef.current = {};
        prevFrameNum.current = null; 
        setFrameNum(null); // It's possible last vdieo is showing frame 0, then when switch video, frameNum won't change, then the effect below won't be called. So set frameNum to null, then when show frame 0 for the current video, the effect below will be called
        // setFrameAnnotation({});
        // console.log('videoid');
      }, [videoId] //when switch video, videoId will change first, then frameNum change to 0. So this effect called first, then the effect below
    )

    // useEffect(() => { 
    //     // annotationRef.current = {};
    //     console.log('frameNum');
    //     // saveAnnotationAndUpdateStates();
    //     if (Number.isInteger(prevFrameNum.current) && Object.keys(frameAnnotation).length > 0) {
    //         annotationRef.current[prevFrameNum.current] = frameAnnotation; 
    //     }
    //     prevFrameNum.current = frameNum;
    //     setDrawType(null);
    //     setActiveIdObj(null);
    //     if (Number.isInteger(frameNum) && annotationRef.current[frameNum]) {
    //         // console.log('retrieve1 called', frameNum, annotationRef.current[frameNum]);
    //         setFrameAnnotation({...annotationRef.current[frameNum]});
    //     } else {
    //         // console.log('retrieve2 called');
    //         setFrameAnnotation({});
    //     }
    //   }, [frameNum]
    // )
   

    useEffect(() => {
        /* when videouploader switch to a new frame, save the annotation for current frame
           then retrieve the annotation for the new frame
         */
        console.log('workspace frameNum useEffect: save frameAnnotation ', prevFrameNum.current, frameNum, frameAnnotation);
        //save cuurent frame anno data
        saveAnnotationAndUpdateStates();
        //retrieve next frame anno data
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
        //         annotationRef.current[frameNum] = frameAnnotation; 
        //     }
        // }
      }, [frameNum]
    )
    
    function clearUnfinishedAnnotation() {
        // when switch frame or video, for skeleton, polygon and brush seg, they may not be finished (for brush, no data at all), remove such annoObj from frameAnnotation
        let unfinished =[];
        if (Object.keys(frameAnnotation).length > 0) {
            unfinished = Object.keys(frameAnnotation).filter(id=>{
                const annoObj = frameAnnotation[id];
                console.log('clear', annoObj, annoObj.type, annoObj.data, annoObj.first, annoObj.pathes);
                if ((annoObj.type ==='polygon' 
                    || annoObj.type==='keyPoint' 
                    || annoObj.type==='bbox')
                        && !annoObj.data) {
                    return true
                } else if (annoObj.type === 'skeleton') {
                    const unDraw = annoObj.data.filter(arr => arr[0]===null && arr[1]===null && arr[2]!==0)
                    if (unDraw.length>0) {
                        return true;
                    } else {
                        return false;
                    }
                } else if (annoObj.type === 'brush' && (!annoObj.pathes || annoObj.pathes.length===0)) {
                    return true;                    
                } 
                else {
                    return false;
                }
            })
        }
        const annoCopy = {...frameAnnotation};
        unfinished.forEach(id => delete(annoCopy[id]));
        return annoCopy;
    }

    function saveAnnotationAndUpdateStates() {
        // console.log('save anno');
        if (Number.isInteger(prevFrameNum.current)) {
            if ( Object.keys(frameAnnotation).length > 0) {
                const newFrameAnno = clearUnfinishedAnnotation();
                if (Object.keys(newFrameAnno).length > 0) {
                    annotationRef.current[prevFrameNum.current] = newFrameAnno; 
                } else {
                    delete(annotationRef.current[prevFrameNum.current]);
                }
                // console.log(newFrameAnno);
            } else {
                delete(annotationRef.current[prevFrameNum.current]);
            }
        }
        prevFrameNum.current = frameNum;
        setActiveAnnoObj(null);
        setDrawType(null);
        setSkeletonLandmark(null);
        setUndo(0);
        setUseEraser(null);
        //annoIdToDraw will be reset in canvas after getBrushData()
        setAnnoIdToDelete(null);
        // setAnnoIdToShow([]);
    }


    function addAnnotationObj(idObj) {
        setFrameAnnotation({...frameAnnotation, [idObj.id]: idObj});
        // frameAnnotation[idObj.id] = idObj; 
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

    useEffect(() => {
        if (btnConfigData) {
            renderBtnGroup();
        }
      }, [btnConfigData, frameNum, frameAnnotation, drawType, skeletonLandmark]
    )


    function renderBtnGroup() {
        // console.log(btnConfigData);
        const groupIndices = Object.keys(btnConfigData).sort((a, b) => Number(a)-Number(b));
        const groups = []; 
        let k = 0;
        let addedBrushTool = false;
        groupIndices.forEach(index => {
            const data = {...btnConfigData[index]};
            data.groupIndex = index;
            // console.log('workspace renderBtnGroup:', index, data);
            if (data.groupType === 'brush' && !addedBrushTool) {
                groups.push(<BrushTool key={k++} />);
                addedBrushTool = true;
            }
            groups.push(
                <BtnGroup 
                    key={k++}
                    data={data}
                    frameNum={frameNum}
                    frameUrl={frameUrl}
                    addAnnotationObj={addAnnotationObj}
                    setActiveAnnoObj={setActiveAnnoObj}
                    drawType={drawType}
                    setDrawType={setDrawType}
                    skeletonLandmark={skeletonLandmark}
                    setSkeletonLandmark={setSkeletonLandmark}
                    frameAnnotation={data.groupType==='skeleton' ? frameAnnotation : null}
                />
            )
        })
        // console.log(btnGroupIds);
        setBtnGroups(groups);
    }


    function onAddBtnClick() {
        console.log('Add btn clicked');
    }

    function onCreateBtnClick(data) {
        console.log('create', data);
    }
    
    function clickHandler() {
        console.log('anno', frameAnnotation);
    }

    return (
        <div className={styles.container}>
            <main className={styles.main}>
                <StatesProvider states={states} stateSetters={stateSetters}>
                    {props.children}
                    {/* <Button onClick={clickHandler}>anno</Button> */}
                </StatesProvider>
            </main>

          {/* <main className={styles.main}>
          <StatesProvider states={states} stateSetters={stateSetters}>
            <Row className='mx-1 my-1'>
                <Design 
                    data={btnConfigData}
                    setData={setBtnConfigData}
                    onAddBtnClick={onAddBtnClick}
                    onCreateBtnClick={onCreateBtnClick}
                />
            </Row>
    
            <Row >
                <Col xs={6}>
                    {btnGroups}  */}
                    
                    {/* <Row className='mx-1 my-1'>
                        <BtnGroup 
                            child='shapeBtn'
                            type='bbox'
                            numOfBtn={2}
                            labels={['a','b']}
                            colors={['red', 'blue']}
                            frameNum={frameNum}
                            addAnnotationObj={addAnnotationObj}
                            setActiveIdObj={setActiveIdObj}
                            drawType={drawType}
                            setDrawType={setDrawType}
                        />
                    </Row>
                    <Row className='mx-1 my-1'>
                        <BtnGroup 
                            child='category'
                            // type='bbox'
                            numOfBtn={2}
                            labels={['cate1','cate2']}
                            colors={['red', 'blue']}
                            frameNum={frameNum}
                            addAnnotationObj={addAnnotationObj}
                            setActiveIdObj={setActiveIdObj}
                            drawType={drawType}
                            setDrawType={setDrawType}
                        />
                    </Row> */}
                    {/* <Row className='mx-1 my-1'>
                        <Category
                            label='chase'
                            color='black'
                            frameNum={frameNum}
                            addAnnotationObj={addAnnotationObj}
                            setActiveIdObj={setActiveIdObj}
                            />
                    </Row>
                    <Row className='mx-1 my-1'> 
                        <ShapeBtn
                            type='keyPoint'
                            label='head'
                            color='lightblue'
                            drawType={drawType}
                            setDrawType={setDrawType} 
                            // addKeyPointId={addKeyPointId}
                            frameNum={frameNum}
                            addAnnotationObj={addAnnotationObj}
                            />
                    </Row>
                
                    <Row className='mx-1 my-1'>
                        <ShapeBtn 
                            type='bbox'
                            label='male' 
                            color='red'
                            drawType={drawType}
                            setDrawType={setDrawType} 
                            // addRectId={addRectId} 
                            frameNum={frameNum}
                            addAnnotationObj={addAnnotationObj}
                            />
                        <ShapeBtn 
                            type='bbox'
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
                        <ShapeBtn
                            type='polygon' 
                            label='fly' 
                            color='red'
                            drawType={drawType}
                            setDrawType={setDrawType}
                            // addPolygonId={addPolygonId}
                            frameNum={frameNum}
                            addAnnotationObj={addAnnotationObj}
                            />
                    </Row> */}
                {/* </Col>
                <Col xs={6} >
                    <AnnotationDisplay annoObj={activeAnnoObj}/>
                </Col>
                
            </Row>
            
            <Row className='mx-1 my-1'>
                <Canvas 
                    videoId={videoId}
                    frameUrl={frameUrl}
                    frameNum={frameNum}
                    drawType={drawType}
                    setDrawType={setDrawType}
                    skeletonLandmark={skeletonLandmark}
                    setSkeletonLandmark={setSkeletonLandmark}
                    frameAnnotation={frameAnnotation}
                    setFrameAnnotation={setFrameAnnotation}
                    btnConfigData={btnConfigData}
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
                    setActiveAnnoObj={setActiveAnnoObj}
                    />
            </Row>
            
            <Row className='my-3'>
                <VideoUploader setFrameUrl={setFrameUrl} setFrameNum={setFrameNum} setVideoId={setVideoId} />
            </Row>
            </StatesProvider>
          </main> */}
        </div>
    )
}