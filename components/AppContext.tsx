import { createContext, useContext, useState, useRef, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import styles from '../styles/Workspace.module.css';
import { getAdditionalData, editProject, postProjectBtn, postProjectVideo, postProjectAnnotation, postVideoAnnotation, getProjectAnnotation } from '@/utils/requests';
import { clearUnfinishedAnnotation } from '@/utils/utils';
import BtnGroup from './BtnGroup';
import BrushTool from './BrushTool';
import { Modal, UploadFile } from 'antd';


type StatesType = {
activeAnnoObj: {}, 
additionalData: {},
additionalDataNameToRetrieve: [],
additionalDataRange: {},
annoIdToDelete: string,
annoIdToDraw: string,
annoIdToShow: [],
annotationChartRange: number,
brushThickness: number,
btnConfigData: {},
btnGroups: [],
cancelIntervalAnno: boolean,
cancelIntervalErasing: boolean,
categoryColors: {},
confirmConfig: boolean,
downloadAnnotation: boolean,
downloadConfig: boolean,
drawType: string,
frameAnnotation: {},
frameNum: number,
frameNumSignal: number,
frameUrl: string,
getAdditionalDataSignal: boolean,
globalInfo: string,
intervalAnno: {}, // actual type provided; see below
intervalErasing: {},
isFetchingFrame: boolean,
loadVideo: boolean,
modalInfo: string,
modalInfoOpen: boolean,
mutualExclusiveCategory: [],
projectData: {},
projectId: string,
resetAnnotationChart: boolean,
resetChart: boolean,
resetVideoDetails: boolean,
resetVideoPlay: boolean,
saveAnnotation: boolean,
skeletonLandmark: string,
undo: number,
updateAnnotationChart: boolean,
uploader: {},
useEraser: boolean,
videoAdditionalFieldsConfig: {},
videoData: {},
videoId: string,
annotationRef: {},
lastFrameNumForIntervalAnnoRef: number,
lastFrameNumForIntervalErasingRef: number,
realFpsRef: number,
videoMetaRef: {},
}

const StatesContext = createContext<StatesType | undefined>(undefined);
const StateSettersContext = createContext({});

interface AppContextProps {
  children: React.ReactNode,
}

type uploaderType = {
  type: string,
  file: UploadFile<any>,
}

// Which of the states need to be accessible to the user-developer

export default function StatesProvider({children}: AppContextProps) {

  const [activeAnnoObj, setActiveAnnoObj] = useState({}); // needs Type
  const [additionalData, setAdditionalData] = useState({}); // needs Type
  const [additionalDataNameToRetrieve, setAdditionalDataNameToRetrieve] = useState([]); // needs better type
  const [additionalDataRange, setAdditionalDataRange] = useState({}); // needs Type
  const [annoIdToDelete, setAnnoIdToDelete] = useState<string | null>();
  const [annoIdToDraw, setAnnoIdToDraw] = useState<string>();
  const [annoIdToShow, setAnnoIdToShow] = useState([]); // unsure about type on this one
  const [annotationChartRange, setAnnotationChartRange] = useState<number>();
  const [brushThickness, setBrushThickness] = useState<number>();
  const [btnConfigData, setBtnConfigData] = useState({}); // needs Type
  const [btnGroups, setBtnGroups] = useState([]); // needs Type
  const [cancelIntervalAnno, setCancelIntervalAnno] = useState(false);
  const [cancelIntervalErasing, setCancelIntervalErasing] = useState(false);
  const [categoryColors, setCategoryColors] = useState({}); // needs Type
  const [confirmConfig, setConfirmConfig] = useState(false);
  const [downloadAnnotation, setDownloadAnnotation] = useState(false);
  const [downloadConfig, setDownloadConfig] = useState(false);
  const [drawType, setDrawType] = useState<string | null>();
  const [frameAnnotation, setFrameAnnotation] = useState({}); // needs Type
  const [frameNum, setFrameNum] = useState();
  const [frameNumSignal, setFrameNumSignal] = useState<number>(); 
  const [frameUrl, setFrameUrl] = useState<string>();
  const [getAdditionalDataSignal, setGetAdditionalDataSignal] = useState(false);
  const [globalInfo, setGlobalInfo] = useState<string | null>();
  const [intervalAnno, setIntervalAnno] = useState({on: false, startFrame: null, videoId:null, label: null, color: null, annotatedFrames: new Set()});
  const [intervalErasing, setIntervalErasing] = useState({}); // needs Type
  const [isFetchingFrame, setIsFetchingFrame] = useState(false);
  const [loadVideo, setLoadVideo] = useState(false);
  const [modalInfo, setModalInfo] = useState<string | null>();
  const [modalInfoOpen, setModalInfoOpen] = useState(false);
  const [mutualExclusiveCategory, setMutualExclusiveCategory] = useState([]);
  const [projectData, setProjectData] = useState({}); // needs Type
  const [projectId, setProjectId] = useState<string>(); 
  const [resetAnnotationChart, setResetAnnotationChart] = useState(false);
  const [resetChart, setResetChart] = useState(false);
  const [resetVideoDetails, setResetVideoDetails] = useState(false);
  const [resetVideoPlay, setResetVideoPlay] = useState(false);
  const [saveAnnotation, setSaveAnnotation] = useState(false);
  const [skeletonLandmark, setSkeletonLandmark] = useState<string | null>(); // unsure about type on this one
  const [undo, setUndo] = useState(0); // any number? Or just certain ones? Seems like this would be boolean
  const [updateAnnotationChart, setUpdateAnnotationChart] = useState(false);
  const [uploader, setUploader] = useState<uploaderType>({}); // needs Type
  const [useEraser, setUseEraser] = useState(false);
  const [videoAdditionalFieldsConfig, setVideoAdditionalFieldsConfig] = useState({}); // needs Type
  const [videoData, setVideoData] = useState({}); // needs Type
  const [videoId, setVideoId] = useState<string>();
  const additionalDataRef = useRef({});
  const annotationRef = useRef({}); // needs Type
  const lastFrameNumForIntervalAnnoRef = useRef(-1);
  const lastFrameNumForIntervalErasingRef = useRef(-1);
  const realFpsRef = useRef(25);
  const videoMetaRef = useRef({}); // needs Type

  const states = {
    activeAnnoObj: activeAnnoObj,
    additionalData: additionalData,
    additionalDataNameToRetrieve: additionalDataNameToRetrieve,
    additionalDataRange: additionalDataRange,
    annoIdToDelete: annoIdToDelete,
    annoIdToDraw: annoIdToDraw,
    annoIdToShow: annoIdToShow,
    annotationChartRange: annotationChartRange,
    brushThickness: brushThickness,
    btnConfigData: btnConfigData,
    btnGroups: btnGroups,
    cancelIntervalAnno: cancelIntervalAnno,
    cancelIntervalErasing: cancelIntervalErasing,
    categoryColors: categoryColors,
    confirmConfig: confirmConfig,
    downloadAnnotation: downloadAnnotation,
    downloadConfig: downloadConfig,
    drawType: drawType,
    frameAnnotation: frameAnnotation,
    frameNum: frameNum,
    frameNumSignal: frameNumSignal,
    frameUrl: frameUrl,
    getAdditionalDataSignal: getAdditionalDataSignal,
    globalInfo: globalInfo,
    intervalAnno: intervalAnno,
    intervalErasing: intervalErasing,
    isFetchingFrame: isFetchingFrame,
    loadVideo: loadVideo,
    modalInfo: modalInfo,
    modalInfoOpen: modalInfoOpen,
    mutualExclusiveCategory: mutualExclusiveCategory,
    projectData: projectData,
    projectId: projectId,
    resetAnnotationChart: resetAnnotationChart,
    resetChart: resetChart,
    resetVideoDetails: resetVideoDetails,
    resetVideoPlay: resetVideoPlay,
    saveAnnotation: saveAnnotation,
    skeletonLandmark: skeletonLandmark,
    undo: undo,
    updateAnnotationChart: updateAnnotationChart,
    uploader: uploader,
    useEraser: useEraser,
    videoAdditionalFieldsConfig: videoAdditionalFieldsConfig,
    videoData: videoData,
    videoId: videoId,
    additionalDataRef: additionalDataRef, // Not a true state... does this matter?
    annotationRef: annotationRef, 
    lastFrameNumForIntervalAnnoRef: lastFrameNumForIntervalAnnoRef,
    lastFrameNumForIntervalErasingRef: lastFrameNumForIntervalErasingRef,
    realFpsRef: realFpsRef,
    videoMetaRef: videoMetaRef,
  }
      
  const stateSetters = {
    setActiveAnnoObj: setActiveAnnoObj,
    setAdditionalData: setAdditionalData,
    setAdditionalDataNameToRetrieve: setAdditionalDataNameToRetrieve,
    setAdditionalDataRange: setAdditionalDataRange,
    setAnnoIdToDelete: setAnnoIdToDelete,
    setAnnoIdToDraw: setAnnoIdToDraw,
    setAnnoIdToShow: setAnnoIdToShow,
    setAnnotationChartRange: setAnnotationChartRange,
    setBrushThickness: setBrushThickness,
    setBtnConfigData: setBtnConfigData,
    setBtnGroups: setBtnGroups,
    setCancelIntervalAnno: setCancelIntervalAnno,
    setCancelIntervalErasing: setCancelIntervalErasing,
    setCategoryColors: setCategoryColors,
    setConfirmConfig: setConfirmConfig,
    setDownloadAnnotation: setDownloadAnnotation,
    setDownloadConfig: setDownloadConfig,
    setDrawType: setDrawType,
    setFrameAnnotation: setFrameAnnotation,
    setFrameNum: setFrameNum,
    setFrameNumSignal: setFrameNumSignal,
    setFrameUrl: setFrameUrl,
    setGetAdditionalDataSignal: setGetAdditionalDataSignal,
    setGlobalInfo: setGlobalInfo,
    setIntervalAnno: setIntervalAnno,
    setIntervalErasing: setIntervalErasing,
    setIsFetchingFrame: setIsFetchingFrame,
    setLoadVideo: setLoadVideo,
    setModalInfo: setModalInfo,
    setModalInfoOpen: setModalInfoOpen,
    setMutualExclusiveCategory: setMutualExclusiveCategory,
    setProjectData: setProjectData,
    setProjectId: setProjectId,
    setResetAnnotationChart: setResetAnnotationChart,
    setResetChart: setResetChart,
    setResetVideoDetails: setResetVideoDetails,
    setResetVideoPlay: setResetVideoPlay,
    setSaveAnnotation: setSaveAnnotation,
    setSkeletonLandmark: setSkeletonLandmark,
    setUndo: setUndo,
    setUpdateAnnotationChart: setUpdateAnnotationChart,
    setUploader: setUploader,
    setUseEraser: setUseEraser,
    setVideoAdditionalFieldsConfig: setVideoAdditionalFieldsConfig,
    setVideoData: setVideoData,
    setVideoId: setVideoId,
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
                    if (rangeNeeded >= 0 && typeof frameNum === "number" && Number.isInteger(frameNum)) {
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

    // There's another useEffect for uploader inside AnnotationChart.  Should that be combined here?  Or not?  
    useEffect(() => {
        if (uploader?.type && uploader?.file) {
            saveAnnotationAndUpdateStates(true); 
            const reader = new FileReader();
            reader.onload = (e) => onReaderLoad(e, uploader.type);
            reader.readAsText(uploader.file.originFileObj);
        }
    }, [uploader])

    function onReaderLoad(e, type: string){
        
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

    // TODO: change into an onClick() for downloadAnnotation? (creates more work for library user, but fewer useEffects)
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

    async function downloadProjectAnnotation(projectId: string) {
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
        if (btnConfigData) {
            setBtnConfigData(btnConfigData);
        }
    }, [btnConfigData])

    useEffect(() => {
        saveAnnotationAndUpdateStates(true);
        setFrameNum(null);
        additionalDataRef.current = {};  
    }, [videoId])

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

        if (intervalAnno.on && typeof frameNum === 'number' && Number.isInteger(frameNum)) {
            lastFrameNumForIntervalAnnoRef.current = frameNum;
        }

        if (Object.values(intervalErasing).some(value=>value.on) && typeof frameNum === 'number' && Number.isInteger(frameNum)) {
            lastFrameNumForIntervalErasingRef.current = frameNum;
        }
            
    }, [frameNum])
    
    function saveAnnotationAndUpdateStates(cancelInterval=false) {
        
        setActiveAnnoObj(null);
        setDrawType(null);
        setSkeletonLandmark(null);
        setUndo(0);
        setUseEraser(false);
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
    }, [btnConfigData, frameNum, frameAnnotation, drawType, skeletonLandmark])

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
          <StatesContext.Provider value={states}>
            <StateSettersContext.Provider value={stateSetters}>
              {children}
            </StateSettersContext.Provider>
          </StatesContext.Provider>
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
    );
}

export function useStates() {
    const context = useContext(StatesContext);
    if (context === undefined) {
      throw new Error("useStates must be used within a StatesProvider");
    }
    return context;
}

export function useStateSetters() {
  const context = useContext(StateSettersContext);
  if (context === undefined) {
    throw new Error("useStateSetters must be used within a StateSettersProvider");
  }
  return context;
}



  

