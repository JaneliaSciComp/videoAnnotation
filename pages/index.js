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
      <Workspace >
        {/* <Category label='chase'/>
        <ShapeBtn type='bbox' label='fly' color='red' /> */}
        {/* <BtnGroup data={groupData} /> */}
        {/* <BtnGroupController index='12345' groupType='skeleton' btnType='skeleton' disableGroupTypeSelect disableBtnTypeSelect /> */}
        <Design />
        <BtnContainer />
        <AnnotationDisplay />
        <Canvas />
        <VideoUploader />
      </Workspace>
    </div>
  )
}
