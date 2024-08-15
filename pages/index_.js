import React, {useState, useEffect} from 'react';
import Head from 'next/head';
import Workspace from '../components/Workspace.js';
import ShapeBtn from '../components/ShapeBtn.js';
import Category from '../components/Category.js';
import SkeletonBtn from '../components/SkeletonBtn.js';
import Canvas from '../components/Canvas.js';
import VideoUploader from '../components/VideoUploader.js';
import ActiveAnnotation from '../components/ActiveAnnotation.js';
import BtnConfiguration from '../components/BtnConfiguration.js';
import BtnGroupController from '../components/BtnGroupController';
import BtnController from '../components/BtnController.js';
import BtnContainer from '../components/BtnContainer.js';
import BtnGroup from '../components/BtnGroup.js';
import BrushBtn from '../components/BrushBtn.js';
import BrushTool from '../components/BrushTool.js';
import AnnotationTable from '../components/AnnotationTable.js';
import SaveBtn from '../components/SaveBtn.js';
// import ChartCombo from '../components/ChartCombo.js';
import JsonUploader from '../components/JsonUploader.js';
import ProjectManager from '../components/ProjectManager.js';
import ProjectDropdown from '../components/ProjectDropdown.js';
import ModalJsonUploader from '../components/ModalJsonUploader.js';
import VideoManager from '../components/VideoManager.js';
import CanvasAdditionalDataController from '../components/CanvasAdditionalDataController.js';
import DropdownMenu from '../components/DropdownMenu.js';
import ProjectList from '../components/ProjectList.js';
import {Row, Col} from 'react-bootstrap';
import { Button, Menu, Modal } from 'antd';
import { drawCircle, drawLine } from '../utils/canvasUtils.js';



// client side components
import dynamic from 'next/dynamic';

const Chart = dynamic(() => import('../components/ChartCombo.js'), { ssr: false });
// const Workspace = dynamic(() => import('../components/Workspace.js'), { ssr: false });
const WindowMonitor = dynamic(() => import('../components/WindowMonitor.js'), { ssr: false });


export default function Home() {
  const [newProjectManagerOpen, setNewProjectManagerOpen] = useState(false);
  const [editProjectManagerOpen, setEditProjectManagerOpen] = useState(false);
  const [configUploaderOpen, setConfigUploaderOpen] = useState(false);
  const [annoUploaderOpen, setAnnoUploaderOpen] = useState(false);
  const [projectListOpen, setProjectListOpen] = useState(false);
  const [info, setInfo] = useState('');
  const [videoManagerOpen, setVideoManagerOpen] = useState(false);
  const [annotationUploaderOpen, setAnnotationUploaderOpen] = useState(false);
  
  const groupData = {
    groupIndex:'123',
    groupType: 'shape',
    btnType: 'bbox',
    btnNum: 2,
    childData: [
        {
            index: 0, 
            btnType: 'bbox',
            label: 'head',
            color: '#1677FF'
            },
        {
            index: 1, 
            btnType: 'bbox',
            label: 'neck',
            color: '#F5222D'
            },
    ]
  }
  const btnConfigData = {'123456': {
    groupType: 'skeleton',
    btnType: 'skeleton',
    btnNum: 2,
    skeletonName: 'fly',
    childData: [
        {
            index: 0, 
            btnType: 'skeleton',
            label: 'head',
            color: '#1677FF'
            },
        {
            index: 1, 
            btnType: 'skeleton',
            label: 'neck',
            color: '#F5222D'
            },
        {
            index: 2, 
            btnType: 'skeleton',
            label: 'left wing',
            color: '#55782D'
            },
        {
            index: 3, 
            btnType: 'skeleton',
            label: 'right wing',
            color: '#52C41A'
            },
        {
            index: 4, 
            btnType: 'skeleton',
            label: 'body',
            color: '#EB2F96'
            },
        {
          index: 5, 
          btnType: 'skeleton',
          label: 'tail',
          color: '#342F96'
          },
    ],
    edgeData: {
        color: '#1677FF',
        edges: [
            // new Set([1]),
            // new Set([0,2,3,4]),
            // new Set([1]),
            // new Set([1]),
            // new Set([1, 5]),
            // new Set([4])
            [1],
            [0,2,3,4],
            [1],
            [1],
            [1, 5],
            [4]
        ]
    }
  }}

  const nums = [71,56,-24,56,26,42,10,-82,82,47,-77,29,54,-40,54,91,96,-15,90,23];
  const data = {
          length: {
              range: [0, 19],
              data: nums,
              // borderColor: '#F5222D', //'rgb(255, 99, 132)',
              // backgroundColor: '#F5222D80' //'rgba(255, 99, 132, 0.5)',
          },
          width: {
              range: [0, 19],
              data: nums.map(n => n+10), 
              // borderColor: '#3DDCF9', //'rgb(22, 119, 255)',
              // backgroundColor: '#3DDCF980' //'rgba(22, 119, 255, 0.5)',
          },
          chase: {
              range: [0, 19],
              data: [0,0,0,0,0,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1],
          }
        }



  function drawDataAsCircle(params) {
    /**
     * params: {
     *      target: fabric obj needed for the drawing. Just pass it to the imported func from canvasUtils.js
*           data: [additional data in needed range]
*         }
     */
    for (let c of params.data) {

      c.push(3); // add radius
      // drawCircle(e.target, c, 'red');
      // console.log(c);
      drawCircle(params.target, c, 'red');
    }
  }

  function drawDataAsLine(params) {
    /**
     * params: {
     *      target: fabric obj needed for the drawing. Just pass it to imported func from canvasUtils.js
*           data: [additional data in needed range]
*         }
     */
    for (let l of params.data) {
      // console.log(l);
      drawLine(params.target, l, 'white');
    }
  }

  const projectDropdownItems = [
    {
      label: 'Exisiting Projects',
      compName: 'ProjectList',
      component: <ProjectList 
                  open={projectListOpen}
                  setOpen={setProjectListOpen}
                />,
      // preventDefault: true,
    },
    {
      label: 'New Project',
      compName: 'ProjectManager',
      component: <ProjectManager 
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
                  type='configuration' 
                  open={configUploaderOpen} 
                  setOpen={setConfigUploaderOpen}
                />, 
      // preventDefault: true,
    },
    // {
    //   label: 'Save Annotation',
    //   // preventDefault: true,
    // },
    {
      label: 'Edit Project',
      compName: 'ProjectManager',
      component: <ProjectManager 
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
                  type='configuration' 
                  mode='inMenu'
                />,
      // preventDefault: true,
    },
];
  
  function projectDropdownClickHandler(e) {
    // console.log(e);
    const label = projectDropdownItems[e.key].label;
    switch (label) {
      case 'Exisiting Projects':
          setInfo('Exisiting Projects');
          break;
      case 'New Project':
          setInfo('New Project');
          break;
      case 'Upload Project':
          setInfo('Upload Project');
          break;
      case 'Save Annotation':
          setInfo('Save Annotation');
          break;
      case 'Edit Project':
          setInfo('Edit Project');
          break;
      case 'Save Configuration':
          setInfo('Save Configuration');
          break;
    }
  }

  const projectDropdown = <DropdownMenu name='Project' menu={projectDropdownItems} onClick={projectDropdownClickHandler}/>;

  const videoDropdownItems = [
    {
      label: 'Video Manager',
      compName: 'VideoManager',
      component: <Modal  
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
      // preventDefault: true,
    },
    // {
    //   label: 'New Project',
    //   compName: 'ProjectManager',
    //   component: <ProjectManager 
    //               status='new' 
    //               open={newProjectManagerOpen} 
    //               setOpen={setNewProjectManagerOpen}
    //               defaultGroupType='category'
    //               defaultBtnType='category'
    //               disableGroupTypeSelect
    //               disableBtnTypeSelect
    //               hidePlusBtn
    //             />,
    //   // preventDefault: true,
    // },
  ];

  function videoDropdownClickHandler(e) {
    
  }

  const videoDropdown = <DropdownMenu name='Video' menu={videoDropdownItems} onClick={videoDropdownClickHandler}/>

  const annotationDropdownItems = [
    {
      label: 'Save Annotation',
      compName: 'SaveBtn',
      component: <SaveBtn 
                  type='annotation' 
                  mode='inMenu'
                />,
      // preventDefault: true,
    },
    {
      label: 'Upload Annotation',
      compName: 'ModalJsonUploader',
      component: <ModalJsonUploader 
                  type='annotation' 
                  open={annotationUploaderOpen} 
                  setOpen={setAnnotationUploaderOpen}
                />, 
      // preventDefault: true,
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
  

//btnConfigData={btnConfigData}

  return (
    <div>
      <Head>
        <title>Annotator</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Workspace > 
        <WindowMonitor />
        {/* <Category label='chase'/>
        <ShapeBtn type='bbox' label='fly' color='red' /> */}
        {/* <BtnGroup data={groupData} /> */}
        {/* <BtnGroupController /> */}

        {/* <BtnConfiguration status='new'/> */}
        {/* <Button onClick={openModal}>Open Modal</Button> */}
        {/* <ProjectManager status='new' open={open} setOpen={setOpen}/> */}
        {/* <ModalJsonUploader 
          type='configuration'
          open={open}
          setOpen={setOpen}
        /> */}
        {/* <JsonUploader type='configuration' /> */}
        {/* <JsonUploader type='annotation'/> */}
        {/* <VideoManager 
          additionalFields={[
              {name: 'canvas1', label: 'canvas1', required: true, loadIn: 'canvas', onLoad: drawDataAsCircle}, 
              {name: 'canvas2', label: 'canvas2', required: true, loadIn: 'canvas', onLoad: drawDataAsLine},
              {name: 'chart1', label: 'chart1', required: true, loadIn: 'chart'}, 
              {name: 'chart2', label: 'chart2', required: true, loadIn: 'chart'}
          ]}
        /> */}
        <p>{info}</p>
        {/* <ProjectDropdown 
            defaultGroupType='category'
            defaultBtnType='category'
            disableGroupTypeSelect
            disableBtnTypeSelect
            hidePlusBtn
          /> */}
        {/* <Dropdown name='Project' menu={projectDropdownItems} onClick={projectDropdownClickHandler}/>
        <Dropdown name='Video' menu={videoDropdownItems} onClick={videoDropdownClickHandler}/> */}
        <Menu items={menubarItems} mode="horizontal"/>
        <Row >
          <Col>
            {/* <Category label='chase'/>
            <ShapeBtn type='bbox' label='fly-bbox' color='red' />
            <ShapeBtn type='polygon' label='cat-plg' color='blue' /> */}
            <BtnContainer />
            {/* <BrushTool />
            <BrushBtn label='mouse' />
            <BrushBtn label='fly' color='#FF0000' /> */}
          </Col>
          <Col>
            {/* <ActiveAnnotation /> */}
            {/* <SaveBtn type='configuration'/> */}
            {/* <SaveBtn type='annotation'>Save Annotation</SaveBtn> */}
          </Col>
        </Row>
        <Row >
          <Col >
            <CanvasAdditionalDataController />
            <Canvas width={400} height={300}/>
          </Col>
          <Col >
            <AnnotationTable width={400} height={300} ellipsis/>
          </Col>
        </Row>
        <VideoUploader />
        {/* hideSubmit */}
        {/* <Chart />
        <ChartMenu /> */}
        <div className='my-3' style={{height: '200px', width: '600px'}} >
          <Chart 
            // data={data} 
            // hideRange
            // halfRange={5}
            // defaultHalfRange={2}
            />
          {/* <ChartCombo data={data} /> */}
        </div>
        
      </Workspace>
    </div>
  )
}
