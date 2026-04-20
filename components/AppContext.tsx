import { createContext, Dispatch, JSX, useContext, useState, useRef, useEffect, SetStateAction } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import styles from '../styles/Workspace.module.css';
import { getAdditionalData, postVideoAnnotation, getProjectAnnotation } from '@/utils/requests';
import { clearUnfinishedAnnotation } from '@/utils/utils';
import { UploadFileType } from '@/types/misc';
import BtnGroup from './BtnGroup';
import BrushTool from './BrushTool';
import { Modal } from 'antd';
import type { Annotation } from '@/types/annotations';

interface AppContextType {
    // States
    activeAnnoObj: ActiveAnnoObjType | undefined, 
    additionalData: {}, // AdditionalDataChart not working; can't determine type for this until it works
    additionalDataNameToRetrieve: string[],  // AdditionalDataChart not working; can't determine type for this until it works
    additionalDataRange: {}, // AdditionalDataChart not working; can't determine type for this until it works
    annoIdToDelete: string | undefined,
    annoIdToDraw: string | undefined,
    annoIdToShow: string[] | undefined,
    annotationChartRange: number | undefined,
    brushThickness: number | undefined,
    btnConfigData: BtnConfigDataType,
    btnGroups: JSX.Element[],
    cancelIntervalAnno: boolean,
    cancelIntervalErasing: boolean,
    categoryColors: ColorsType,
    confirmConfig: boolean,
    downloadAnnotation: boolean,
    downloadConfig: boolean,
    drawType: string | null | undefined,
    frameAnnotation: FrameAnnotation | undefined,
    frameNum: number | undefined,
    frameNumSignal: number | undefined,
    frameUrl: string | undefined,
    getAdditionalDataSignal: boolean,
    globalInfo: string | null | undefined, 
    intervalAnno: IntervalAnno | null | undefined, // actual type provided; see below
    intervalErasing: {},
    isFetchingFrame: boolean,
    loadVideo: boolean,
    modalInfo: string | null | undefined,
    modalInfoOpen: boolean,
    mutualExclusiveCategory: string[][] | undefined,
    projectData: {},
    projectId: string | undefined,
    resetAnnotationChart: boolean,
    resetChart: boolean,
    resetVideoDetails: boolean,
    resetVideoPlay: boolean,
    saveAnnotation: boolean,
    skeletonLandmark: string | null | undefined,
    undo: number,
    updateAnnotationChart: boolean,
    uploaderFile: UploadFileType | undefined, // for Projects and Annotations
    useEraser: boolean,
    videoAdditionalFieldsConfig: {},
    videoData: {},
    videoId: string | undefined,
    annotationRef: React.RefObject<AnnoRefType | null>, //Record<number, Record<string, Annotation>>
    lastFrameNumForIntervalAnnoRef: React.RefObject<number | undefined>,
    lastFrameNumForIntervalErasingRef: React.RefObject<number | undefined>,
    realFpsRef: React.RefObject<number | undefined>,
    videoMetaRef: React.RefObject<VideoMetaRefType | undefined>,

    // Setters
    setActiveAnnoObj: Dispatch<SetStateAction<ActiveAnnoObjType | undefined>>, 
    setAdditionalData: Dispatch<SetStateAction<{}>>, // AdditionalDataChart not working; can't determine type for this until it works
    setAdditionalDataNameToRetrieve: Dispatch<SetStateAction<string[]>>,  // AdditionalDataChart not working; can't determine type for this until it works
    setAdditionalDataRange: Dispatch<SetStateAction<{}>>, // AdditionalDataChart not working; can't determine type for this until it works
    setAnnoIdToDelete: Dispatch<SetStateAction<string | undefined> >,
    setAnnoIdToDraw: Dispatch<SetStateAction<string | undefined>>,
    setAnnoIdToShow: Dispatch<SetStateAction<string[]>>,
    setAnnotationChartRange: Dispatch<SetStateAction<number | undefined>>,
    setBrushThickness: Dispatch<SetStateAction<number | undefined>>,
    setBtnConfigData: Dispatch<SetStateAction<BtnConfigDataType>>,
    setBtnGroups: Dispatch<SetStateAction<JSX.Element[]>>,
    setCancelIntervalAnno: Dispatch<SetStateAction<boolean>>,
    setCancelIntervalErasing: Dispatch<SetStateAction<boolean>>,
    setCategoryColors: Dispatch<SetStateAction<ColorsType>>,
    setConfirmConfig: Dispatch<SetStateAction<boolean>>,
    setDownloadAnnotation: Dispatch<SetStateAction<boolean>>,
    setDownloadConfig: Dispatch<SetStateAction<boolean>>,
    setDrawType: Dispatch<SetStateAction<string | null | undefined>>,
    setFrameAnnotation: Dispatch<SetStateAction<FrameAnnotation | undefined>>,
    setFrameNum: Dispatch<SetStateAction<number | undefined>>,
    setFrameNumSignal: Dispatch<SetStateAction<number | undefined>>,
    setFrameUrl: Dispatch<SetStateAction<string | undefined>>,
    setGetAdditionalDataSignal: Dispatch<SetStateAction<boolean>>,
    setGlobalInfo: Dispatch<SetStateAction<string | null | undefined>>,
    setIntervalAnno: Dispatch<SetStateAction<IntervalAnno>>, // actual type provided; see below
    setIntervalErasing: Dispatch<SetStateAction<{}>>,
    setIsFetchingFrame: Dispatch<SetStateAction<boolean>>,
    setLoadVideo: Dispatch<SetStateAction<boolean>>,
    setModalInfo: Dispatch<SetStateAction<string | null | undefined>>,
    setModalInfoOpen: Dispatch<SetStateAction<boolean>>,
    setMutualExclusiveCategory: Dispatch<SetStateAction<string[][]>>,
    setProjectData: Dispatch<SetStateAction<{}>>,
    setProjectId: Dispatch<SetStateAction<string | undefined>>,
    setResetAnnotationChart: Dispatch<SetStateAction<boolean>>,
    setResetChart: Dispatch<SetStateAction<boolean>>,
    setResetVideoDetails: Dispatch<SetStateAction<boolean>>,
    setResetVideoPlay: Dispatch<SetStateAction<boolean>>,
    setSaveAnnotation: Dispatch<SetStateAction<boolean>>,
    setSkeletonLandmark: Dispatch<SetStateAction<string | null | undefined>>,
    setUndo: Dispatch<SetStateAction<number>>,
    setUpdateAnnotationChart: Dispatch<SetStateAction<boolean>>,
    setUploaderFile: Dispatch<SetStateAction<UploadFileType | undefined>>, // for Projects and Annotations
    setUseEraser: Dispatch<SetStateAction<boolean>>,
    setVideoAdditionalFieldsConfig: Dispatch<SetStateAction<{}>>,
    setVideoData: Dispatch<SetStateAction<{}>>,
    setVideoId: Dispatch<SetStateAction<string | undefined>>,
}

type AdditionalDataRefType = Record<string, AdditionalData[]>;

type AdditionalData = {

}

type ActiveAnnoObjType = {
  color?: string,
  data?: number[][],
  groupIndex?: string,
  frameNum: number,
  id: string,
  label: string,
  type: string,
  videoId: string
}

type AnnoRefType = {
  [frameNum: number]: {
    [id: string]: Annotation
  }
}

type FrameAnnotation = {
    [id: string]: Annotation;
}

type BtnChildData = {
  [key: number]: IndividualBtnType
}

type IndividualBtnType = {
  btnType: string,
  color: string,
  index: number,
  label: string
}

type IntervalAnno = {
    on: boolean, 
    startFrame: number | null, 
    videoId: string | null, 
    label: string | null, 
    color: string | null, 
    annotatedFrames: Set<string>
}

type BtnsType = {
  btnNum: number,
  btnType: string,
  groupType: string,
  groupIndex?: string,
  projectId: string
  childData: BtnChildData
}

type BtnConfigDataType = {
  [key: string]: BtnsType
}

/*
type BtnGroupType = {
  data: BtnGroupDataType;
  frameNum: number;
  frameUrl: string;
  addAnnotationObj: (obj: Annotation) => void;
  setActiveAnnoObj: (obj: Annotation | null) => void;
  drawType: string; // or union type
  setDrawType: (type: string) => void;
  skeletonLandmark: string | number | null;
  setSkeletonLandmark: (val: string | number | null) => void;
  frameAnnotation: Annotation | null; // Is there a difference between Annotation (eg, 1 anno) and frameAnnotation (all annos on a frame??)
}

type BtnGroupDataType = {

}
*/

type ColorsType = {
  [key: string]: string
}

type VideoMetaRefType = {
  fps: number,
  totalFrameCount: number,
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Which of the states need to be accessible to the user-developer?
export function AppProvider({children}: {children: React.ReactNode}){
  const [activeAnnoObj, setActiveAnnoObj] = useState<ActiveAnnoObjType | undefined>(); 
  const [additionalData, setAdditionalData] = useState({}); // needs Type
  const [additionalDataNameToRetrieve, setAdditionalDataNameToRetrieve] = useState<string[]>([]); // needs better type
  const [additionalDataRange, setAdditionalDataRange] = useState({}); // needs Type
  const [annoIdToDelete, setAnnoIdToDelete] = useState<string | undefined>();
  const [annoIdToDraw, setAnnoIdToDraw] = useState<string | undefined>();
  const [annoIdToShow, setAnnoIdToShow] = useState<string[]>([]);
  const [annotationChartRange, setAnnotationChartRange] = useState<number | undefined>();
  const [brushThickness, setBrushThickness] = useState<number | undefined>();
  const [btnConfigData, setBtnConfigData] = useState<BtnConfigDataType>({});
  const [btnGroups, setBtnGroups] = useState<JSX.Element[]>([]); // needs Type
  const [cancelIntervalAnno, setCancelIntervalAnno] = useState(false);
  const [cancelIntervalErasing, setCancelIntervalErasing] = useState(false);
  const [categoryColors, setCategoryColors] = useState<ColorsType>({}); // needs Type
  const [confirmConfig, setConfirmConfig] = useState(false);
  const [downloadAnnotation, setDownloadAnnotation] = useState(false);
  const [downloadConfig, setDownloadConfig] = useState(false);
  const [drawType, setDrawType] = useState<string | null | undefined>();
  const [frameAnnotation, setFrameAnnotation] = useState<FrameAnnotation>(); // should this be frameAnnotations (plural)?
  const [frameNum, setFrameNum] = useState<number>();
  const [frameNumSignal, setFrameNumSignal] = useState<number>(); 
  const [frameUrl, setFrameUrl] = useState<string>();
  const [getAdditionalDataSignal, setGetAdditionalDataSignal] = useState(false);
  const [globalInfo, setGlobalInfo] = useState<string | null | undefined>();
  const [intervalAnno, setIntervalAnno] = useState<IntervalAnno>({on: false, startFrame: null, videoId:null, label: null, color: null, annotatedFrames: new Set()});
  const [intervalErasing, setIntervalErasing] = useState({}); // needs Type
  const [isFetchingFrame, setIsFetchingFrame] = useState(false);
  const [loadVideo, setLoadVideo] = useState(false);
  const [modalInfo, setModalInfo] = useState<string | null | undefined>();
  const [modalInfoOpen, setModalInfoOpen] = useState(false);
  const [mutualExclusiveCategory, setMutualExclusiveCategory] = useState<string[][]>([]);
  const [projectData, setProjectData] = useState({}); // needs Type
  const [projectId, setProjectId] = useState<string>(); 
  const [resetAnnotationChart, setResetAnnotationChart] = useState(false);
  const [resetChart, setResetChart] = useState(false);
  const [resetVideoDetails, setResetVideoDetails] = useState(false);
  const [resetVideoPlay, setResetVideoPlay] = useState(false);
  const [saveAnnotation, setSaveAnnotation] = useState(false);
  const [skeletonLandmark, setSkeletonLandmark] = useState<string | null | undefined>(); // unsure about type on this one
  const [undo, setUndo] = useState(0); // any number? Or just certain ones? Seems like this would be boolean
  const [updateAnnotationChart, setUpdateAnnotationChart] = useState(false);
  const [uploaderFile, setUploaderFile] = useState<UploadFileType>(); 
  const [useEraser, setUseEraser] = useState(false);
  const [videoAdditionalFieldsConfig, setVideoAdditionalFieldsConfig] = useState({}); // needs Type
  const [videoData, setVideoData] = useState({}); // needs Type
  const [videoId, setVideoId] = useState<string>();
  const additionalDataRef = useRef({});
  const annotationRef = useRef<AnnoRefType | null>({}); // needs Type
  const lastFrameNumForIntervalAnnoRef = useRef(-1);
  const lastFrameNumForIntervalErasingRef = useRef(-1);
  const realFpsRef = useRef(25);
  const videoMetaRef = useRef<VideoMetaRefType>( {fps: 0, totalFrameCount: 0}); // needs Type


  const contextValue: AppContextType ={
    // States
    activeAnnoObj,
    additionalData,
    additionalDataNameToRetrieve,
    additionalDataRange,
    annoIdToDelete,
    annoIdToDraw,
    annoIdToShow,
    annotationChartRange,
    brushThickness,
    btnConfigData,
    btnGroups,
    cancelIntervalAnno,
    cancelIntervalErasing,
    categoryColors,
    confirmConfig,
    downloadAnnotation,
    downloadConfig,
    drawType,
    frameAnnotation,
    frameNum,
    frameNumSignal,
    frameUrl,
    getAdditionalDataSignal,
    globalInfo,
    intervalAnno,
    intervalErasing,
    isFetchingFrame,
    loadVideo, 
    modalInfo,
    modalInfoOpen,
    mutualExclusiveCategory,
    projectData,
    projectId,
    resetAnnotationChart,
    resetChart,
    resetVideoDetails,
    resetVideoPlay,
    saveAnnotation,
    skeletonLandmark,
    undo,
    updateAnnotationChart,
    uploaderFile,
    useEraser,
    videoAdditionalFieldsConfig,
    videoData,
    videoId,
    additionalDataRef, // Not a true state... does this matter?
    annotationRef, 
    lastFrameNumForIntervalAnnoRef,
    lastFrameNumForIntervalErasingRef,
    realFpsRef,
    videoMetaRef,
 
    // Setters
    setActiveAnnoObj,
    setAdditionalData,
    setAdditionalDataNameToRetrieve,
    setAdditionalDataRange,
    setAnnoIdToDelete,
    setAnnoIdToDraw,
    setAnnoIdToShow,
    setAnnotationChartRange,
    setBrushThickness,
    setBtnConfigData,
    setBtnGroups,
    setCancelIntervalAnno,
    setCancelIntervalErasing,
    setCategoryColors,
    setConfirmConfig,
    setDownloadAnnotation,
    setDownloadConfig,
    setDrawType,
    setFrameAnnotation,
    setFrameNum,
    setFrameNumSignal,
    setFrameUrl,
    setGetAdditionalDataSignal,
    setGlobalInfo,
    setIntervalAnno,
    setIntervalErasing,
    setIsFetchingFrame,
    setLoadVideo,
    setModalInfo,
    setModalInfoOpen,
    setMutualExclusiveCategory,
    setProjectData,
    setProjectId,
    setResetAnnotationChart,
    setResetChart,
    setResetVideoDetails,
    setResetVideoPlay,
    setSaveAnnotation,
    setSkeletonLandmark,
    setUndo,
    setUpdateAnnotationChart,
    setUploaderFile,
    setUseEraser,
    setVideoAdditionalFieldsConfig,
    setVideoData,
    setVideoId,
    saveAnnotationAndUpdateStates, // if there are more of these non-setter functions, create an ActionsContext and move them to it
  }

  useEffect(() => {
    setResetVideoPlay(true);
    setResetVideoDetails(true);
    setResetChart(true);
    setAdditionalDataNameToRetrieve([]);
    annotationRef.current = null;
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


    function saveAnnotationAndUpdateStates(cancelInterval=false) {
      setActiveAnnoObj({});
      setDrawType(null);
      setSkeletonLandmark(null);
      setUndo(0);
      setUseEraser(false);
      setAnnoIdToDelete(null);
      saveFrameAnnotation(cancelInterval);
}
    function getAdditionalDataFromRef() {
        setGlobalInfo(null);
        if (Number.isInteger(frameNum)) { 
            let additionalDataForChart={};
            if (additionalDataNameToRetrieve?.length>0) {
                additionalDataNameToRetrieve.map(name => {
                    const rangeNeeded = additionalDataRange[name];
                    if (rangeNeeded >= 0 && typeof frameNum === "number" && Number.isInteger(frameNum) && videoMetaRef.current!= null) {
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
                    //const annotations = Object.values(annotationRef.current).map(frameAnno => Object.values(frameAnno))
                    const annotations = Object.values(annotationRef.current ?? {}).map(frameAnno =>Object.values(frameAnno));
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
                    const annotations = Object.values(annotationRef.current ?? {}).map(frameAnno => Object.values(frameAnno))
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
        setFrameNum(0);
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


    function saveFrameAnnotation(cancelInterval=false, savePrevFrame=true) {
            if (!Number.isInteger(frameNum) || frameNum === 0) return;

            const newFrameAnno: FrameAnnotation = clearUnfinishedAnnotation({...frameAnnotation});
            if (cancelInterval && intervalAnno.on) {

                    setCancelIntervalAnno(true);
            }

            if (Object.keys(newFrameAnno).length > 0) {
                const firstAnno = Object.values(newFrameAnno)[0];
                if (savePrevFrame && frameNum && firstAnno.frameNum === frameNum-1) {
                    annotationRef.current[frameNum-1] = newFrameAnno; 
                } else if (!savePrevFrame && firstAnno.frameNum === frameNum) {
                    annotationRef.current[frameNum] = newFrameAnno; 
                }
            } 
          
    }

    // seems unnecessary... why not just use the one line?
    function addAnnotationObj(idObj) {
        setFrameAnnotation({...frameAnnotation, [idObj.id]: idObj});
    }

    type IntervalErasingItem = {
        on: boolean,
        startFrame: number | null,
        videoId: number | null,

    }

    useEffect(() => {
        const btnConfigCopy = {...btnConfigData};
        const colors = {};
        const intervalErasingData: {[key: string]: IntervalErasingItem} = {};
        const mutualExclusiveCategoryArr: string[][] = []; // assumes that a frame cannot have 'chase' and 'follow' at the same time
        // this is because annotation is by FRAME, not by animal.
        Object.entries(btnConfigCopy).forEach(([id, groupData]) => {
            if (groupData?.edgeData && groupData.edgeData.edges.length) {
                const edgesArr = groupData.edgeData.edges.map(neighborSet => neighborSet?[...neighborSet]:null);
                groupData.edgeData.edges = edgesArr;
            }
            
            if (groupData.groupType === 'category') {
                const mutualExclusive: string[]  = [];
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
    }, [btnConfigData, frameNum, frameAnnotation, drawType, skeletonLandmark]) // do you need to re-render BtnGroup each frame change?

    function renderBtnGroup() {
        const groupIndices = Object.keys(btnConfigData).sort((a, b) => Number(a)-Number(b));
        const groups: JSX.Element[] = []; 
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
                addAnnotationObj={addAnnotationObj}
                data={data}
                drawType={drawType}
                frameAnnotation={data.groupType==='skeleton' ? frameAnnotation : null}
                frameNum={frameNum}
                frameUrl={frameUrl}
                setActiveAnnoObj={setActiveAnnoObj}
                setDrawType={setDrawType}
                skeletonLandmark={skeletonLandmark}
                setSkeletonLandmark={setSkeletonLandmark}
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
          <AppContext.Provider value={contextValue}>
            {children}
          </AppContext.Provider>
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

export function useApp() {
    const context = useContext(AppContext);
    if (context==undefined){
        throw new Error ("useApp must be used within an AppProvider");
    }
    return context;
}

/*
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
  */



  
