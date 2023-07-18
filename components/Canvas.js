import React, {useState, useEffect, useRef} from 'react';
import styles from '../styles/Canvas.module.css';

import {fabric} from 'fabric';


const WHEEL_SENSITIVITY = 10;


export default function Canvas(props) {
    // const imgRef = useRef(null);
    // const canvasRef = useRef(null);
    // const [canvas, setCanvas] = useState(null);
    // const [image, setImage] = useState(null);
    const canvasObjRef = useRef(null);
    const imageObjRef = useRef(null);


    function recBtnHandler() {
        const recObj = new fabric.Rect({
            width: 50,
            height:50,
            stroke: 'red',
            strokeWidth: 1,
            fill: null,
            lockRotation: true,
            lockScalingFlip: true,
            lockSkewingX: true,
            lockSkewingY: true,
        });
        // console.log(recObj);
        canvasObjRef.current.add(recObj).setActiveObject(recObj);
      }
    
    useEffect(() => {
        //console.log(fabric.Object.prototype);

        if (!canvasObjRef.current && !imageObjRef.current) {
            const canvasObj = new fabric.Canvas('canvas', {
                width: 600,
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
            canvasObj.on('key:down', (opt) => {
                console.log(opt.e.key);
            })

            // add delete key event listener
            document.onkeydown = (e) => {
                if ((e.key === 'Backspace' || e.key === 'Delete') && canvasObj.getActiveObject()) {
                    canvasObj.remove(canvasObj.getActiveObject());
                }
                // console.log(e.key); // Backspace
                // console.log(e.keyCode); // 8
            }
            
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
        console.log('scaled: ', image.getScaledWidth(), image.getScaledHeight());
        console.log('original: ', image.get('width'), image.get('height'));
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
            vpt[4] += e.clientX - canvas.lastPosX;
            // let tempX = vpt[4] + e.clientX - canvas.lastPosX;
            // tempX = Math.max(0, tempX);
            // vpt[4] = Math.min(tempX, 650);
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
            {/* <div className='tool-bar my-3 d-flex '>
                <Button onClick={recBtnHandler}>Rectangle</Button>
            </div> */}
            <canvas id='canvas' className={styles.canvas} >
                <img id='image' src={props.img} className={styles.image} alt="img"/>
            </canvas>
        </div>
      )
}