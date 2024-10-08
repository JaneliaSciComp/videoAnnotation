import React, {useState, useEffect, useRef} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import JSZip from "jszip";
import styles from '../styles/Workspace.module.css';
import Canvas from './Canvas';
import ActiveAnnotation from './ActiveAnnotation';
import VideoUploader from './VideoUploader';
import {Row, Col, Button} from 'react-bootstrap';
import BtnGroup from './BtnGroup';
import BrushTool from './BrushTool';
import { StatesProvider } from './AppContext';
import { 
    clearUnfinishedAnnotation,
    additionalDataBufferFold, 
    additionalDataExtraBufferRange,
    createId,
} from '../utils/utils';
import { Modal } from 'antd';
import { editProject, postFrameAnnotation, getFrameAnnotation, postProjectAnnotation, getProjectAnnotation, postProjectBtn, postProjectVideo, getAdditionalData, postAdditionalDataNameToRetrieve } from '../utils/requests';


/**
 * props:
 *      btnConfigData
 *      //url: image url or video url // or put this in Canvas
 */
export default function Workspace(props) {
    
    const [videoId, setVideoId] = useState();
    const [frameUrl, setFrameUrl] = useState();
    const [frameNum, setFrameNum] = useState();
    const [frameAnnotation, setFrameAnnotation] = useState({}); 
    const [activeAnnoObj, setActiveAnnoObj] = useState();
    const [drawType, setDrawType] = useState();
    const [skeletonLandmark, setSkeletonLandmark] = useState();
    const [useEraser, setUseEraser] = useState();
    const [brushThickness, setBrushThickness] = useState();
    const [undo, setUndo] = useState(0);
    const [annoIdToDraw, setAnnoIdToDraw] = useState();
    const [annoIdToDelete, setAnnoIdToDelete] = useState();
    const [annoIdToShow, setAnnoIdToShow] = useState([]);
    const [btnConfigData, setBtnConfigData] = useState({});
    const [btnGroups, setBtnGroups] = useState();
    const [frameNumSignal, setFrameNumSignal] = useState();
    const [uploader, setUploader] = useState();
    const [confirmConfig, setConfirmConfig] = useState();
    const [saveConfig, setSaveConfig] = useState(false);
    const [saveAnnotation, setSaveAnnotation] = useState(false);
    const [modalInfoOpen, setModalInfoOpen] = useState(false);
    const [modalInfo, setModalInfo] = useState();
    const [info, setInfo] = useState();
    const [videoData, setVideoData] = useState({});
    const [loadVideo, setLoadVideo] = useState();
    const [resetVideoPlay, setResetVideoPlay] = useState();
    const [resetVideoDetails, setResetVideoDetails] = useState();
    const [resetChart, setResetChart] = useState();
    const [videoAdditionalFieldsConfig, setVideoAdditionalFieldsConfig] = useState({});
    const [projectId, setProjectId] = useState(); 
    const [projectData, setProjectData] = useState();
    const [getAdditionalDataSignal, setGetAdditionalDataSignal] = useState(false);
    const [additionalDataRange, setAdditionalDataRange] = useState({});
    const [additionalData, setAdditionalData] = useState({});
    const [additionalDataNameToRetrieve, setAdditionalDataNameToRetrieve] = useState([]);
    const videoMetaRef = useRef({});
    const [intervalAnno, setIntervalAnno] = useState({on: false, startFrame: null, videoId:null, label: null, color: null, annotatedFrames: new Set()});
    const [annotationChartRange, setAnnotationChartRange] = useState();
    const [categoryColors, setCategoryColors] = useState({});
    const [cancelIntervalAnno, setCancelIntervalAnno] = useState(false);
    const [addSingleCategory, setAddSingleCategory] = useState(null);
    const [removeSingleCategory, setRemoveSingleCategory] = useState(null);
    const singleCategoriesRef = useRef({});
    const [resetAnnotationChart, setResetAnnotationChart] = useState(false);
    const lastFrameNumForIntervalAnnoRef = useRef();
    const [intervalErasing, setIntervalErasing] = useState({});
    const [cancelIntervalErasing, setCancelIntervalErasing] = useState(false);
    const lastFrameNumForIntervalErasingRef = useRef();


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
        frameNumSignal: frameNumSignal,
        uploader: uploader,
        confirmConfig: confirmConfig,
        saveConfig: saveConfig,
        saveAnnotation: saveAnnotation,
        info: modalInfo,
        infoOpen: modalInfoOpen,
        videoData: videoData,
        loadVideo: loadVideo,
        resetVideoPlay: resetVideoPlay,
        resetVideoDetails: resetVideoDetails,
        videoAdditionalFieldsConfig: videoAdditionalFieldsConfig,
        projectId: projectId,
        projectData: projectData,
        additionalDataRange: additionalDataRange,
        additionalData: additionalData,
        additionalDataNameToRetrieve: additionalDataNameToRetrieve,
        videoMetaRef: videoMetaRef,
        resetChart: resetChart,
        annotationChartRange: annotationChartRange,
        intervalAnno: intervalAnno,
        categoryColors: categoryColors,
        cancelIntervalAnno: cancelIntervalAnno,
        addSingleCategory: addSingleCategory,
        removeSingleCategory: removeSingleCategory,
        singleCategoriesRef: singleCategoriesRef,
        resetAnnotationChart: resetAnnotationChart,
        lastFrameNumForIntervalAnnoRef: lastFrameNumForIntervalAnnoRef,
        intervalErasing: intervalErasing,
        cancelIntervalErasing: cancelIntervalErasing,
        lastFrameNumForIntervalErasingRef: lastFrameNumForIntervalErasingRef,
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
        setFrameNumSignal: setFrameNumSignal,
        setUploader: setUploader,
        setConfirmConfig: setConfirmConfig,
        setSaveConfig: setSaveConfig,
        setSaveAnnotation: setSaveAnnotation,
        setInfo: setModalInfo,
        setInfoOpen: setModalInfoOpen,
        setVideoData: setVideoData,
        setLoadVideo: setLoadVideo,
        setResetVideoPlay: setResetVideoPlay,
        setResetVideoDetails: setResetVideoDetails,
        setVideoAdditionalFieldsConfig: setVideoAdditionalFieldsConfig,
        setProjectId: setProjectId,
        setProjectData: setProjectData,
        setGetAdditionalDataSignal: setGetAdditionalDataSignal,
        setAdditionalDataRange: setAdditionalDataRange,
        setAdditionalDataNameToRetrieve: setAdditionalDataNameToRetrieve,
        setAdditionalData: setAdditionalData,
        setResetChart: setResetChart,
        setAnnotationChartRange: setAnnotationChartRange,
        setIntervalAnno: setIntervalAnno,
        setCancelIntervalAnno: setCancelIntervalAnno,
        setAddSingleCategory: setAddSingleCategory,
        setRemoveSingleCategory: setRemoveSingleCategory,
        setResetAnnotationChart: setResetAnnotationChart,
        setIntervalErasing: setIntervalErasing,
        setCancelIntervalErasing: setCancelIntervalErasing,
    }



    useEffect(() => {
        setResetVideoPlay(true);
        setResetVideoDetails(true);
        setResetChart(true);
        setAdditionalDataNameToRetrieve([]);
    }, [projectId])


    useEffect(() => {
        if (getAdditionalDataSignal) {
            getAdditionalFieldsData();
            setGetAdditionalDataSignal(false);
        }
    }, [getAdditionalDataSignal])

    useEffect(() => {
        getAdditionalFieldsData();
    }, [additionalDataRange])

    useEffect(() => {
        
        if (videoId) {
            setInfo(null);
            setAdditionalData({});
            console.log('workspace useEffect: postAdditionalDataNameToRetrieve', videoId, additionalDataNameToRetrieve);
            postAdditionalDataNameToRetrieve(videoId, additionalDataNameToRetrieve)
                .then(res => {
                    if (res['error']) {
                        setInfo(res['error']);
                    } else {
                        if (additionalDataNameToRetrieve.length > 0) {
                            getAdditionalFieldsData({});
                        }
                    }
                })
        }
    }, [additionalDataNameToRetrieve])

    async function getAdditionalFieldsData(initialData=null) { 
        console.log('getAdditioanlData called', additionalDataNameToRetrieve, additionalData);
        setInfo(null);
        if (additionalDataNameToRetrieve.length>0 && Number.isInteger(frameNum)) { 
            const retrievedAdditionalData = initialData??{...additionalData};
            await Promise.all(additionalDataNameToRetrieve.map(async name => {
                const rangeNeeded = additionalDataRange[name];
                if (rangeNeeded >= 0) {
                    const rangeStartNeeded = ((frameNum-rangeNeeded)<0) ? 0 : (frameNum-rangeNeeded);
                    const rangeEndNeeded = ((frameNum+rangeNeeded)>(videoMetaRef.current.totalFrameCount-1)) ? (videoMetaRef.current.totalFrameCount-1) : (frameNum+rangeNeeded);
                    const rangeInBuffer = retrievedAdditionalData[name] ? retrievedAdditionalData[name].range : null;
                    if (!rangeInBuffer || rangeStartNeeded < rangeInBuffer[0] || rangeEndNeeded > rangeInBuffer[1]) {
                        const extraRange = videoMetaRef.current.fps ? (videoMetaRef.current.fps*additionalDataBufferFold) : additionalDataExtraBufferRange;
                        console.log(rangeInBuffer, videoMetaRef.current, rangeStartNeeded, rangeEndNeeded, extraRange);
                        const res = await getAdditionalData(frameNum, name, rangeNeeded+extraRange);
                        if (res['error']) {
                            setInfo(res['error']);
                            retrievedAdditionalData[name] = 'error';
                        } else {
                            retrievedAdditionalData[name] = res;
                        }
                    }
                }
            }))
            console.log(retrievedAdditionalData);
                setAdditionalData(retrievedAdditionalData);
            
        }
    }        

    useEffect(() => {
        if (uploader?.type && uploader?.file) {
            saveAnnotationAndUpdateStates(true); 
            const reader = new FileReader();
            reader.onload = (e) => onReaderLoad(e, uploader.type);
            reader.readAsText(uploader.file.originFileObj);
        }

    }, [uploader])

    function onReaderLoad(e, type){
        
        const obj = JSON.parse(e.target.result);
        if (type === 'annotation') {
            /**
             * {
             *      projectId: str,
             *      videos: [],
             *      annotations: []
             * }
             */
            
            if (!projectId) {
                setModalInfo('Please upload the project configuration data first');
                setModalInfoOpen(true);
            } else if (obj.projectId !== projectId) {
                setModalInfo('The project id in the uploaded data does not match the current project id. Please upload the project configuration file first.')
                setModalInfoOpen(true);
            } else {
                Modal.confirm({
                    content: 'Upload and save/update the uploaded annotation data to database?\nThis will overwrite the data in database.',
                    onOk: () => {confirmSaveUploadedAnnotationToDB(obj)},
                });
            }
            
        } else {
            /**
             * {
             *      projectId: str,
                    projectName: str,
                    (description: str,) optional
                    btnConfigData: {},
                    videos: {}
                }
             */
            if (projectId) {
                Modal.confirm({
                    title: 'Alert',
                    content: 'The current project data will be replaced!\nThe uploaded configuration data will be saved to database. This may overwrite the existing data in database.',
                    onOk: ()=>{confirmUploadConfiguration(obj)},
                });
            } else {
                Modal.confirm({
                    title: 'Alert',
                    content: 'The uploaded configuration data will be saved to database. This may overwrite the existing data in database.',
                    onOk: ()=>{confirmUploadConfiguration(obj)},
                });
            }
        }
    }

    async function confirmUploadConfiguration(obj) {

        const projectObj = {
            projectId: obj.projectId, 
            projectName: obj.projectName,
            description: obj.description
        }
        const projectRes = await editProject(projectObj);
        if (projectRes['error']) {
            setModalInfo('Saving project configuration data to DB failed.');
            setModalInfoOpen(true);
            return
        } 
        setProjectId(obj.projectId);
        setProjectData({projectId: obj.projectId, projectName: obj.projectName, description: obj.description});

        
        const btns = Object.keys(obj.btnConfigData).map((id)=>{
            const btnGroupObj = {...obj.btnConfigData[id]};
            btnGroupObj.btnGroupId = id;
            return btnGroupObj;
        })
        const btnDataForDB = {
            btnGroups: btns,
            projectId: obj.projectId
        }
        let btnRes = await postProjectBtn(btnDataForDB);
        if (btnRes['error']) {
            setModalInfo('Saving btn configuration data to DB failed.');
            setModalInfoOpen(true);
            return
        } 

        const videos = Object.keys(obj.videos).map((id)=>{
            const videoObj = {...obj.videos[id]};
            videoObj.videoId = id;
            return videoObj;
        })
        const videoDataForDB = {
            videos: videos,
            projectId: obj.projectId
        }
        let videoRes = await postProjectVideo(videoDataForDB);
        if (videoRes['error']) {
            setModalInfo('Saving video data to DB failed.');
            setModalInfoOpen(true);
            return
        }
        
        setBtnConfigData(obj.btnConfigData ? {...obj.btnConfigData} : {});
        setVideoData(obj.videos ? {...obj.videos} : {});
    
    }

    async function confirmSaveUploadedAnnotationToDB(data) {
        const res = await postProjectAnnotation({...data});
        if (res['error']) {
            setModalInfo('Saving annotation data to DB failed.');
            setModalInfoOpen(true);
        } else {
            if ((data.videos.filter(v => v===videoId).length>0) && Number.isInteger(frameNum)) {
                getFrameAnnotationFromDBAndSetState();
            } 
            setResetAnnotationChart(true);
        }
    }


    useEffect(()=> {
        if (saveConfig) {
            if (!projectId) {
                setModalInfo('No current project.');
                setModalInfoOpen(true);
            } 
            else {
                const projectConfigData = {...projectData, btnConfigData: {...btnConfigData}, videos: {...videoData}};
                const jsonProjectConfig = JSON.stringify(projectConfigData);
                const blobProjectConfig = new Blob([jsonProjectConfig], {type: 'text/plain'});
                const a = document.createElement("a");
                a.href = URL.createObjectURL(blobProjectConfig);
                a.download = 'configuration.json';
                a.click();
                URL.revokeObjectURL(a.href);
            }
            setSaveConfig(false);
        }
    }, [saveConfig])

    useEffect(()=> {
        if (saveAnnotation) {
            if (projectId) {
                saveCurrentAnnotation(true)
                    .then((res) => {
                        console.log(res);
                        if (res?.error) {
                            console.log(res);
                            setInfo(res);
                        } else {
                            getProjectAnnotation(projectId)
                                .then((res)=>{
                                    if (res['error']) {
                                        console.log(res);
                                        setInfo(res);
                                    } else {
                                        const jsonAnno = JSON.stringify(res);
                                        const blobAnno = new Blob([jsonAnno], {type: 'text/plain'});
                                        const a = document.createElement("a");
                                        a.href = URL.createObjectURL(blobAnno);
                                        a.download = projectData.projectName + '_annotation.json';
                                        a.click();
                                        URL.revokeObjectURL(a.href);
                                        
                                    }
                                }
                            )
                        }
                    })
            } else {
                setModalInfo('No current project.');
                setModalInfoOpen(true);
            }
            
            setSaveAnnotation(false);
        }
        
    }, [saveAnnotation])


    useEffect(()=> {
        if (props.btnConfigData) {
            setBtnConfigData(props.btnConfigData);
        }
    }, [props.btnConfigData])


    useEffect(() => {
        console.log('videoid useEffect called')
        saveAnnotationAndUpdateStates(true).then(() => {
            console.log('saveAnnotationAndUpdateStates(true) done');
            setFrameNum(null);
        });
        

        
            
      }, [videoId]
    )

   

    useEffect(() => {
        /* when switch to a new frame, save the annotation for the current frame
           then retrieve the annotation for the new frame
         */
        saveAnnotationAndUpdateStates();

        if (Number.isInteger(frameNum) && videoId 
            && (!intervalAnno.on)
        ) {
            getFrameAnnotationFromDBAndSetState();
        } else {
            setFrameAnnotation(oldValue => {});
        }

        if (intervalAnno.on && Number.isInteger(frameNum)) {
            console.log('frameNum useEffect set lastFrameNumForIntervalAnnoRef', frameNum);
            lastFrameNumForIntervalAnnoRef.current = frameNum;
        }

        if (Object.values(intervalErasing).some(value=>value.on) && Number.isInteger(frameNum)) {
            console.log('frameNum useEffect set lastFrameNumForIntervalErasingRef', frameNum);
            lastFrameNumForIntervalErasingRef.current = frameNum;
        }

        

            
      }, [frameNum]
    )
    

    async function saveAnnotationAndUpdateStates(cancelInterval=false) {
        console.log('save anno', );
        
        setActiveAnnoObj(null);
        setDrawType(null);
        setSkeletonLandmark(null);
        setUndo(0);
        setUseEraser(null);
        setAnnoIdToDelete(null);
        await saveCurrentAnnotation(cancelInterval=cancelInterval);
    }

    async function saveCurrentAnnotation(cancelInterval=false) {
            console.log('saveCurrentAnnotation called', frameNum, frameAnnotation, intervalAnno);
            const newFrameAnno = clearUnfinishedAnnotation({...frameAnnotation});
            if (intervalAnno.on) {
                const id = createId();
                const annoObj = {
                    id: id,
                    videoId: intervalAnno.videoId,
                    frameNum: frameNum ?? lastFrameNumForIntervalAnnoRef.current,
                    label: intervalAnno.label,
                    color: intervalAnno.color,
                    type: 'category',         
                };
                newFrameAnno[id] = annoObj;

                if (cancelInterval) {
                    setCancelIntervalAnno(true);
                    console.log('saveCurrentAnnotation cancelIntervalAnno', frameNum);
                }
            }

            if ( Object.keys(newFrameAnno).length > 0) {
                if (Object.keys(newFrameAnno).length > 0) {
                    const res = await saveFrameAnnotationToDB(newFrameAnno);
                    if (res?.error) {
                        setInfo(res['error']);
                    } else {
                        if (intervalAnno.on) {
                            intervalAnno.annotatedFrames.add(frameNum);
                            console.log('workspace insert interval anno', frameNum);
                        }
                    }
                    return res;
                } 
            } 
    }


    function addAnnotationObj(idObj) {
        setFrameAnnotation({...frameAnnotation, [idObj.id]: idObj});
    }



    

    useEffect(() => {
        const btnConfigCopy = {...btnConfigData};
        const colors = {};
        const intervalErasingData = {};
        Object.entries(btnConfigCopy).forEach(([id, groupData]) => {
            if (groupData?.edgeData && groupData.edgeData.edges.length) {
                const edgesArr = groupData.edgeData.edges.map(neighborSet => neighborSet?[...neighborSet]:null);
                groupData.edgeData.edges = edgesArr;
            }

            
            if (groupData.groupType === 'category') {
                groupData.childData.forEach(child => {
                    if (!Object.keys(colors).some(label => label === child.label)) {
                        colors[child.label] = child.color;
                    }
                })

                intervalErasingData[id] = {on: false, startFrame:null, videoId:null, labels: groupData.childData.map(child => child.label)};
            }
        })
        console.log('workspace categoryColors', colors);
        console.log('workspace intervalErasingData', intervalErasingData);
        setCategoryColors(colors);
        setIntervalErasing(oldValue => intervalErasingData);
    }, [btnConfigData])

    

    useEffect(() => {
        if (btnConfigData) {
            renderBtnGroup();
        }
      }, [btnConfigData, frameNum, frameAnnotation, drawType, skeletonLandmark]
    )


    function renderBtnGroup() {
        const groupIndices = Object.keys(btnConfigData).sort((a, b) => Number(a)-Number(b));
        const groups = []; 
        let k = 0;
        let addedBrushTool = false;
        groupIndices.forEach(index => {
            const data = {...btnConfigData[index]};
            data.groupIndex = index;
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

    function okClickHandler() {
        setModalInfo(null);
        setModalInfoOpen(false);
    }

    function cancelClickHandler() {
        setModalInfo(null);
        setModalInfoOpen(false);
    }

    async function getFrameAnnotationFromDBAndSetState() {
        const frameAnno = {};

        const res = await getFrameAnnotation(frameNum, videoId);
        if (res?.annotations?.length > 0) {
            res.annotations.forEach((anno) => frameAnno[anno.id] = anno);
        } 
        setFrameAnnotation(frameAnno);
    }

    async function saveFrameAnnotationToDB(cleanFrameAnnotation) {
        const frameAnnoObjs = {};
        frameAnnoObjs.annotations = Object.keys(cleanFrameAnnotation).map(id => cleanFrameAnnotation[id]);
        const res = await postFrameAnnotation(frameAnnoObjs);
        return res;
    }

    return (
        <div className={styles.container}>
            <main className={styles.main}>
                <StatesProvider states={states} stateSetters={stateSetters}>
                    {info ? <p>{info}</p> : null}
                    {props.children}
                    {}
                </StatesProvider>

                <Modal
                    title='Info'
                    open={modalInfoOpen}
                    onOk={okClickHandler} 
                    onCancel={cancelClickHandler}
                    footer={(_, { OkBtn, CancelBtn }) => (
                        <>
                          <CancelBtn />
                        </>
                    )}
                    >
                    <p className="ant-upload-text ms-4">{modalInfo}</p>
                </Modal>
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