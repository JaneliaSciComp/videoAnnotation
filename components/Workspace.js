import React, {useState, useEffect, useRef} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import styles from '../styles/Workspace.module.css';
import BtnGroup from './BtnGroup';
import BrushTool from './BrushTool';
import { StatesProvider } from './AppContext';
import { 
    clearUnfinishedAnnotation,
} from '../utils/utils';
import { Modal } from 'antd';
import { editProject, postProjectAnnotation, getProjectAnnotation, postVideoAnnotation, postProjectBtn, postProjectVideo, getAdditionalData } from '../utils/requests';


/**
 * props:
 *      btnConfigData
 *      //url: image url or video url // or put this in Canvas
 */
export default function Workspace(props) {
    
    const [videoId, setVideoId] = useState();
    const [frameUrl, setFrameUrl] = useState();
    const [frameNum, setFrameNum] = useState();
    const annotationRef = useRef({});
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
    const [downloadConfig, setDownloadConfig] = useState(false);
    const [downloadAnnotation, setDownloadAnnotation] = useState(false);
    const [modalInfoOpen, setModalInfoOpen] = useState(false);
    const [modalInfo, setModalInfo] = useState();
    const [globalInfo, setGlobalInfo] = useState();
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
    const [updateAnnotationChart, setUpdateAnnotationChart] = useState(false);
    const [resetAnnotationChart, setResetAnnotationChart] = useState(false);
    const lastFrameNumForIntervalAnnoRef = useRef();
    const [intervalErasing, setIntervalErasing] = useState({});
    const [cancelIntervalErasing, setCancelIntervalErasing] = useState(false);
    const lastFrameNumForIntervalErasingRef = useRef();
    const [mutualExclusiveCategory, setMutualExclusiveCategory] = useState([]);
    const additionalDataRef = useRef({});
    const [saveAnnotation, setSaveAnnotation] = useState(false);
    const realFpsRef = useRef(25);
    const [isFetchingFrame, setIsFetchingFrame] = useState(false);


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
        frameNumSignal: frameNumSignal,
        uploader: uploader,
        confirmConfig: confirmConfig,
        downloadConfig: downloadConfig,
        downloadAnnotation: downloadAnnotation,
        globalInfo: globalInfo,
        modalInfo: modalInfo,
        modalInfoOpen: modalInfoOpen,
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
        updateAnnotationChart: updateAnnotationChart,
        resetAnnotationChart: resetAnnotationChart,
        lastFrameNumForIntervalAnnoRef: lastFrameNumForIntervalAnnoRef,
        intervalErasing: intervalErasing,
        cancelIntervalErasing: cancelIntervalErasing,
        lastFrameNumForIntervalErasingRef: lastFrameNumForIntervalErasingRef,
        mutualExclusiveCategory: mutualExclusiveCategory,
        realFpsRef: realFpsRef,
        isFetchingFrame: isFetchingFrame,
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
        setDownloadConfig: setDownloadConfig,
        setDownloadAnnotation: setDownloadAnnotation,
        setGlobalInfo: setGlobalInfo,
        setModalInfo: setModalInfo,
        setModalInfoOpen: setModalInfoOpen,
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
        setUpdateAnnotationChart: setUpdateAnnotationChart,
        setResetAnnotationChart: setResetAnnotationChart,
        setIntervalErasing: setIntervalErasing,
        setCancelIntervalErasing: setCancelIntervalErasing,
        setSaveAnnotation: setSaveAnnotation,
        setIsFetchingFrame: setIsFetchingFrame,
    }


    useEffect(() => {
        setResetVideoPlay(true);
        setResetVideoDetails(true);
        setResetChart(true);
        setAdditionalDataNameToRetrieve([]);
        annotationRef.current = {};
        additionalDataRef.current = {};
    }, [projectId])


    useEffect(() => {
        if (getAdditionalDataSignal) {
            getAdditionalDataFromRef();
            setGetAdditionalDataSignal(false);
            setGetAdditionalDataSignal(false); 
        }
    }, [getAdditionalDataSignal])

    useEffect(() => {
        getAdditionalDataFromRef();
    }, [additionalDataRange])

    useEffect(() => {
        if (videoId) {
            setGlobalInfo(null);
            setAdditionalData({});
            additionalDataRef.current = {};
            if (additionalDataNameToRetrieve?.length>0) {
                getAdditionalData(videoId, additionalDataNameToRetrieve)
                .then(res => {
                    if (res.error) {
                        setGlobalInfo(res.error);
                    } else {
                        additionalDataNameToRetrieve.forEach(name => {
                            additionalDataRef.current[name] = res[name]??[];
                        })
                    }
                    getAdditionalDataFromRef();
                })
            } else {
                getAdditionalDataFromRef();
            }
            
            
        }
    }, [additionalDataNameToRetrieve])

    function getAdditionalDataFromRef() {
        setGlobalInfo(null);
        if (Number.isInteger(frameNum)) { 
            let additionalDataForChart={};
            if (additionalDataNameToRetrieve?.length>0) {
                additionalDataNameToRetrieve.map(name => {
                    const rangeNeeded = additionalDataRange[name];
                    if (rangeNeeded >= 0) {
                        const rangeStartNeeded = ((frameNum-rangeNeeded)<0) ? 0 : (frameNum-rangeNeeded);
                        const rangeEndNeeded = ((frameNum+rangeNeeded)>(videoMetaRef.current.totalFrameCount-1)) ? (videoMetaRef.current.totalFrameCount-1) : (frameNum+rangeNeeded);
                        const dataNeeded = additionalDataRef.current[name].slice(rangeStartNeeded, rangeEndNeeded+1);
                        additionalDataForChart[name] = {
                            range: [rangeStartNeeded, rangeEndNeeded], 
                            data: dataNeeded
                        };
                    }
                })
            }
            setAdditionalData(additionalDataForChart);
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
             *      videos: [str, str, ],
             *      annotations: [{}, {}, ...]
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
            setGlobalInfo('Editting project configuration data in DB failed.');
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
            setGlobalInfo('Saving btn configuration data to DB failed.');
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
            setGlobalInfo('Saving video data to DB failed.');
            return
        }
        
        setBtnConfigData(obj.btnConfigData ? {...obj.btnConfigData} : {});
        setVideoData(obj.videos ? {...obj.videos} : {});
    
    }

    async function confirmSaveUploadedAnnotationToDB(data) {
        const res = await postProjectAnnotation({...data});
        if (res['error']) {
            setGlobalInfo('Saving annotation data to DB failed.');
        } else {
            if ((data.videos.filter(v => v===videoId).length>0) && Number.isInteger(frameNum)) {
                const videoAnnotations = data.annotations.filter(anno => anno.videoId === videoId);
                const forAnnoRef = {};
                videoAnnotations.forEach(anno => {
                    if (!forAnnoRef[anno.frameNum]) {
                        forAnnoRef[anno.frameNum] = {};
                    }
                    forAnnoRef[anno.frameNum][anno.id] = anno;
                })
                annotationRef.current = forAnnoRef;
                getFrameAnnotationFromRefAndSetState();
            } 
            setResetAnnotationChart(true);
        }
    }


    useEffect(()=> {
        if (downloadConfig) {
            if (!projectId) {
                setGlobalInfo('No project.');
            } 
            else {
                const projectConfigData = {...projectData, btnConfigData: {...btnConfigData}, videos: {...videoData}};
                const jsonProjectConfig = JSON.stringify(projectConfigData);
                const blobProjectConfig = new Blob([jsonProjectConfig], {type: 'text/plain'});
                const a = document.createElement("a");
                a.href = URL.createObjectURL(blobProjectConfig);
                a.download = projectData.projectName + '_configuration.json';
                a.click();
                URL.revokeObjectURL(a.href);
            }
            setDownloadConfig(false);
        }
    }, [downloadConfig])

    useEffect(()=> {
        if (downloadAnnotation) {
            if (projectId) {
                if (videoId || frameUrl) {
                    saveFrameAnnotation(true, false)
                    const annotations = Object.values(annotationRef.current).map(frameAnno => Object.values(frameAnno))
                    const data = {
                        annotations: annotations.flat(),
                        videoId: videoId,
                    }
                    setGlobalInfo('Saving annotation to database...');
                    postVideoAnnotation(data).then((res) => {
                        if (res.success) {
                            setGlobalInfo('Successfully saved annotation to database.');  
                            downloadProjectAnnotation(projectId);
                        } else {
                            setGlobalInfo('Failed to save annotation to database.');
                        }
                    })
                } else {
                    downloadProjectAnnotation(projectId);
                }
            } else {
                setGlobalInfo('No current project.');
            }
            setDownloadAnnotation(false);
        }
        
    }, [downloadAnnotation])

    async function downloadProjectAnnotation(projectId) {
        const res = await getProjectAnnotation(projectId)
        if (res['error']) {
            setGlobalInfo(res);
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


    useEffect(()=> {
        if (saveAnnotation) {
            if (projectId) {
                if (videoId || frameUrl) {
                    saveFrameAnnotation(true, false);
                    const annotations = Object.values(annotationRef.current).map(frameAnno => Object.values(frameAnno))
                    const data = {
                        annotations: annotations.flat(),
                        videoId: videoId,
                    }
                    setGlobalInfo('Saving annotation to database...');
                    postVideoAnnotation(data).then((res) => {
                        if (res.success) {
                            setGlobalInfo('Successfully saved annotation to database.');  
                        } else {
                            setGlobalInfo('Failed to save annotation to database.');
                        }
                    })
                } else {
                    setGlobalInfo('No video to save.');
                }
            } else {
                setGlobalInfo('No current project.');
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
        saveAnnotationAndUpdateStates(true);
        setFrameNum(null);
        additionalDataRef.current = {};  
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
            getFrameAnnotationFromRefAndSetState();
        } else {
            setFrameAnnotation(() => {});
        }

        if (intervalAnno.on && Number.isInteger(frameNum)) {
            lastFrameNumForIntervalAnnoRef.current = frameNum;
        }

        if (Object.values(intervalErasing).some(value=>value.on) && Number.isInteger(frameNum)) {
            lastFrameNumForIntervalErasingRef.current = frameNum;
        }
            
      }, [frameNum]
    )
    

    function saveAnnotationAndUpdateStates(cancelInterval=false) {
        
        setActiveAnnoObj(null);
        setDrawType(null);
        setSkeletonLandmark(null);
        setUndo(0);
        setUseEraser(null);
        setAnnoIdToDelete(null);
        saveFrameAnnotation(cancelInterval);
    }

    function saveFrameAnnotation(cancelInterval=false, savePrevFrame=true) {
            if (!Number.isInteger(frameNum) || frameNum === 0) return;

            const newFrameAnno = clearUnfinishedAnnotation({...frameAnnotation});
            if (cancelInterval && intervalAnno.on) {

                    setCancelIntervalAnno(true);
            }

            if (Object.keys(newFrameAnno).length > 0) {
                const firstAnno = Object.values(newFrameAnno)[0];
                if (savePrevFrame && firstAnno.frameNum === frameNum-1) {
                    annotationRef.current[frameNum-1] = newFrameAnno; 
                } else if (!savePrevFrame && firstAnno.frameNum === frameNum) {
                    annotationRef.current[frameNum] = newFrameAnno; 
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
        const mutualExclusiveCategoryArr = [];
        Object.entries(btnConfigCopy).forEach(([id, groupData]) => {
            if (groupData?.edgeData && groupData.edgeData.edges.length) {
                const edgesArr = groupData.edgeData.edges.map(neighborSet => neighborSet?[...neighborSet]:null);
                groupData.edgeData.edges = edgesArr;
            }
            
            if (groupData.groupType === 'category') {
                const mutualExclusive = [];
                groupData.childData.forEach(child => {
                    if (!Object.keys(colors).some(label => label === child.label)) {
                        colors[child.label] = child.color;
                    }

                    mutualExclusive.push(child.label);
                })
                mutualExclusiveCategoryArr.push(mutualExclusive);

                intervalErasingData[id] = {on: false, startFrame:null, videoId:null, labels: groupData.childData.map(child => child.label)};
            }
        })
        setCategoryColors(colors);
        setIntervalErasing(() => intervalErasingData);
        setMutualExclusiveCategory(mutualExclusiveCategoryArr);
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


    function okClickHandler() {
        setModalInfo(null);
        setModalInfoOpen(false);
    }

    function cancelClickHandler() {
        setModalInfo(null);
        setModalInfoOpen(false);
    }

    function getFrameAnnotationFromRefAndSetState() {
        const frameAnno = annotationRef.current[frameNum]??{};
        setFrameAnnotation({...frameAnno});
    }


    return (
        <div className={styles.container}>
            <main className={styles.main}>
                <StatesProvider states={states} stateSetters={stateSetters}>
                    {props.children}
                </StatesProvider>

                <Modal
                    title='Info'
                    open={modalInfoOpen}
                    onOk={okClickHandler}
                    onCancel={cancelClickHandler}
                    footer={(_, { CancelBtn }) => (
                        <>
                          <CancelBtn />
                        </>
                    )}
                    >
                    <p className="ant-upload-text ms-4">{modalInfo}</p>
                </Modal>
            </main>
        </div>
    )
}
