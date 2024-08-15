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
import {Row, Col} from 'react-bootstrap';
import { Menu, Modal } from 'antd';
import { drawCircle, drawLine } from '../utils/canvasUtils.js';



// client side components
import dynamic from 'next/dynamic';

const Chart = dynamic(() => import('../components/ChartCombo.js'), { ssr: false });
const WindowMonitor = dynamic(() => import('../components/WindowMonitor.js'), { ssr: false });


export default function Home() {
  const [newProjectManagerOpen, setNewProjectManagerOpen] = useState(false);
  const [editProjectManagerOpen, setEditProjectManagerOpen] = useState(false);
  const [configUploaderOpen, setConfigUploaderOpen] = useState(false);
  const [projectListOpen, setProjectListOpen] = useState(false);
  const [info, setInfo] = useState('');
  const [videoManagerOpen, setVideoManagerOpen] = useState(false);
  const [annotationUploaderOpen, setAnnotationUploaderOpen] = useState(false);
  const [canvasAdditionalDataControllerOpen, setCanvasAdditionalDataControllerOpen] = useState(false);
  

  const projectDropdownItems = [
    {
      label: 'Exisiting Projects',
      compName: 'ProjectList',
      component: <ProjectList 
                  key='0'
                  open={projectListOpen}
                  setOpen={setProjectListOpen}
                />,
      // preventDefault: true,
    },
    {
      label: 'New Project',
      compName: 'ProjectManager',
      component: <ProjectManager 
                  key='1'
                  status='new' 
                  open={newProjectManagerOpen} 
                  setOpen={setNewProjectManagerOpen}
                  defaultGroupType='category'
                  defaultBtnType='category'
                  disableGroupTypeSelect
                  disableBtnTypeSelect
                  hidePlusBtn
                />,
      // preventDefault: true,
    },
    {
      label: 'Upload Project',
      compName: 'ModalJsonUploader',
      component: <ModalJsonUploader 
                  key='2'
                  type='configuration' 
                  open={configUploaderOpen} 
                  setOpen={setConfigUploaderOpen}
                />, 
      // preventDefault: true,
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
      // preventDefault: true,
    },
    {
      label: 'Save Configuration',
      compName: 'SaveBtn',
      component: <SaveBtn 
                  key='4'
                  type='configuration' 
                  mode='inMenu'
                />,
      // preventDefault: true,
    },
];
  
  function projectDropdownClickHandler(e) {
    // console.log(e);
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
                      // hideRange
                      // halfRange={2}
                      defaultHalfRange={1}
                    />
                </Modal>,
    },
  ];

  function drawDataAsCircle(params) {
    /**
     * params: {
     *      target: fabric obj needed for the drawing. Just pass it to the imported func from canvasUtils.js
*           data: [additional data in needed range]
*         }
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
  }

  function videoDropdownClickHandler(e) {
    
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
            <canvas width={300} height={250} style={{border: 'solid'}}/>
            <AnnotationTable width={300} height={250} scrollY={230} ellipsis />
            <BtnContainer />
          </Col>
          <Col>
              <Canvas width={650} height={450}/>
              <VideoUploader hideSubmit />
            <div className='my-3' style={{height: '150px', width: '670px'}} >
              <Chart 
                // hideRange
                // halfRange={5}
                defaultHalfRange={2}
                />
            </div>
          </Col>
        </Row>
      </Workspace>
    </div>
  )
}
