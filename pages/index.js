import React from 'react';
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
import BtnContainer from '../components/BtnContainer.js';
import BtnGroup from '../components/BtnGroup.js';
import BrushBtn from '../components/BrushBtn.js';
import BrushTool from '../components/BrushTool.js';
import AnnotationTable from '../components/AnnotationTable.js';
import Chart from '../components/Chart.js';
import SaveBtn from '../components/SaveBtn.js';
import TrainBtn from '../components/TrainBtn.js';
import {Row, Col} from 'react-bootstrap';



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

  
  return (
    <div>
      <Workspace >
        <BtnConfiguration 
          groupType='skeleton' 
          btnType='skeleton'
          disableGroupTypeSelect
          disableBtnTypeSelect/>
        
        <Row>
          <Col xl='auto'>
            <canvas width={350} height={200} style={{border: 'solid'}}/>
            <AnnotationTable width={350} height={200} scrollY={160} ellipsis />
            <BtnContainer />
            <div style={{textAlign: 'center'}}>
              <SaveBtn />
              <TrainBtn onClick={()=>{console.log('TrainBtn clicked')}}/>
            </div>
            
          </Col>
          <Col xl='auto'>
            <Canvas width={700} height={500} />
            <div className='mx-2'>
              <VideoUploader />
            </div>
            
          </Col>
        </Row>

      </Workspace>
    </div>
  )
}
