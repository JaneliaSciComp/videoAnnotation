import Head from 'next/head';
import React from 'react';
import Workspace from '../components/Workspace.js';
import ShapeBtn from '../components/ShapeBtn.js';
import styles from '../styles/Home.module.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Category from '../components/Category.js';
import SkeletonBtn from '../components/SkeletonBtn.js';
import Canvas from '../components/Canvas.js';
import VideoUploader from '../components/VideoUploader.js';
import AnnotationDisplay from '../components/AnnotationDisplay.js';
import Design from '../components/Design.js';
import BtnGroupController from '../components/BtnGroupController';

// import {fabric} from 'fabric';



export default function Home() {
  // const [annotation, setAnnotation] = useState({});
  // const imgRef = useRef(null);
  // const canvasRef = useRef(null);
  
  // useEffect(()=>{
  //   // if (props.opencvReady) {
  //     imgRef.current.src = '/fly.png';
  //     imgRef.current.onload = () => {
  //       let mat = cv.imread(imgRef.current);
  //       console.log('worked');
  //       cv.imshow(canvasRef.current.id, mat);
  //       mat.delete();
  //       // cv.save(mat, 'output.png');
  //     }    
  //   // }
    
  // }
  // // , [props.opencvReady]
  // )

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

// /Users/pengxi/video/numbered.mp4
  


  return (
    <div>
      <Head>
        <title>Annotator</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
      
        <Workspace btnConfigData={btnConfigData}>
          <Category label='c' color='blue'/>
          <ShapeBtn type='keyPoint' label='k' color='blue' />
          <ShapeBtn type='bbox' label='mouse' color='red' />
          <ShapeBtn type='polygon' label='p' color='red' />
          <SkeletonBtn
              groupIndex={Object.keys(btnConfigData)[0]}
              data={btnConfigData[Object.keys(btnConfigData)[0]].childData}
              />
          
          <AnnotationDisplay />
          
          <Canvas />
          <VideoUploader />
          <Design />
          <BtnGroupController groupType='category' disableGroupTypeSelect />
        </Workspace>
      </main>

      <footer className={styles.footer}>
       
      </footer>
    </div>
  )
}
