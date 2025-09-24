import { createContext, useContext, useState, useRef } from 'react';

const StatesContext = createContext(undefined);
const StateSettersContext = createContext(undefined);

interface AppContextProps {
  children: React.ReactNode,
}

export default function StatesProvider({children}: AppContextProps) {

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
  
    return (
      <StatesContext.Provider value={states}>
        <StateSettersContext.Provider value={stateSetters}>
          {children}
        </StateSettersContext.Provider>
      </StatesContext.Provider>
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



  

