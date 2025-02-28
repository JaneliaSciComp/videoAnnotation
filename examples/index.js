import React, {useState} from 'react';
import Head from 'next/head';
import Workspace from '../components/Workspace.js';
import Canvas from '../components/Canvas.js';
import VideoUploader from '../components/VideoUploader.js';
import BtnContainer from '../components/BtnContainer.js';
//import AnnotationTable from '../components/AnnotationTable.js';
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
import { Menu, Modal, Form, Input, Button } from 'antd'; // Third party components. Refer to the tutorial on https://ant.design/components/menu, and https://ant.design/components/modal
import { drawCircle, drawLine } from '../utils/canvasUtils.js'; // canvasUtils.js is a wrapper of fabric.js. It provides functions to operate on canvas easily. Currently, only these two functions are provided.
//import BtnGroupController from '../components/BtnGroupController.js';
//import Snapshot from '../components/Snapshot.js';
//import styles from '../styles/Canvas.module.css';
//import TargetsTable from '../components/TargetsTable.js';
//import LabeledFrames from '../components/LabeledFrames.js';
//import BtnGroup from '../components/BtnGroup.js';
//import PopupMessage from '@/components/PopupMessage.js';
import SnapshotSimple from '@/components/SnapshotSimple.js';
import SnapshotUploader from '@/components/SnapshotUploader.js';
import NoteTakerBox from '@/components/NoteTakerBox.js';
import AnnotationUploader from '../components/AnnotationUploader.js';


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
  const [annotationUploaderOpen, setAnnotationUploaderOpen] = useState(false);
  const [canvasAdditionalDataControllerOpen, setCanvasAdditionalDataControllerOpen] = useState(false);
  const [info, setInfo] = useState(''); // To display feedback info
  //const [popupText, setPopupText] = useState("");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [snapshotUploaderOpen, setSnapshotUploaderOpen] = useState(false);
  const [snapshotUrl, setSnapshotUrl] = useState(''); // once url is stored in db, no need for this variable
  
  const [form] = Form.useForm();
  const [frameNumber, setFrameNumber] = useState('');
  const [notes, setNotes] = useState({});  
  //let annotations = {};  // Still don't completely understand why this version doesn't work
  const [annotationUploadOpen, setAnnotationUploadOpen] = useState(false);

/*
  const fileDropdownItems = [
    {
      label: 'New Project',
      compName: 'ProjectManager',
      component: <ProjectManager
                key='0'
                status='new'
                open={newProjectManagerOpen}
                setOpen={setNewProjectManagerOpen}
                />,
    },
    {
      label: 'Download Project',
      compName: 'DownloadBtn',
      component: <DownloadBtn 
                  key='1'
                  type='configuration'  // DownloadBtn has two types: 'configuration' and 'annotation'. 'configuration' is for saving the configuration data, and 'annotation' is for saving the annotation data.
                  mode='inMenu' // DownloadBtn has two modes: 'inMenu' and 'solely'. 'inMenu' is used when the DownloadBtn is used in a dropdown menu, and 'solely' is used when the DownloadBtn is used as a standalone button. This prop affects the UI of the DownloadBtn.
                />,
    },
    {
      label: 'Load Project',
      compName: 'ModalJsonUploader',
      component: <ModalJsonUploader 
                  key='2'
                  type='configuration' // ModalJsonUploader has two types: 'configuration' and 'annotation'. 'configuration' is for uploading a configuration file, and 'annotation' is for uploading an annotation file.
                  open={configUploaderOpen} 
                  setOpen={setConfigUploaderOpen}
                />,
    },
    {
      label: 'Shortcuts', //What is this?
    },
    {
      label: 'Manage Movies',  //Video Manager sounds better
      compName: 'VideoManager',
      component: <Modal  // Modal = popup box, imported from AntDesign
                  key='3'  
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
                  />
                </Modal>,
    },
    {
      label: "import / export",
    },
    {
      label: "edit cropping",
    },
    {
      label: "clean temporary directory",
    },
    {
      label: "bundle working directory",
    },
    {
      label: "Quit", // on the dropdown
      compName: "quit",
      //onClick: ()=> openPopup("Close the tab"),
      component: <Modal
            key='4'
            title='Quit' // on the popup box
            open={isPopupOpen}
            setOpen={setIsPopupOpen}
            onCancel={() => setIsPopupOpen(false)}
            onOk={() => setIsPopupOpen(false)}
            footer={(_, { OkBtn}) => (
              <>
                <OkBtn />
              </>
            )}

            >
      To quit the program, simply close the tab.
      </Modal>
  
    },

  ]
    */


  /*
  function fileDropdownClickHandler(e){
    // TODO: put something here?  (How does this work without anything being here??)
  }
    */

  /*
  const fileDropdown = <DropdownMenu name='File' menu={fileDropdownItems} onClick={fileDropdownClickHandler}/>;
  */

  /*
  const viewDropdownItems = [
    {
      label: "Set Snapshot pic",
      compName: "SnapshotUploader",
      component: <Modal  // Modal = popup box, imported from AntDesign
        key='1'  
        title='Set Snapshot'
        open={snapshotUploaderOpen}
        setOpen={setSnapshotUploaderOpen}
        onCancel={() => setSnapshotUploaderOpen(false)}
        style={{overflowX: 'auto'}}
        footer={null}
      >
        <SnapshotUploader setSnapshotUrl={setSnapshotUrl}/>
      </Modal>
    },
  ]

  function viewDropdownClickHandler(e) {
    // TODO: customize click handler
  }

  const viewDropdown = <DropdownMenu name='View' menu={viewDropdownItems} onClick={viewDropdownClickHandler}/>;
  */

  /*
  const labelDropdownItems = [
    //TODO: currently empty
  ]

  function labelDropdownClickHandler(e) {
    // TODO: customize click handler
  }

  const labelDropdown = <DropdownMenu name='Label' menu={labelDropdownItems} onClick={labelDropdownClickHandler}/>;
*/

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
                  // disableGroupTypeSelect
                  // disableBtnTypeSelect
                  // hidePlusBtn
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
    /**
     * Click event handler for DropdownMenu. Will be called after the default behavior of each child.
     * e is the event object which has a key property corresponding to the index(integer) of each child in the 'menu' prop. This may be different with the 'key' prop of the component passed to each child.
     * */ 
    // console.log(e);
    // TODO: customize click handler

    // const label = projectDropdownItems[e.key].label;
    // switch (label) {
    //   case 'Exisiting Projects':
    //       setInfo('Exisiting Projects');
    //       break;
    //   case 'New Project':
    //       setInfo('New Project');
    //       break;
    //   case 'Upload Project':
    //       setInfo('Upload Project');
    //       break;
    //   case 'Save Annotation':
    //       setInfo('Save Annotation');
    //       break;
    //   case 'Edit Project':
    //       setInfo('Edit Project');
    //       break;
    //   case 'Download Configuration':
    //       setInfo('Download Configuration');
    //       break;
    // }
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

  function drawDataAsCircle(params) {
    /**
     * OnLoad event handler for the additional data for canvas.
     * 
     * params: {
     *      target: fabric obj needed for the drawing. Just pass it to the imported func from canvasUtils.js
     *      data: [additional data in needed range]
     * }
     */
    for (let c of params.data) {
      c.push(3); // add radius
      drawCircle(params.target, c, 'red');
    }
  }

  function drawDataAsLine(params) {
    for (let l of params.data) {
      drawLine(params.target, l, 'white');
    }
    // modify the data
    // saveToBackend(data);
  }

  function videoDropdownClickHandler(e) {
    // TODO: customize click handler
  }

  const videoDropdown = <DropdownMenu name='Video' menu={videoDropdownItems} onClick={videoDropdownClickHandler}/>

  const annotationDropdownItems = [
    {
      label: 'Save Annotation',
      compName: 'SaveAnnotationBtn',
      component: <SaveAnnotationBtn 
                  key='0'
                  mode='inMenu'
                />,
    },
    {
      label: 'Download Annotation',
      compName: 'DownloadBtn',
      component: <DownloadBtn 
                  key='1'
                  type='annotation' 
                  mode='inMenu'
                />,
    },
    {
      label: 'Upload Annotation',
      compName: 'ModalJsonUploader',
      component: <ModalJsonUploader 
                  key='2'
                  type='annotation' 
                  open={annotationUploaderOpen} 
                  setOpen={setAnnotationUploaderOpen}
                />, 
    },
  ];

  /*
  function annotationDropdownClickHandler(e) {
    // TODO: customize click handler
  }

  const annotationDropdown = <DropdownMenu name='Annotation' menu={annotationDropdownItems} onClick={annotationDropdownClickHandler}/>
*/

  const menubarItems = [
    /*{
      label: fileDropdown,
      key: '0',
    },
    {
      label: viewDropdown,
      key: '1',
    },
    {
      label: labelDropdown,
      key: '2',
    },*/
    {
      label: projectDropdown,
      key: '0',
    },
    {
      label: videoDropdown,
      key: '1',
    },
    {/*
      label: annotationDropdown,
      key: '2',
    */},
  ]
  
  //to hard-code buttons
  /*
  const btnGroupData = {
    groupType: 'category', // This will use the 'category' case in renderBtns
    groupIndex: 1,         // Group identifier
    childData: [
        { label: 'Clear', color: 'grey' },
        { label: 'Accepted', color: 'green' },
    ],
 };

  const btnGroupData2 = {
  groupType: 'category', // This will use the 'category' case in renderBtns
  groupIndex: 1,         // Group identifier
  childData: [
      { label: 'Train', color: 'green' },
      { label: 'Track', color: 'blue' },
  ],
  };

  const btnGroupData3 = {
  groupType: 'skeleton',
  groupIndex: 1,
  childData: [
    {
    skeletonName: 'mouse',
    data: [  
      {index: 0, 
      btnType: 'skeleton',
      label: 'head',
      color: '#FFFFFF'
      },
      {index: 1,
        btnType: 'skeleton',
        label: 'body',
        color: '#FFFFFF',
      },
      {index: 2,
        btnType: 'skeleton',
        label: 'thorax',
        color: '#FFFFFF'
      },
    ],
    }
  ]
  }
  */

  /*
  function viewImage(src, width, height, alt) {
    const img = document.createElement("img");  // what does this do?
    img.src = src;
    img.width = width;
    img.height = height;
    img.alt = alt;
    document.body.appendChild(img);
  }
    */

  function onDownloadBtnClick() { //What if there's no project or video loaded?  I guess default annotations are downloaded?
    const jsonAnno = JSON.stringify(notes);
    const blobAnno = new Blob([jsonAnno], {type: 'text/plain'});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blobAnno);
    a.download = 'annotation.json';
    a.click();
    URL.revokeObjectURL(a.href);
  } 

  const { TextArea } = Input;

  /*
  async function onAddBtnClick2() {
    const note = form.getFieldValue("notes");
    console.log("AddBtnClick note: ", note);
    myFunc2({note}) 
  }

  function myFunc2(props) {
    console.log("checking props in myFunc2:");
    console.log("Note: ", props.note);
    console.log(props.frameNum);
    if (props.note){  // If you clicked the button (no frame change), then it grabs the note and adds to dictionary
      note = props.note;
      setNotes(prevNotes => ({...prevNotes, [frameNum]:note}))
      console.log("setting notes");
    }
    else { // If you changed frames, it grabs the note and displays it
      const frameNum = props.frameNum; // This is a safe way to give the developer the frameNum value.
      setFrameNum(frameNum);
      const note = notes[frameNum]; // --> TODO: add annotations as a dictionary
      TextArea.value = note;
      console.log(notes);
    }
  }
    */

  function onAddBtnClick() {
    const note = form.getFieldValue("notes");
    console.log("This is the current TextArea:", note);
    setNotes(prevNotes => ({...prevNotes, [frameNumber]:note})) 
  }

  //frameChangeHandler
  // on frame change, this will update the text box with the correct annotation
  function myFunc(props) {
    const frameNumber = props.frameNum; // This is a safe way to give the developer the frameNum value.
    setFrameNumber(frameNumber);
    const note = notes[frameNumber]; // --> TODO: add annotations as a dictionary
    form.setFieldsValue({
      notes: notes[frameNumber]? notes[frameNumber]:"Enter notes here:",
  });
  }

  function onUploadBtnClick(){
    setAnnotationUploadOpen(true);
  }

  function onCloseUploader(){
    setAnnotationUploadOpen(false);
  }

  const ModalAnnotationUploader =
    <Modal 
      title={'Upload stuff'}
      //{/*open={props.open}*/}
      //onCancel={cancelClickHandler}
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
  
  

  return (
    <div>
      <Head>
        <title>Annotator</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Workspace > 
        <Menu items={menubarItems} mode="horizontal"/>
        <div className='py-2'>
          {/* If state info is null, InfoBar will only display predefined information for events. Otherwise, will display both predefined and contents of the info state */}
          <InfoBar info={info} /> 
        </div>
        
        <Row >
          <Col width={'50%'}>
            <Form className='my-2 mx-3' form={form} size='small'>
                <Form.Item
                    name="notes" 
                >
                    <TextArea rows={10} />
                </Form.Item>
                <Form.Item>
                    <Button className='my-2' onClick={onAddBtnClick}>Save Note</Button>
                    <Button className='my-2' onClick={onDownloadBtnClick}>Download Notes</Button>
                    <Button className='my-2' onClick={onUploadBtnClick}>Upload Notes</Button>
                    {ModalAnnotationUploader}
                    {/*isUploadOpen && (
                      <AnnotationUploader
                        type="annotation"
                        open={isUploadOpen}
                        onClose={onCloseUploader}
                    />)*/}
                </Form.Item>
                </Form>
            <Row >
              {/*<TextArea width={500} rows={4} />*/}
              {/*<NoteTakerBox />*/}
              {/*<Col width={'30%'}> Targets 
                <TargetsTable width={350} height={250} scrollY={230} ellipsis />
              </Col>
              <Col width={'70%'}> Labeled Frames
                <LabeledFrames width={350} height={250} scrollY={230} ellipsis />
                {<BtnGroup data={btnGroupData} />}
                {<BtnGroup data={btnGroupData2} />}
                {/*<BtnGroup data={btnGroupData3} />*/}
              {/*</Col>*/}
            </Row>
            
            <BtnContainer />
          </Col>
          <Col >
              <Canvas height={450}/>
              <VideoUploader 
                hideSubmit 
                onFrameChange={myFunc}
                />
              
              {/*<div className='py-2' style={{height: '150px', width: '670px', border: 'solid 1px black'}} >*/}
                {/* <div style={{height: '50%', width: '650px'}}> */}
                {/*<AnnotationChart 
                  labels = {['chase', 'follow']} //TODO: should be replaced by another ChartController component
                  // omitXLabels
                />*/}
                {/* </div> */}
                {/* <div className='my-1' style={{height: '50%', width: '650px'}}>
                <AnnotationChart 
                  labels = {['grooming']} //TODO: should be replaced by another ChartController component
                  // omitXLabels
                />
                </div> */}
              {/*</div>*/}
              {/*<div className='py-2' style={{height: '150px', width: '670px', border: 'solid 1px black'}} >*/}
                {/*<AdditionalDataChart 
                  // hideRange  //Hide the range input.
                  // halfRange={5}  //Allow developer to set half range value when hideRange is true. Required and only useful when hideRange is true.
                  defaultHalfRange={50}  // Default value for half range input. Should only be used when hideRange is false.
                  // omitXLabels
                  />*/}
              {/*</div>*/}
          </Col>
        </Row>
      </Workspace>
    </div>
  )
}


/*
Snapshot:
1. pic appears
2. pic appears inside Snapshot component
3. pic is triggered to appear with a button
4. pic is selectable with button (path not set ahead of time)
5. pic is selectable with menu item
6. pic is actually a Canvas frame capture
7. pic is actually a Canvas frame capture + annotations
8. pic is saved to database so upload isn't necessary each time user comes back to the app
*/