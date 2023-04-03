import React, {useState, useEffect, useRef} from 'react';
import {fabric, useCanvas} from 'fabric';
import styles from '../styles/Home.module.css';
import { redirect } from 'next/dist/server/api-utils';


export default function Canvas(props) {
    const imgRef = useRef(null);
    const canvasRef = useRef(null);


    // useEffect(() => {
    //     //console.log(canvasRef.current); //print out canvas
    //     const canvas = new fabric.Canvas('canvas', {
    //         height: 800,
    //         width: 800,
    //         backgroundColor: 'pink'
    //     })

    //     const image = new fabric.Image('image', {
    //         height: 600,
    //         width: 500,
    //         backgroundColor: 'blue'
    //     })
        
    //     canvas.add(image);
        
    //   }
    // )

    useEffect(() => {
        //console.log(canvasRef.current); //print out canvas
        const canvas = new fabric.Canvas(canvasRef.current, {
            width: 650,
            height: 500,
        })

        imgRef.current = new fabric.Image.fromURL(props.img, (img)=>{
            // img is this image object, do everything to it like outside this constructor
            // scale img to fit in canvas: img.set({scaleX:..., scaleY:...})
            canvas.add(img);
        })

        // const image = new fabric.Image(imgRef.current, {
        //     // width: 400,
        //     // height: 300,
        //     // // borderColor: 'red',
        //     // backgroundColor: 'red',
        // })
        
        // // scale image to fit in the canvas
        // const scale = Math.min(canvas.width/image.width, canvas.height/image.height);
        // image.set({scaleX: scale, scaleY: scale});
        // // align image to the center, css styling doesn't work
        // const offsetX = (canvas.width - image.width * scale) / 2;
        // const offsetY = (canvas.height - image.height * scale) / 2;
        // if (offsetX > 0) {
        //     image.set({left: offsetX});
        // } else {
        //     image.set({top: offsetY});
        // }
        
        
        // // const resizeFilter = new fabric.Image.filters.Resize();
        // // image.filters.push(resizeFilter);
        // // image.applyFilters();
        // console.log(image.width, image.height, image.borderColor, image.id);
        // canvas.add(image);
  
        
      }
    )
    


    return (
        <div>
            <canvas ref={canvasRef} className={styles.canvas} >
                <img ref={imgRef} src={props.img} className={styles.image} alt="img"/>
            </canvas>
        </div>
      )
}