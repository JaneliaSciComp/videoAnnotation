import Head from 'next/head';
import React, {useState, useEffect, useRef} from 'react';
import Workspace from '../components/Workspace.js';
import styles from '../styles/Home.module.css';
import 'bootstrap/dist/css/bootstrap.min.css';
// import {fabric} from 'fabric';



export default function Home() {
  // const [annotation, setAnnotation] = useState({});
  const imgRef = useRef(null);
  const canvasRef = useRef(null);
  
  useEffect(()=>{
    // if (props.opencvReady) {
      imgRef.current.src = '/fly.png';
      imgRef.current.onload = () => {
        let mat = cv.imread(imgRef.current);
        console.log('worked');
        cv.imshow(canvasRef.current.id, mat);
        mat.delete();
        // cv.save(mat, 'output.png');
      }    
    // }
    
  }
  // , [props.opencvReady]
  )

  


  return (
    <div className={styles.container}>
      <Head>
        <title>Annotator</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.workspaceContainer}>
        <img ref={imgRef} width="300" height="200"  alt="No Image" />
        <canvas id='output' ref={canvasRef} width="300" height="200"></canvas>
        <Workspace />
      </main>

      <footer className={styles.footer}>
       
      </footer>
    </div>
  )
}
