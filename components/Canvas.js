import React, {useState, useEffect, useRef} from 'react';
import {fabric, useCanvas} from 'fabric';
import {Button} from 'react-bootstrap';
import styles from '../styles/Home.module.css';
import { NodeNextRequest } from 'next/dist/server/base-http/node';


const WHEEL_SENSITIVITY = 10;


export default function Canvas(props) {
    // const imgRef = useRef(null);
    // const canvasRef = useRef(null);
    // const [canvas, setCanvas] = useState(null);
    // const [image, setImage] = useState(null);
    const canvasObjRef = useRef(null);
    const imageObjRef = useRef(null);


    function recBtnHandler() {
        console.log('add rec', canvasObjRef.current);
        const rec_obj = new fabric.Rect({
            width: 50,
            height:50,
            stroke: 'red',
            strokeWidth: 2,
            fill: null,
        });
        canvasObjRef.current.add(rec_obj).setActiveObject(rec_obj).renderAll();
        // canvasObjRef.current.add(rec_obj);
        // canvasObjRef.current.renderAll();
        console.log(canvasObjRef.current);
      }
    
    useEffect(() => {
        if (!canvasObjRef.current && !imageObjRef.current) {
            const canvasObj = new fabric.Canvas('canvas', {
                width: 650,
                height: 500,
            });
            const imageObj = new fabric.Image('image', {
                selectable: false,
            });

            scaleImage(canvasObj, imageObj);
            canvasObj.add(imageObj);

            // zoom in/out
            canvasObj.on('mouse:wheel', (opt) => {
                wheelHandler(opt.e, canvasObj);
            })

            // drag image (mouse down + alt/option key down)
            canvasObj.on('mouse:down', (opt) => {
                mouseDownHandler(opt.e, canvasObj);
            });
            canvasObj.on('mouse:move', (opt) => {
                mouseMoveHandler(opt.e, canvasObj);
            });
            canvasObj.on('mouse:up', () => {
                mouseUpHandler(canvasObj);
            });
            // console.log('before move', canvas_obj.viewportTransform);

            // setImage(image_obj);
            // setCanvas(canvas_obj);
            canvasObjRef.current = canvasObj;
            imageObjRef.current = imageObj;
        }
      }
      //, [props]
    )
    
    function scaleImage(canvas, image) { //image, canvas
        // scale image to fit in the canvas
        const scale = Math.min(canvas.width/image.width, canvas.height/image.height);
        image.set({scaleX: scale, scaleY: scale});
        // align image to the center, css styling doesn't work
        const offsetX = (canvas.width - image.width * scale) / 2;
        const offsetY = (canvas.height - image.height * scale) / 2;
        if (offsetX > 0) {
            image.set({left: offsetX});
        } else {
            image.set({top: offsetY});
        }
    }

    function wheelHandler(e, canvas) {
        let zoom = canvas.getZoom();
        // zoom *= 0.999 ** (-opt.e.deltaY);
        zoom += e.deltaY * WHEEL_SENSITIVITY /10000;
        zoom = Math.max(1, zoom);
        // console.log('before zoom', canvas.viewportTransform);
        // console.log(canvas);
        canvas.zoomToPoint({x: e.offsetX, y: e.offsetY}, zoom);
        // console.log('after zoom', canvas.viewportTransform);
        // console.log(canvas);
        e.preventDefault();
        e.stopPropagation();
    }

    function mouseDownHandler(e, canvas) {
        // console.log('mouse down');
        if (e.altKey === true) {
            canvas.isDragging = true;
            canvas.selection = false;
            canvas.lastPosX = e.clientX;
            canvas.lastPosY = e.clientY;
        }
        //console.log(canvas); 
    }

    function mouseMoveHandler(e, canvas) {
        if (canvas.isDragging) {
            let vpt = canvas.viewportTransform;
            // vpt[4] += e.clientX - canvas.lastPosX;
            let tempX = vpt[4] + e.clientX - canvas.lastPosX;
            tempX = Math.max(0, tempX);
            vpt[4] = Math.min(tempX, 650);
            vpt[5] += e.clientY - canvas.lastPosY;
            // console.log('dragging', e.clientX - canvas.lastPosX, e.clientY - canvas.lastPosY, vpt);
            canvas.requestRenderAll();
            canvas.lastPosX = e.clientX;
            canvas.lastPosY = e.clientY;
        }
    }
    
    function mouseUpHandler(canvas) {
        // on mouse up we want to recalculate new interaction
        // for all objects, so we call setViewportTransform
        canvas.setViewportTransform(canvas.viewportTransform);
        canvas.isDragging = false;
        canvas.selection = true;
    }

    // ref={canvasRef} ref={imgRef} 

    return (
        <div>
            <div className='tool-bar my-3 d-flex '>
                <Button onClick={recBtnHandler}>Rectangle</Button>
            </div>
            <canvas id='canvas' className={styles.canvas} >
                <img id='image' src={props.img} className={styles.image} alt="img"/>
            </canvas>
        </div>
      )
}