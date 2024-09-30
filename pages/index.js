import React, {useState} from 'react';
import Head from 'next/head';
import Workspace from '../components/Workspace.js';
import Canvas from '../components/Canvas.js';
import VideoUploader from '../components/VideoUploader.js';
import BtnContainer from '../components/BtnContainer.js';
import AnnotationTable from '../components/AnnotationTable.js';
import SaveBtn from '../components/SaveBtn.js';
import ProjectManager from '../components/ProjectManager.js';
import ModalJsonUploader from '../components/ModalJsonUploader.js';
import VideoManager from '../components/VideoManager.js';
import CanvasAdditionalDataController from '../components/CanvasAdditionalDataController.js';
import DropdownMenu from '../components/DropdownMenu.js';
import ProjectList from '../components/ProjectList.js';
import {Row, Col} from 'react-bootstrap'; // Third party components. Refer to the tutorial on https://react-bootstrap.netlify.app/docs/layout/grid
import { Menu, Modal } from 'antd'; // Third party components. Refer to the tutorial on https://ant.design/components/menu, and https://ant.design/components/modal
import { drawCircle, drawLine } from '../utils/canvasUtils.js'; // canvasUtils.js is a wrapper of fabric.js. It provides functions to operate on canvas easily. Currently, only these two functions are provided.



// Client side components. They cannot be rendered on the server side, thus need to be explicitly marked as client side comp.
import dynamic from 'next/dynamic';

const Chart = dynamic(() => import('../components/ChartCombo.js'), { ssr: false });
const WindowMonitor = dynamic(() => import('../components/WindowMonitor.js'), { ssr: false });
const AnnotationChart = dynamic(() => import('../components/AnnotationChart.js'), { ssr: false });

export default function Home() {
  // The ..open/set..Open states are to allow the child modal components to control the visibility of themselves inside.
  const [newProjectManagerOpen, setNewProjectManagerOpen] = useState(false);
  const [editProjectManagerOpen, setEditProjectManagerOpen] = useState(false);
  const [configUploaderOpen, setConfigUploaderOpen] = useState(false);
  const [projectListOpen, setProjectListOpen] = useState(false);
  const [videoManagerOpen, setVideoManagerOpen] = useState(false);
  const [annotationUploaderOpen, setAnnotationUploaderOpen] = useState(false);
  const [canvasAdditionalDataControllerOpen, setCanvasAdditionalDataControllerOpen] = useState(false);
  const [info, setInfo] = useState(''); // To display some feedback info

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
                  defaultGroupType='category'
                  defaultBtnType='category'
                  disableGroupTypeSelect
                  disableBtnTypeSelect
                  hidePlusBtn
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
                  defaultGroupType='category'
                  defaultBtnType='category'
                  disableGroupTypeSelect
                  disableBtnTypeSelect
                  hidePlusBtn
                />, 
    },
    {
      label: 'Save Configuration',
      compName: 'SaveBtn',
      component: <SaveBtn 
                  key='4'
                  type='configuration'  // SaveBtn has two types: 'configuration' and 'annotation'. 'configuration' is for saving the configuration data, and 'annotation' is for saving the annotation data.
                  mode='inMenu' // SaveBtn has two modes: 'inMenu' and 'solely'. 'inMenu' is used when the SaveBtn is used in a dropdown menu, and 'solely' is used when the SaveBtn is used as a standalone button. This prop affects the UI of the SaveBtn.
                />,
    },
];
  
  function projectDropdownClickHandler(e) {
    /**
     * Click event handler for DropdownMenu. Will be called after the default behavior of each child.
     * e is the event object which has a key property corresponding to the index(integer) of each child in the 'menu' prop. This may be different with the 'key' prop of the component passed to each child.
     * */ 
    // console.log(e);
    // const label = projectDropdownItems[e.key].label;
    // TODO: customize click handler

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
    //   case 'Save Configuration':
    //       setInfo('Save Configuration');
    //       break;
    // }
  }

  const projectDropdown = <DropdownMenu name='Project' menu={projectDropdownItems} onClick={projectDropdownClickHandler}/>;

  const videoDropdownItems = [
    {
      label: 'Video Manager',
      compName: 'VideoManager',
      component: <Modal
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
                    // additionalFields={[
                    //   {name: 'canvas1', label: 'canvas1', required: true, loadIn: 'canvas', onLoad: drawDataAsCircle}, 
                    //   {name: 'canvas2', label: 'canvas2', required: true, loadIn: 'canvas', onLoad: drawDataAsLine},
                    //   {name: 'chart1', label: 'chart1', required: true, loadIn: 'chart'}, 
                    //   {name: 'chart2', label: 'chart2', required: true, loadIn: 'chart'}
                    // ]}
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
      compName: 'SaveBtn',
      component: <SaveBtn 
                  key='0'
                  type='annotation' 
                  mode='inMenu'
                />,
    },
    {
      label: 'Upload Annotation',
      compName: 'ModalJsonUploader',
      component: <ModalJsonUploader 
                  key='1'
                  type='annotation' 
                  open={annotationUploaderOpen} 
                  setOpen={setAnnotationUploaderOpen}
                />, 
    },
  ];

  function annotationDropdownClickHandler(e) {
    // TODO: customize click handler
  }

  const annotationDropdown = <DropdownMenu name='Annotation' menu={annotationDropdownItems} onClick={annotationDropdownClickHandler}/>


  const menubarItems = [
    {
      label: projectDropdown,
      key: '0',
    },
    {
      label: videoDropdown,
      key: '1',
    },
    {
      label: annotationDropdown,
      key: '2',
    },
  ]
  
  

  return (
    <div>
      <Head>
        <title>Annotator</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Workspace > 
        <WindowMonitor />
        <Menu items={menubarItems} mode="horizontal"/>
        <p style={{color: 'red'}}>{info}</p>
        <Row >
          <Col lg='auto'>
            {/* <canvas width={350} height={250} style={{border: 'solid'}}/> */}
            <AnnotationTable width={350} height={250} scrollY={230} ellipsis />
            <BtnContainer />
          </Col>
          <Col>
              <Canvas width={550} height={350}/>
              <VideoUploader 
                hideSubmit 
                />
              <div className='py-2' style={{height: '100px', width: '670px', border: 'solid 1px black'}} >
                {/* <div style={{height: '100%', width: '650px'}}> */}
                <AnnotationChart 
                  labels = {['chase', 'no-chase']}
                  // omitXLables
                />
                {/* </div> */}
              </div>
              <div className='py-2' style={{height: '150px', width: '670px', border: 'solid 1px black'}} >
                <Chart 
                  // hideRange  //Hide the range input.
                  // halfRange={5}  //Allow developer to set half range value when hideRange is true. Required and only useful when hideRange is true.
                  defaultHalfRange={50}  // Default value for half range input. Should only be used when hideRange is false.
                  />
              </div>
          </Col>
        </Row>
      </Workspace>
    </div>
  )
}
