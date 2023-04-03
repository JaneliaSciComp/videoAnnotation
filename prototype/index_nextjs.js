import Head from 'next/head';
import React, {useState, useEffect, useRef} from 'react';
import styles from '../styles/Home.module.css';


const POINT_SIZE = 4;


export default function Home() {
  const imgRef = useRef(null);
  const canvasRef = useRef(null);


  //console.log(canvasRef.current); //print out null
  
  useEffect(() => {
      //console.log(canvasRef.current); //print out canvas

      
      if (canvasRef.current && imgRef.current) {
        //when img loaded, display image on canvas
        imgRef.current.onload = () => {
          canvasRef.current.getContext('2d').drawImage(imgRef.current, 0, 0);
        }

        imgRef.current.src = '/fly.png';
      }
    }
  )

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
        <canvas ref={canvasRef} className={styles.canvas} width="600" height="450" onClick={drawClickPoint}>
          <img ref={imgRef} width="600" height="450" alt="img"/>
        </canvas>
      </main>

      <footer className={styles.footer}>
       
      </footer>
    </div>
  )
}
