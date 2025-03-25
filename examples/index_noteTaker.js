import React, {useEffect, useState} from 'react';
import Head from 'next/head';
import Workspace from '../components/Workspace.js';
import Canvas from '../components/Canvas.js';
import VideoUploader from '../components/VideoUploader.js';
import BtnContainer from '../components/BtnContainer.js';
import DownloadBtn from '../components/DownloadBtn.js';
import ProjectManager from '../components/ProjectManager.js';
import ModalJsonUploader from '../components/ModalJsonUploader.js';
import VideoManager from '../components/VideoManager.js';
import CanvasAdditionalDataController from '../components/CanvasAdditionalDataController.js';
import DropdownMenu from '../components/DropdownMenu.js';
import ProjectList from '../components/ProjectList.js';
import SaveAnnotationBtn from '../components/SaveAnnotationBtn.js';
import InfoBar from '../components/InfoBar.js';
import {Row, Col} from 'react-bootstrap'; // Third party components. Refer to the tutorial on https://react-bootstrap.netlify.app/docs/layout/grid
import { Menu, Modal, Form, Input, Button, Table } from 'antd'; // Third party components. Refer to the tutorial on https://ant.design/components/menu, and https://ant.design/components/modal
import AnnotationUploader from '../components/AnnotationUploader.js';
import AnnotationDownloader from '../components/AnnotationDownloader.js';

// Client side components. They cannot be rendered on the server side, thus need to be explicitly marked as client side comp.
import dynamic from 'next/dynamic';

//const AdditionalDataChart = dynamic(() => import('../components/AdditionalDataChart.js'), { ssr: false });
//const AnnotationChart = dynamic(() => import('../components/AnnotationChart.js'), { ssr: false });

export default function Home() {
  // The ..open/set..Open states are to allow the child modal components to control the visibility of themselves when some interval UI events happen, such as clicking on cancel button.
  const [newProjectManagerOpen, setNewProjectManagerOpen] = useState(false);
  const [editProjectManagerOpen, setEditProjectManagerOpen] = useState(false);
  const [configUploaderOpen, setConfigUploaderOpen] = useState(false);
  const [projectListOpen, setProjectListOpen] = useState(false);
  const [videoManagerOpen, setVideoManagerOpen] = useState(false);
  const [canvasAdditionalDataControllerOpen, setCanvasAdditionalDataControllerOpen] = useState(false);
  const [info, setInfo] = useState(''); // To display feedback info
  
  const [form] = Form.useForm();
  const [frameNumber, setFrameNumber] = useState('');
  const [notes, setNotes] = useState([]);  // was ({})
  //let annotations = {};  // Still don't completely understand why this version doesn't work
  const [annotationUploadOpen, setAnnotationUploadOpen] = useState(false);
  const [annotationDownloadOpen, setAnnotationDownloadOpen] = useState(false);
  const [fileName, setFileName] = useState('annotations');

  //Keyboard shortcuts
  const handleShiftRight = (event) => {
    if (event.shiftKey && event.key=="ArrowRight"){

    }
  }
  useEffect(()=>{}

  )



  const projectDropdownItems = [
    {
      label: 'Exisiting Projects',
      compName: 'ProjectList', // When pass a component, it is required to have a compName prop whose value should be equivalent to the name of the component, e.g. <ProjectList>'s compName is 'ProjectList'.
      component: <ProjectList 
                  key='0' // When pass a component to a child, it is required to have a unique key prop.
                  open={projectListOpen}
                  setOpen={setProjectListOpen}
                />,
      // preventDefault: true, // when use some built-in components as the children of DropdownMenu, there may be some pre-defined behaviors, such as opening a modal window. To prevent the default behavior, set this to true.
    },
    {
      label: 'New Project',
      compName: 'ProjectManager',
      component: <ProjectManager 
                  key='1'
                  status='new' // ProjectManager has two status: 'new' and 'edit'. 'new' mode is for creating a new project, and 'edit' mode is for editing an existing project.
                  open={newProjectManagerOpen} 
                  setOpen={setNewProjectManagerOpen}
                  defaultGroupType='skeleton'
                  defaultBtnType='skeleton'
                  disableGroupTypeSelect
                  disableBtnTypeSelect
                  hidePlusBtn
                  // Need a way to make there be no buttons whatsoever associated with the project
                />,
    },
    {
      label: 'Upload Project',
      compName: 'ModalJsonUploader',
      component: <ModalJsonUploader 
                  key='2'
                  type='configuration' // ModalJsonUploader has two types: 'configuration' and 'annotation'. 'configuration' is for uploading a configuration file, and 'annotation' is for uploading an annotation file.
                  open={configUploaderOpen} 
                  setOpen={setConfigUploaderOpen}
                />, 
    },
    {
      label: 'Edit Project',
      compName: 'ProjectManager',
      component: <ProjectManager
                  key='3' 
                  status='edit' 
                  open={editProjectManagerOpen} 
                  setOpen={setEditProjectManagerOpen}
                  // defaultGroupType='category'
                  // defaultBtnType='category'
                  // disableGroupTypeSelect
                  // disableBtnTypeSelect
                  // hidePlusBtn
                />, 
    },
    {
      label: 'Download Configuration',
      compName: 'DownloadBtn',
      component: <DownloadBtn 
                  key='4'
                  type='configuration'  // DownloadBtn has two types: 'configuration' and 'annotation'. 'configuration' is for saving the configuration data, and 'annotation' is for saving the annotation data.
                  mode='inMenu' // DownloadBtn has two modes: 'inMenu' and 'solely'. 'inMenu' is used when the DownloadBtn is used in a dropdown menu, and 'solely' is used when the DownloadBtn is used as a standalone button. This prop affects the UI of the DownloadBtn.
                />,
    },
  ];
  
  function projectDropdownClickHandler(e) {
  }

  const projectDropdown = <DropdownMenu name='Project' menu={projectDropdownItems} onClick={projectDropdownClickHandler}/>;

  const videoDropdownItems = [
    {
      label: 'Video Manager',
      compName: 'VideoManager',
      component: <Modal  // Modal = popup box, imported from AntDesign
                  key='0'  
                  title='Video Manager'
                  open={videoManagerOpen}
                  setOpen={setVideoManagerOpen}
                  onCancel={() => setVideoManagerOpen(false)}
                  style={{overflowX: 'auto'}}
                  footer={null}
                >
                  <VideoManager 
                    setModalOpen={setVideoManagerOpen} // To allow the child to contorl the visibility of the modal window, e.g. when the user clicks the 'load' or 'add and load' button.
                    /**
                     * name: str, // required and unique, used as var name, no white space allowed.
                     * label: str, // required, label shown to the user, allow white space
                     * required: boolean, // false by default
                     * loadIn: 'canvas'/'chart'/null, // whether to draw the data on canvas/chart with each frame. If yes, will fetch the data from backend and ask canvas/chart to draw it
                     * onLoad: event handler. Can be used to draw shapes on canvas and so on. required when loadin='canvas' 
                     */
                    /*
                    additionalFields={[
                      {name: 'canvas1', label: 'canvas1', required: true, loadIn: 'canvas', onLoad: drawDataAsCircle}, 
                      {name: 'canvas2', label: 'canvas2', required: true, loadIn: 'canvas', onLoad: drawDataAsLine},
                      {name: 'chart1', label: 'chart1', required: true, loadIn: 'chart'}, 
                      {name: 'chart2', label: 'chart2', required: true, loadIn: 'chart'}
                    ]}
                      */
                  />
                </Modal>,
    },
    {
      label: 'Additional Data For Canvas',
      compName: 'CanvasAdditionalDataController',
      component: <Modal
                  key='1'
                  title='Canvas Additional Data Controller'
                  open={canvasAdditionalDataControllerOpen}
                  setOpen={setCanvasAdditionalDataControllerOpen}
                  onCancel={() => setCanvasAdditionalDataControllerOpen(false)}
                  style={{overflowX: 'auto'}}
                  footer={null}
                >
                    <CanvasAdditionalDataController 
                      // hideRange  //Hide the range input.
                      // halfRange={2} //Allow developer to set half range value when hideRange is true. Required and only useful when hideRange is true.
                      defaultHalfRange={1} // Default value for half range input. Should only be used when hideRange is false.
                    />
                </Modal>,
    },
  ];


  function videoDropdownClickHandler(e) {
    // TODO: customize click handler
  }

  const videoDropdown = <DropdownMenu name='Video' menu={videoDropdownItems} onClick={videoDropdownClickHandler}/>


  const menubarItems = [
    {
      label: projectDropdown,
      key: '0',
    },
    {
      label: videoDropdown,
      key: '1',
    },
  ]

  function onDownloadBtnClick() { //What if there's no project or video loaded?  
    setAnnotationDownloadOpen(true);
  } 

  useEffect(()=>{
    if (annotationDownloadOpen) {  
      setFileName("videoname");
    }
  }, [annotationDownloadOpen]);

 
  const ModalAnnotationDownloader = 
    <Modal 
      title={'Download notes'}
      footer={() => null}
      open={annotationDownloadOpen}
      setOpen={setAnnotationDownloadOpen}
      onCancel={() => setAnnotationDownloadOpen(false)}
      >
      <div className='my-4 d-flex justify-content-center'>
      <div style={{width: '100%'}}>
        Please name your file:
        <Input defaultValue='videoname' onChange={(e)=>setFileName(e.target.value)} value={fileName} addonAfter='.json' onPressEnter={onSaveBtnClick} />
        <Button onClick={onSaveBtnClick}>Save</Button>
      </div>
      </div>
    </Modal>


  // Changes to make:
  // 1. Save onEnter --> Done
  // 2a. Name: User-designated name for document --> Done
  // 2b. Name: Defaults to anything (precurser to 2c) --> Done
  // 2c. Name: Defaults to video name --> NOT DONE.  Need open API for fetching video data.
  // 3. Save only when a video is loaded --> NOT DONE.  Need open API for fetching video data
  // 4. Save annotations to the database --> not started
  function onSaveBtnClick(){
    const finalFileName = fileName;
    console.log('filename: ', fileName)
    setAnnotationDownloadOpen(false);
    const jsonAnno = JSON.stringify(notes);  
    const blobAnno = new Blob([jsonAnno], {type: 'text/plain'});  
    const a = document.createElement("a");  
    a.href = URL.createObjectURL(blobAnno);  
    console.log("AnnotationName:", fileName);
    a.download = finalFileName + '.json';
    a.click();
    URL.revokeObjectURL(a.href);
  }
  
  // Input is also used inModalAnnoutationDownloader (line 220)
  // Would it be better to say "const { downloadInput } = Input;" so these 2 are not confused?
  // --> apparently not necessary.  See antDesign's example "with clear icon".
  const { TextArea } = Input;


  function onAddBtnClick() {
    console.log("Data source format is: ", dataSource);
    const note = form.getFieldValue("notes");
    setNotes(prevNotes => ({...prevNotes, [frameNumber]:note})); 
    // TODO: add a line that also modifies the NotesTable --> seems to do this on its own
  }

  //frameChangeHandler
  // on frame change, this will update the text box with the correct annotation
  function frameChangeHandler(props) {
    const frameNumber = props.frameNum; // This is a safe way to give the developer the frameNum value.
    setFrameNumber(frameNumber);
    const note = notes[frameNumber]; // --> TODO: add annotations as a dictionary
    form.setFieldsValue({
      notes: notes[frameNumber]? notes[frameNumber]:"", //Enter notes here
  });
  }

  function onUploadBtnClick(){
    setAnnotationUploadOpen(true);
  }


  const ModalAnnotationUploader =
    <Modal 
      title={'Upload notes'}
      footer={() => null}
      open={annotationUploadOpen}
      setOpen={setAnnotationUploadOpen}
      onCancel={() => setAnnotationUploadOpen(false)}
      >
      <div className='my-4 d-flex justify-content-center'>
      <div style={{width: '100%'}}>
      <AnnotationUploader 
        setModalOpen={setAnnotationUploadOpen}
        setNotes={setNotes}/>
      </div>
      </div>
    </Modal>


  // Notes table
  const dataSource = Object.entries(notes).map(([key, note]) => ({
    key: parseInt(key), 
    frameNumber: parseInt(key, 10)+1,
    note
  }));

  // TODO: <a> is a hyperlink which should allow me to call a function for jumping to that particular frame
  // TODO: "note" needs to be an abbreviated form of note... like, first 10 characters + "..."
  const columns = [
    {
      title: "Frame",
      dataIndex: "frameNumber",
      key: "frameNumber",
      render: (text) => <a>{text}</a> // need to link this to the given frame
    },
    {
      title: "Note",
      dataIndex: "note",
      key: "note",
      render: (text) => <a>{text}</a>
    }
  ]  
  

  return (
    <div>
      <Head>
        <title>Annotator</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Workspace > 
        <Menu items={menubarItems} mode="horizontal"/>
        <div className='py-2'>
          <InfoBar info={info} /> 
        </div>
        
        <Row >
          <Canvas height={450} width={1500}/>
          <VideoUploader 
            width={500}
            hideSubmit 
            onFrameChange={frameChangeHandler}
            />
          <Col style={{width: '80%'}}>
          <Form className='my-2 mx-3' form={form} size='small'>
              <Form.Item
                  name="notes" 
              >
                  <TextArea placeholder="Enter notes here:" onPressEnter={onAddBtnClick} rows={10} style={{width: '100%'}} />
              </Form.Item>
              <Form.Item>
                  {/*<Button className='my-2 mx-2' onClick={onAddBtnClick}>Save Note</Button>*/}
                  <Button className='my-2 mx-2' onClick={onDownloadBtnClick}>Download Notes</Button>
                  <Button className='my-2 mx-2' onClick={onUploadBtnClick}>Upload Notes</Button>
                  {ModalAnnotationUploader}
                  {ModalAnnotationDownloader}
              </Form.Item>
            </Form>
            </Col>
            <Col style={{width: '20%'}}>
              <Table dataSource={dataSource} columns={columns}>Notes Table</Table>
            </Col>
        </Row>
      </Workspace>
    </div>
  )
}

