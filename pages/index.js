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
import {Row, Col} from 'react-bootstrap';
import { Button } from 'antd';


// client side components
import dynamic from 'next/dynamic';
const Chart = dynamic(() => import('../components/ChartCombo.js'), { ssr: false });


export default function Home() {
  const [open, setOpen] = useState(false);
  
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

  const metricsExample= ['length', 'width', 'chase'];
  const nums = [71,56,-24,56,26,42,10,-82,82,47,-77,29,54,-40,54,91,96,-15,90,23];
  const data = {
          length: {
              data: nums,
              // borderColor: '#F5222D', //'rgb(255, 99, 132)',
              // backgroundColor: '#F5222D80' //'rgba(255, 99, 132, 0.5)',
          },
          width: {
              data: nums.map(n => n+10), 
              // borderColor: '#3DDCF9', //'rgb(22, 119, 255)',
              // backgroundColor: '#3DDCF980' //'rgba(22, 119, 255, 0.5)',
          },
          chase: {
              data: [0,0,0,0,0,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1],
          }
        }


  function openModal() {
    setOpen(true);
  }

//btnConfigData={btnConfigData}

  return (
    <div>
      <Head>
        <title>Annotator</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Workspace > 
        {/* <Category label='chase'/>
        <ShapeBtn type='bbox' label='fly' color='red' /> */}
        {/* <BtnGroup data={groupData} /> */}
        {/* <BtnGroupController /> */}
        {/* <JsonUploader type='annotation'/> */}
        {/* <JsonUploader type='configuration'/> */}
        

        {/* <BtnConfiguration status='new'/> */}
        {/* <Button onClick={openModal}>Open Modal</Button> */}
        {/* <ProjectManager status='new' open={open} setOpen={setOpen}/> */}
        {/* <ModalJsonUploader 
          type='configuration'
          open={open}
          setOpen={setOpen}
        /> */}
        {/* <JsonUploader type='configuration' /> */}
        <VideoManager />
        <ProjectDropdown />
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
            <SaveBtn type='configuration'/>
            <SaveBtn type='annotation' />
          </Col>
        </Row>
        <Row >
          <Col >
            <Canvas width={400} height={300}/>
          </Col>
          <Col >
            <AnnotationTable width={400} height={300} ellipsis/>
          </Col>
        </Row>
        <VideoUploader />
        {/* <Chart />
        <ChartMenu /> */}
        <div className='my-3' style={{height: '200px', width: '600px'}} >
          <Chart data={data} />
          {/* <ChartCombo data={data} /> */}
        </div>
        
      </Workspace>
    </div>
  )
}
