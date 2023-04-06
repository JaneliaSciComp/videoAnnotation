import Head from 'next/head';
import React, {useState, useEffect, useRef} from 'react';
import Canvas from '../components/Canvas';
import styles from '../styles/Home.module.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import {fabric} from 'fabric';


const POINT_SIZE = 4;


export default function Home() {
  const [annotation, setAnnotation] = useState({});

  
  
  function getMouseClickPosition(e) {
    if (canvasRef.current) {
      let canvasBox = canvasRef.current.getBoundingClientRect();
      let clickX = e.clientX - canvasBox.left; 
      let clickY = e.clientY - canvasBox.top;
      return [clickX, clickY];
    }
  }

  function drawPoint(x, y, color, shape) {
    if (canvasRef.current) {
      let ctx = canvasRef.current.getContext('2d');
      switch (shape) {
        case 'cross':
            ctx.beginPath();
            ctx.moveTo(x-POINT_SIZE, y);
            ctx.lineTo(x+POINT_SIZE, y);
            ctx.moveTo(x, y-POINT_SIZE);
            ctx.lineTo(x, y+POINT_SIZE);
            // ctx.closePath();
            ctx.strokeStyle = color;
            ctx.stroke();
            break;
        case 'circle':
            ctx.beginPath();
            ctx.arc(x, y, POINT_SIZE-1, 0, Math.PI*2, true);
            ctx.stroke();
            break;
      }
    }
  }

  // draw a point at the click position
  function drawClickPoint(e, color='black', shape='cross') {
    let clickPos = getMouseClickPosition(e);
    drawPoint(clickPos[0], clickPos[1], color, shape);
  }


  return (
    <div className={styles.container}>
      <Head>
        <title>Annotator</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <Canvas className='my-3' img='/fly.png'></Canvas>
      </main>

      <footer className={styles.footer}>
       
      </footer>
    </div>
  )
}
