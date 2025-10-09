import React, { useState, useEffect } from "react";
import { InboxOutlined } from "@ant-design/icons";
import { Modal, Upload, UploadFile } from "antd";
import { useStates, useStateSetters } from "./AppContext";
import { UploadChangeParam } from "antd/es/upload";
import { editProject, postProjectBtn, postProjectVideo, postProjectAnnotation } from '@/utils/requests';
import type { Annotation } from "@/types/annotations";

// Required props
interface JsonUploaderProps {
  type: string,
  setModalOpen: ((open: boolean)=>void) | null,
  onLoad?: (file: UploadFile) => void
}


/**
 *  props:
 *      type: required, 'annotation' or 'configuration'
 *      onLoad: called after the file is successfully loaded, with the file obj as argument. Will be called after inherent behavior.
 *      setModalOpen: only useful when put inside a modal window. setter of modalOpen.
 */
export default function JsonUploader({type, setModalOpen, onLoad}: JsonUploaderProps) {
  const [info, setInfo] = useState("Click or drag file to this area to upload");

  const annotationRef = useStates().annotationRef;
  const frameNum = useStates().frameNum;
  const projectId = useStates().projectId;
  const uploader = useStates().uploader;
  const videoId = useStates().videoId;
  const setBtnConfigData = useStateSetters().setButtonConfigData;
  const setGlobalInfo = useStateSetters().setGlobalInfo;
  const setModalInfo = useStateSetters().setModalInfo;
  const setModalInfoOpen = useStateSetters().setModalInfoOpen;
  const setProjectData = useStateSetters().setProjectData;
  const setProjectId = useStateSetters().setProjectId;
  const setResetAnnotationChart = useStateSetters().setResetAnnotationChart;
  const setUploader = useStateSetters().setUploader;
  const setVideoData = useStateSetters().setVideoData;

  const { Dragger } = Upload;

  // This should just be a check: "if type != a or b, throw error" inside the uploadFile() function below
  useEffect(() => {
    if (
      !type ||
      (type !== "annotation" && type !== "configuration")
    ) {
      throw Error(
        "Type property is required, either annotation or configuration",
      );
    }
  }, [type]);
  

  function changeHandler(e: UploadChangeParam) {
    if (e.file.status === "done") {
      uploadFile(e.file);
      console.log("this is e: ", e);
    } else if (e.file.status === "error") {
      setInfo(`${e.file.name} file upload failed.`);
    }
  }

  function uploadFile(file: UploadFile) {
    if (setModalOpen) {
      setModalOpen(false);
    }
    setUploader({
      type,
      file: file,
    });

    if (onLoad) {
      onLoad(file);
    }
  }

  useEffect(() => {
    if (uploader?.type && uploader?.file?.originFileObj) {
        saveAnnotationAndUpdateStates(true); 
        const reader = new FileReader();
        reader.onload = (e) => onReaderLoad(e, uploader.type);
        reader.readAsText(uploader.file.originFileObj);
    }
  }, [uploader])
  
  function onReaderLoad(e: ProgressEvent<FileReader>, type: string){
    if (e.target && e.target.result){
      if (typeof e.target.result === 'string'){
        const obj = JSON.parse(e.target.result);  // need better type on this object for use in typing other things below
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

  return (
    <div style={{ width: "100%" }}>
      <Dragger
        id="jsonFile"
        name="jsonFile"
        //type="file"
        accept="json"
        showUploadList={false}
        beforeUpload={() => {
          setInfo("Click or drag file to this area to upload");
        }}
        onChange={changeHandler}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">{info}</p>
        {}
      </Dragger>
    </div>
  );
}
