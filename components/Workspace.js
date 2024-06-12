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
import { clearUnfinishedAnnotation } from '../utils/utils';
import { Modal } from 'antd';
import { editProject, postBtnGroup, editVideo, postFrameAnnotation, getFrameAnnotation, postProjectAnnotation, getProjectAnnotation } from '../utils/requests';


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
    const [totalFrameCount, setTotalFrameCount] = useState(0);
    const [uploader, setUploader] = useState();
    const [confirmConfig, setConfirmConfig] = useState();
    const [saveConfig, setSaveConfig] = useState(false);
    const [saveAnnotation, setSaveAnnotation] = useState(false);
    const [infoOpen, setInfoOpen] = useState(false);
    const [info, setInfo] = useState();
    const [videoData, setVideoData] = useState({});
    const [loadVideo, setLoadVideo] = useState();
    const [resetVideoPlay, setResetVideoPlay] = useState();
    const [resetVideoDetails, setResetVideoDetails] = useState();
    const [videoAdditionalFieldsObj, setVideoAdditionalFieldsObj] = useState();
    const [projectId, setProjectId] = useState();
    const [projectData, setProjectData] = useState();

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
        totalFrameCount: totalFrameCount,
        uploader: uploader,
        confirmConfig: confirmConfig,
        saveConfig: saveConfig,
        saveAnnotation: saveAnnotation,
        info: info,
        infoOpen: infoOpen,
        videoData: videoData,
        loadVideo: loadVideo,
        resetVideoPlay: resetVideoPlay,
        resetVideoDetails: resetVideoDetails,
        videoAdditionalFieldsObj: videoAdditionalFieldsObj,
        projectId: projectId,
        projectData: projectData,
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
        setTotalFrameCount: setTotalFrameCount,
        setUploader: setUploader,
        setConfirmConfig: setConfirmConfig,
        setSaveConfig: setSaveConfig,
        setSaveAnnotation: setSaveAnnotation,
        setInfo: setInfo,
        setInfoOpen: setInfoOpen,
        setVideoData: setVideoData,
        setLoadVideo: setLoadVideo,
        setResetVideoPlay: setResetVideoPlay,
        setResetVideoDetails: setResetVideoDetails,
        setVideoAdditionalFieldsObj: setVideoAdditionalFieldsObj,
        setProjectId: setProjectId,
        setProjectData: setProjectData,
    }


    




    useEffect(() => {
        if (uploader?.type && uploader?.file) {
            saveAnnotationAndUpdateStates(); 
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
                setInfo('Please upload the project configuration data first');
                setInfoOpen(true);
            } else if (obj.projectId !== projectId) {
                setInfo('The project id in the uploaded data does not match the current project id. Please upload the project configuration file first.')
                setInfoOpen(true);
            } else {
                Modal.confirm({
                    content: 'Upload and save/update the uploaded annotation data to database?\nThis will override the data in database.',
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
                    content: 'The current project data will be replaced!\nThe uploaded configuration data will be saved to database. This may override the existing data in database.',
                    onOk: ()=>{confirmUploadConfiguration(obj)},
                });
            } else {
                Modal.confirm({
                    title: 'Alert',
                    content: 'The uploaded configuration data will be saved to database. This may override the existing data in database.',
                    onOk: ()=>{confirmUploadConfiguration(obj)},
                });
            }

            
    
        }
    }

    async function confirmUploadConfiguration(obj) {
        setProjectId(obj.projectId);
        setProjectData({projectName: obj.projectName, description: obj.description});
        setBtnConfigData(obj.btnConfigData ? {...obj.btnConfigData} : {});
        setVideoData(obj.videos ? {...obj.videos} : {});
        setResetVideoPlay(true);
        setResetVideoDetails(true);

        const projectObj = {
            projectId: obj.projectId, 
            projectName: obj.projectName,
            description: obj.description
        }
        const projectRes = await editProject(projectObj);
        if (projectRes['error']) {
            setInfo('Saving project configuration data to DB failed.');
            setInfoOpen(true);
        }
        
        Object.keys(obj.btnConfigData).forEach(async (id)=>{
            const btnGroupObj = {...obj.btnConfigData[id]};
            btnGroupObj.btnGroupId = id;
            let res = await postBtnGroup(btnGroupObj);
            if (res['error']) {
                setInfo('Saving btn configuration data to DB failed.');
                setInfoOpen(true);
            }
        })

        Object.keys(obj.videos).forEach(async (id)=>{
            const videoObj = {...obj.videos[id]};
            videoObj.videoId = id;
            let res = await editVideo(videoObj);
            if (res['error']) {
                setInfo('Saving video data to DB failed.');
                setInfoOpen(true);
            }
        })
        

    }

    async function confirmSaveUploadedAnnotationToDB(data) {
        const res = await postProjectAnnotation({annotations: data.annotations})
        if (res['error']) {
            setInfo('Saving annotation data to DB failed.');
            setInfoOpen(true);
        } else {
            if ((data.videos.filter(v => v===videoId).length>0) && Number.isInteger(frameNum)) {
                getFrameAnnotationFromDBAndSetState();
            } 
            else {
                setFrameAnnotation({});
            }
        }
    }


    useEffect(()=> {
        if (saveConfig) {
            if (!projectId) {
                setInfo('No current project.');
                setInfoOpen(true);
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
        console.log(saveAnnotation);
        if (saveAnnotation) {
            saveCurrentAnnotation()
                .then((res) => {
                    console.log(res);
                    if (res?.error) {
                        console.log(res);
                    } else {
                        if (projectId) {
                            getProjectAnnotation(projectId)
                                .then((res)=>{
                                    if (res['error']) {
                                        console.log(res);
                                    } else {
                                        const jsonAnno = JSON.stringify(res);
                                        const blobAnno = new Blob([jsonAnno], {type: 'text/plain'});
                                        const a = document.createElement("a");
                                        a.href = URL.createObjectURL(blobAnno);
                                        a.download = projectData.projectName + '_annotation.json';
                                        a.click();
                                        URL.revokeObjectURL(a.href);
                                        
                                    }
                                })
                        }
                    }
                })
            
            setSaveAnnotation(false);
        }
        
    }, [saveAnnotation])


    useEffect(()=> {
        if (props.btnConfigData) {
            setBtnConfigData(props.btnConfigData);
        }
    }, [props.btnConfigData])


    useEffect(() => {
        saveAnnotationAndUpdateStates();
        setFrameNum(null);
      }, [videoId]
    )

   

    useEffect(() => {
        /* when videouploader switch to a new frame, save the annotation for the current frame
           then retrieve the annotation for the new frame
         */
        saveAnnotationAndUpdateStates();
        if (Number.isInteger(frameNum) && videoId 
        ) {
            getFrameAnnotationFromDBAndSetState();
        } else {
            setFrameAnnotation({});
        }
        
      }, [frameNum]
    )
    

    function saveAnnotationAndUpdateStates() {
        saveCurrentAnnotation();
        setActiveAnnoObj(null);
        setDrawType(null);
        setSkeletonLandmark(null);
        setUndo(0);
        setUseEraser(null);
        setAnnoIdToDelete(null);
    }

    async function saveCurrentAnnotation() {
            if ( Object.keys(frameAnnotation).length > 0) {
                const newFrameAnno = clearUnfinishedAnnotation({...frameAnnotation});
                if (Object.keys(newFrameAnno).length > 0) {
                    const res = await saveFrameAnnotationToDB(newFrameAnno);
                    return res;
                } 
            } 
    }


    function addAnnotationObj(idObj) {
        setFrameAnnotation({...frameAnnotation, [idObj.id]: idObj});
    }



    

    useEffect(() => {
        console.log('btnConfigData changed', btnConfigData);
        const btnConfigCopy = {...btnConfigData};
        Object.values(btnConfigCopy).forEach(groupData => {
            if (groupData?.edgeData && groupData.edgeData.edges.length) {
                const edgesArr = groupData.edgeData.edges.map(neighborSet => neighborSet?[...neighborSet]:null);
                groupData.edgeData.edges = edgesArr;
            }
        })

    }, [btnConfigData])



    useEffect(() => {
        if (btnConfigData) {
            console.log(btnConfigData);
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
        setInfo(null);
        setInfoOpen(false);
    }

    function cancelClickHandler() {
        setInfo(null);
        setInfoOpen(false);
    }

    async function getFrameAnnotationFromDBAndSetState() {
        const res = await getFrameAnnotation(frameNum, videoId);
        if (res?.annotations?.length > 0) {
            const frameAnno = {};
            res.annotations.forEach((anno) => frameAnno[anno.id] = anno);
            setFrameAnnotation(frameAnno);
        } else {
            console.log(res);
            setFrameAnnotation({});
        }
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
                    {props.children}
                    {}
                </StatesProvider>

                <Modal
                    title='Info'
                    open={infoOpen}
                    onOk={okClickHandler} 
                    onCancel={cancelClickHandler}
                    footer={(_, { OkBtn, CancelBtn }) => (
                        <>
                          <CancelBtn />
                        </>
                    )}
                    >
                    <p className="ant-upload-text ms-4">{info}</p>
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