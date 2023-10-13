import React from 'react';
import Workspace from '../components/Workspace.js';
import ShapeBtn from '../components/ShapeBtn.js';
import Category from '../components/Category.js';
import SkeletonBtn from '../components/SkeletonBtn.js';
import Canvas from '../components/Canvas.js';
import VideoUploader from '../components/VideoUploader.js';
import AnnotationDisplay from '../components/AnnotationDisplay.js';
import Design from '../components/Design.js';
import BtnGroupController from '../components/BtnGroupController';
import BtnContainer from '../components/BtnContainer.js';
import BtnGroup from '../components/BtnGroup.js';



export default function Home() {
  
  const btnConfigData = {'123456': {
    groupType: 'skeleton',
    btnType: 'skeleton',
    btnNum: 2,
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
            new Set([1]),
            new Set([0,2,3,4]),
            new Set([1]),
            new Set([1]),
            new Set([1, 5]),
            new Set([4])
        ]
    }
}}

  


  return (
    <div>
      <main>
        <Workspace >
          {/* <Design /> */}
          <BtnGroupController groupType='skeleton' btnType='skeleton' disableGroupTypeSelect disableBtnTypeSelect />
          <BtnContainer />
          <AnnotationDisplay/>
          <Canvas width={600}/>
          <VideoUploader />
        </Workspace>

        {/* <Workspace >
          <Category label='c' color='blue'/>
          <ShapeBtn type='keyPoint' label='k' color='blue' />
          <ShapeBtn type='bbox' label='mouse' color='red' />
          <ShapeBtn type='polygon' label='p' color='red' />
          
          <AnnotationDisplay />
          
          <Canvas />
          <VideoUploader />
          <Design />
          <BtnGroupController groupType='category' disableGroupTypeSelect />
          <BtnContainer />
        </Workspace> */}
      </main>
    </div>
  )
}
