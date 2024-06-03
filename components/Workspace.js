import React, {useState, useEffect, useRef, use} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
// import { saveAs } from 'file-saver';
import JSZip from "jszip";
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
import { Modal } from 'antd';
import { editProject, postBtnGroup, editVideo, postFrameAnnotation, getFrameAnnotation, postProjectAnnotation, getProjectAnnotation } from '../utils/requests';


/**
 * props:
 *      btnConfigData
 *      //url: image url or video url // or put this in Canvas
 */
export default function Workspace(props) {
    
    const [videoId, setVideoId] = useState();
    const [frameUrl, setFrameUrl] = useState(); //for image, '/fly.png'
    const [frameNum, setFrameNum] = useState();
    const prevFrameNum = useRef();
    const annotationRef = useRef({}); //if image, only one child with frameNum 0
    const [frameAnnotation, setFrameAnnotation] = useState({}); 
    const [activeAnnoObj, setActiveAnnoObj] = useState();
    const [drawType, setDrawType] = useState();
    const [skeletonLandmark, setSkeletonLandmark] = useState(); // the current landmark index to draw, pass to skeletonBtn and Canvas
    const [useEraser, setUseEraser] = useState(); //for brush, boolean
    const [brushThickness, setBrushThickness] = useState(); //for brush
    const [undo, setUndo] = useState(0); // int, for brush, when undo+1 (by BrushBtn), remove the latest path with the same annoId (by Canvas).
    const [annoIdToDraw, setAnnoIdToDraw] = useState();
    const [annoIdToDelete, setAnnoIdToDelete] = useState(); // set by AnnotationTable, reset to null by Canvas after deleting from canvas and fabricObjRef
    const [annoIdToShow, setAnnoIdToShow] = useState([]);
    const [btnConfigData, setBtnConfigData] = useState({}); // {id1: {groupType:, btnType:, childData:[], ...}, id2:{...}, ...}
    const [btnGroups, setBtnGroups] = useState();
    // const [projectType, setProjectType] = useState('image'); //'image' or 'video'
    const [frameNumSignal, setFrameNumSignal] = useState(); // Chart use it to tell VideoUploader which frame to go to. 1-based
    const [totalFrameCount, setTotalFrameCount] = useState(0);
    // const [save, setSave] = useState(false);
    // const [chartMetric, setChartMetric] = useState();
    const [uploader, setUploader] = useState(); // {type: 'annotation'/'configuration', file: fileObj}
    // const projectConfigDataRef = useRef({}); //{projectName: 'str', description: 'str'/null, btnConfigData: obj/copy of btnConfigData state,edges are array not set}
    const [confirmConfig, setConfirmConfig] = useState(); // ProjectManager use it to tell BtnConfiguration to create btns
    const [saveConfig, setSaveConfig] = useState(false);
    const [saveAnnotation, setSaveAnnotation] = useState(false);
    const [infoOpen, setInfoOpen] = useState(false);
    const [info, setInfo] = useState();
    const [videoData, setVideoData] = useState({}); //{videoId1: {projectId:, name:, path:, additionalFields: [{name: str, value: str}, ...]}, videoId2: {}} // can be null/undefined/empty arr, and this field always exist in video data; value field can be absent if it's not required
    const [loadVideo, setLoadVideo] = useState(); // videoManager to trigger getVideo request in videoUploader. {id: {name:, path:, ...}}
    // const [videoPathToGet, setVideoPathToGet] = useState(); // video path obj in videoManager, to trigger get request in videoUploader. {videoId: , projectId: , name:, path:,additonalFields:}
    const [resetVideoPlay, setResetVideoPlay] = useState(); // used by VideoManager and Workspace (videoId useEffect) to reset video play status in VideoUploader
    const [resetVideoDetails, setResetVideoDetails] = useState(); // used by JsonUploader to reset video details window in VideoManager
    const [videoAdditionalFieldsObj, setVideoAdditionalFieldsObj] = useState(); //generated from prop of VideoManager(developer defined prop), used by VideoManager to check whether required fields are empty, by VideoUploader to know if to display the data with video or show in chart. {fieldName1: {required: field.required, uploadWithVideo: field.uploadWithVideo, shape: field.shape}, fieldName2:{}}
    const [projectId, setProjectId] = useState(); //TODO: remove 'testId'
    const [projectData, setProjectData] = useState(); // config data for current project. {projectId: , projectName: , (description: )}

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
        // save: save,
        // chartMetric: chartMetric,
        uploader: uploader,
        // projectConfigDataRef: projectConfigDataRef,
        confirmConfig: confirmConfig,
        saveConfig: saveConfig,
        saveAnnotation: saveAnnotation,
        info: info,
        infoOpen: infoOpen,
        videoData: videoData,
        loadVideo: loadVideo,
        // videoPathToGet: videoPathToGet,
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
        // setProjectType: setProjectType,
        setFrameNumSignal: setFrameNumSignal,
        setTotalFrameCount: setTotalFrameCount,
        // setSave: setSave,
        // setChartMetric: setChartMetric,
        setUploader: setUploader,
        setConfirmConfig: setConfirmConfig,
        setSaveConfig: setSaveConfig,
        setSaveAnnotation: setSaveAnnotation,
        setInfo: setInfo,
        setInfoOpen: setInfoOpen,
        setVideoData: setVideoData,
        setLoadVideo: setLoadVideo,
        // setVideoPathToGet: setVideoPathToGet,
        setResetVideoPlay: setResetVideoPlay,
        setResetVideoDetails: setResetVideoDetails,
        setVideoAdditionalFieldsObj: setVideoAdditionalFieldsObj,
        setProjectId: setProjectId,
        setProjectData: setProjectData,
    }


    
    useEffect(()=>{
        // before close the window, save annotation of the current frame to db 
        window.addEventListener("beforeunload", closeWindowHandler);

        return () => {
            window.removeEventListener("beforeunload", closeWindowHandler);
        }
    })

    function closeWindowHandler(e) {
        // e.preventDefault();
        // e.stopPropagation();
        // console.log('window beforeunload called');
        saveCurrentAnnotation();
    }


    useEffect(() => {
        if (uploader?.type && uploader?.file) {
            const reader = new FileReader();
            reader.onload = (e) => onReaderLoad(e, uploader.type);
            reader.readAsText(uploader.file.originFileObj);
        }

    }, [uploader])

    function onReaderLoad(e, type){
        // console.log(e.target.result);
        // setInfo(null);
        // setInfoOpen(False);
        
        const obj = JSON.parse(e.target.result);
        // console.log(obj);
        if (type === 'annotation') {
            /**
             * {
             *      projectId: str,
             *      videos: [],
             *      annotations: []
             * }
             */
            saveAnnotationAndUpdateStates(); 
            // prevFrameNum.current = null; 

            // annotationRef.current = obj;
            if (!projectId || (obj.projectId === projectId)) {
                // const currentFrameNum = frameNum;
                postProjectAnnotation(obj.annotations)
                    .then(res => {
                        if (res['error']) {
                            setInfo('Sending project data to DB failed.');
                            setInfoOpen(True);
                        } else {
                            if ((obj.videos.filter(v => v===videoId).length>0) && Number.isInteger(frameNum)) { // a video is open
                                getFrameAnnotationFromDBAndSetState();
                                // setFrameAnnotation({...annotationRef.current[frameNum]});
                            } 
                            // else if (frameUrl) { // an image is open
                            //     setFrameAnnotation({...annotationRef.current[0]});
                            // } 
                            else {
                                setFrameAnnotation({});
                            }
                        }
                    })
            } else {
                setInfo('The uploaded annotation does not match the current project id.')
                setInfoOpen(True);
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
            // projectConfigDataRef.current = obj;
            
            setProjectId(obj.projectId);
            setProjectData({projectName: obj.projectName, description: obj.description}); // description could be absent in obj, but will be passed undefined
            setBtnConfigData(obj.btnConfigData ? {...obj.btnConfigData} : {}); // btnConfigData could be null
            setVideoData(obj.videos ? {...obj.videos} : {}); // videos might be empty obj but not null
            setVideoId(null);
            // setFrameNum(null);
            // setFrameUrl(null);

            // save/update the uploaded project Config data in DB?
            // Modal.confirm({
            //     content: 'Save/Update the uploaded data in database?',
            //     onOk: () => {confirmSaveConfigDataToDB(obj)},
            // });
            const projectObj = {
                projectId: obj.projectId, 
                projectName: obj.projectName,
                description: obj.description
            }
            editProject(projectObj)
                .then((res) => {
                    if (res['error']) {
                        setInfo('Sending project data to DB failed.');
                        setInfoOpen(True);
                    }
                });
            
            Object.keys(obj.btnConfigData).forEach((id)=>{
                const btnGroupObj = {...obj.btnConfigData[id]};
                btnGroupObj.btnGroupId = id;
                postBtnGroup(btnGroupObj)
                    .then((res) => {
                        if (res['error']) {
                            setInfo('Sending btn configuration data to DB failed.');
                            setInfoOpen(True);
                        }
                    });
            })
    
            Object.keys(obj.videos).forEach((id)=>{
                const videoObj = {...obj.videos[id]};
                videoObj.videoId = id;
                editVideo(videoObj)
                    .then((res) => {
                        if (res['error']) {
                            setInfo('Sending video data to DB failed.');
                            setInfoOpen(True);
                        }
                    });
            })
        }
    }

    // function confirmSaveConfigDataToDB(data) {
    //     const projectObj = {
    //         projectId: data.projectId, 
    //         projectName: data.projectName,
    //         description: data.description
    //     }
    //     editProject(projectObj);
        
    //     Object.keys(data.btnConfigData).forEach((id)=>{
    //         const btnGroupObj = {...data.btnConfigData[id]};
    //         btnGroupObj.btnGroupId = id;
    //         postBtnGroup(btnGroupObj);
    //     })

    //     Object.keys(data.videos).forEach((id)=>{
    //         const videoObj = {...data.videos[id]};
    //         videoObj.videoId = id;
    //         editVideo(videoObj);
    //     })
    // }

    // function convertEdgeArrToSet(obj) { //obj is a copy of btnConfigData
    //     Object.values(obj).forEach(groupData => {
    //         if (groupData.groupType === 'skeleton' && groupData.edgeData && groupData.edgeData.edges.length) {
    //             const edgesSet = groupData.edgeData.edges.map(neighborArr => neighborArr?new Set(neighborArr):null);
    //             groupData.edgeData.edges = edgesSet;
    //         }
    //     })
    //     return obj;
    // }

    useEffect(()=> {
        if (saveConfig) {
            // console.log(projectConfigDataRef.current);
            // if (!projectConfigDataRef.current?.projectName) {
            if (!projectId) {
                setInfo('No current project.');
                setInfoOpen(true);
            } 
            // else if (Object.keys(btnConfigData).length===0 || Object.keys(btnConfigData[Object.keys(btnConfigData)[0]]).length===0) {
            //     setInfo('No annotation button is created.');
            //     setInfoOpen(true);
            // } 
            else {
                const projectConfigData = {...projectData, btnConfigData: {...btnConfigData}, videos: {...videoData}};
                // console.log(projectConfigData);
                const jsonProjectConfig = JSON.stringify(projectConfigData);
                // console.log(jsonProjectConfig);
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
                .then((res) => { //saveCurrentAnnotation should be finished first
                    console.log(res);
                    if (res?.error) { //if no anno for current frame, res is undefined
                        console.log(res);
                    } else {
                        if (projectId) {
                            getProjectAnnotation(projectId)
                                .then((res)=>{
                                    if (res['error']) {
                                        console.log(res);
                                    } else {
                                        // const jsonAnno = JSON.stringify(annotationRef.current);
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
            // convertEdgeArrToSet(props.btnConfigData);
            setBtnConfigData(props.btnConfigData);
        }
    }, [props.btnConfigData])


    useEffect(() => {
        //save frame anno data for last video
        saveAnnotationAndUpdateStates();
        //update totoal anno data for current video. will be replace by retrieving from DB later on.
        // annotationRef.current = {};
        // prevFrameNum.current = null; 
        setFrameNum(null); // It's possible last vdieo is showing frame 0, then when switch video, frameNum won't change, then the effect below won't be called. So set frameNum to null, then when show frame 0 for the current video, the effect below will be called
        // setFrameAnnotation({});
        setResetVideoPlay(true); // tell VideoUploader to reset video play status
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
        // console.log('workspace frameNum useEffect: save frameAnnotation ', prevFrameNum.current, frameNum, frameAnnotation, annotationRef.current);
        //save cuurent frame anno data
        saveAnnotationAndUpdateStates();
        //retrieve next frame anno data
        if (Number.isInteger(frameNum) && videoId 
            // && annotationRef.current[frameNum]
        ) {
            console.log('retrieve1 called', frameNum);
            // setFrameAnnotation({...annotationRef.current[frameNum]});
            getFrameAnnotationFromDBAndSetState();
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
    
    // function clearUnfinishedAnnotation() {
    //     // when switch frame or video, for skeleton, polygon and brush seg, they may not be finished (for brush, no data at all), remove such annoObj from frameAnnotation
    //     let unfinished =[];
    //     if (Object.keys(frameAnnotation).length > 0) {
    //         unfinished = Object.keys(frameAnnotation).filter(id=>{
    //             const annoObj = frameAnnotation[id];
    //             // console.log('clear', annoObj, annoObj.type, annoObj.data, annoObj.first, annoObj.pathes);
    //             if ((annoObj.type ==='polygon' 
    //                 || annoObj.type==='keyPoint' 
    //                 || annoObj.type==='bbox')
    //                     && !annoObj.data) {
    //                 return true
    //             } else if (annoObj.type === 'skeleton') {
    //                 const unDraw = annoObj.data.filter(arr => arr[0]===null && arr[1]===null && arr[2]!==0)
    //                 if (unDraw.length>0) {
    //                     return true;
    //                 } else {
    //                     return false;
    //                 }
    //             } else if (annoObj.type === 'brush' && (!annoObj.pathes || annoObj.pathes.length===0)) {
    //                 return true;                    
    //             } 
    //             else {
    //                 return false;
    //             }
    //         })
    //     }
    //     const annoCopy = {...frameAnnotation};
    //     unfinished.forEach(id => delete(annoCopy[id]));
    //     return annoCopy;
    // }

    function saveAnnotationAndUpdateStates() {
        // console.log('save anno', );
        // if (Number.isInteger(prevFrameNum.current)) {
        //     if ( Object.keys(frameAnnotation).length > 0) {
        //         const newFrameAnno = clearUnfinishedAnnotation();
        //         if (Object.keys(newFrameAnno).length > 0) {
        //             annotationRef.current[prevFrameNum.current] = newFrameAnno; 
        //         } else {
        //             delete(annotationRef.current[prevFrameNum.current]);
        //         }
        //         // console.log(newFrameAnno);
        //     } else {
        //         delete(annotationRef.current[prevFrameNum.current]);
        //     }
        // }
        saveCurrentAnnotation();
        // prevFrameNum.current = frameNum;
        setActiveAnnoObj(null);
        setDrawType(null);
        setSkeletonLandmark(null);
        setUndo(0);
        setUseEraser(null);
        //annoIdToDraw will be reset in canvas after getBrushData()
        setAnnoIdToDelete(null);
        // setAnnoIdToShow([]);
    }

    async function saveCurrentAnnotation() {
        // if (Number.isInteger(prevFrameNum.current)) {
            // console.log('saveCurrentAnnotation called', frameAnnotation);
            if ( Object.keys(frameAnnotation).length > 0) {
                const newFrameAnno = clearUnfinishedAnnotation({...frameAnnotation});
                // console.log(newFrameAnno);
                if (Object.keys(newFrameAnno).length > 0) {
                    // annotationRef.current[prevFrameNum.current] = newFrameAnno; 
                    const res = await saveFrameAnnotationToDB(newFrameAnno); // async func but no need to await
                    return res;
                } 
                // else {
                //     delete(annotationRef.current[prevFrameNum.current]);
                // }
                // console.log(newFrameAnno);
            } 
            // else {
            //     delete(annotationRef.current[prevFrameNum.current]);
            // }
        // }
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
        console.log('btnConfigData changed', btnConfigData);
        const btnConfigCopy = {...btnConfigData};
        Object.values(btnConfigCopy).forEach(groupData => {
            if (groupData?.edgeData && groupData.edgeData.edges.length) {
                const edgesArr = groupData.edgeData.edges.map(neighborSet => neighborSet?[...neighborSet]:null);
                groupData.edgeData.edges = edgesArr;
            }
        })
        // projectConfigDataRef.current.btnConfigData =btnConfigCopy;

    }, [btnConfigData])

    // useEffect(() => {
    //     projectConfigDataRef.current.videos = {...videoData};
    // }, [videoData])


    useEffect(() => {
        if (btnConfigData) {
            console.log(btnConfigData);
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
        if (res?.annotations?.length > 0) { //if no anno for this frame, res: {annotations: []}
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
        frameAnnoObjs.annotations = Object.keys(cleanFrameAnnotation).map((id) => {
            const anno = cleanFrameAnnotation[id];
            anno.videoId = videoId;
            return anno
        })
        console.log('frameAnnoObjs', frameAnnoObjs);
        const res = await postFrameAnnotation(frameAnnoObjs);
        console.log('post frame anno result', res);
        return res;
    }

    return (
        <div className={styles.container}>
            <main className={styles.main}>
                <StatesProvider states={states} stateSetters={stateSetters}>
                    {props.children}
                    {/* <Button onClick={clickHandler}>anno</Button> */}
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