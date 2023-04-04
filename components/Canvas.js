import React, {useState, useEffect, useRef} from 'react';
import {fabric, useCanvas} from 'fabric';
import styles from '../styles/Home.module.css';


const WHEEL_SENSITIVITY = 10;


export default function Canvas(props) {
    // const imgRef = useRef(null);
    // const canvasRef = useRef(null);
    const [canvas, setCanvas] = useState(null);
    const [image, setImage] = useState(null);

    // if (canvas && image) {
    //     // console.log('here');
    //     // console.log(canvas);
    //     initialize(canvas, image);
    // }


    // function initialize(canvas, image) {
    //     console.log('init');
    //     scaleImage(image, canvas);
    //     canvas.add(image);
        
    //     console.log(canvas);
    //     console.log(image);
    //     // canvas.on('mouse:wheel', (opt) => {
    //     //     console.log('wheel');
    //     //     let zoom = canvas.getZoom();
    //     //     // zoom *= 0.999 ** (-opt.e.deltaY);
    //     //     zoom += opt.e.deltaY * WHEEL_SENSITIVITY /10000;
    //     //     zoom = Math.max(1, zoom);
    //     //     canvas.zoomToPoint({x: opt.e.offsetX, y: opt.e.offsetY}, zoom);
    //     //     opt.e.preventDefault();
    //     //     opt.e.stopPropagation();
    //     // })

    //     canvas.on('mouse:down', function(opt) {
    //         console.log('mouse down');
    //         var evt = opt.e;
            
    //         if (evt.altKey === true) {
    //           this.isDragging = true;
    //           this.selection = false;
    //           this.lastPosX = evt.clientX;
    //           this.lastPosY = evt.clientY;
    //         }
    //         console.log(evt);
    //       });
        
    //     setCanvas(canvas);
    // }
    
    useEffect(() => {
        if (!canvas && !image) {
            const canvas_obj = new fabric.Canvas('canvas', {
                width: 650,
                height: 500,
            });
            const image_obj = new fabric.Image('image', {
                selectable: false,
            });

            scaleImage(canvas_obj, image_obj);
            canvas_obj.add(image_obj);

            // zoom in/out
            canvas_obj.on('mouse:wheel', (opt) => {
                wheelHandler(opt.e, canvas_obj);
            })

            // drag image (mouse down + alt/option key down)
            canvas_obj.on('mouse:down', (opt) => {
                mouseDownHandler(opt.e, canvas_obj);
            });
            canvas_obj.on('mouse:move', (opt) => {
                mouseMoveHandler(opt.e, canvas_obj);
            });
            canvas_obj.on('mouse:up', () => {
                mouseUpHandler(canvas_obj);
            });
            console.log('before move', canvas_obj.viewportTransform);

            setImage(image_obj);
            setCanvas(canvas_obj);
        }
      }, [props]
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
        setImage(image);
    }

    function wheelHandler(e, canvas) {
        let zoom = canvas.getZoom();
        // zoom *= 0.999 ** (-opt.e.deltaY);
        zoom += e.deltaY * WHEEL_SENSITIVITY /10000;
        zoom = Math.max(1, zoom);
        console.log('before zoom', canvas.viewportTransform);
        console.log(canvas);
        canvas.zoomToPoint({x: e.offsetX, y: e.offsetY}, zoom);
        console.log('after zoom', canvas.viewportTransform);
        console.log(canvas);
        e.preventDefault();
        e.stopPropagation();
    }

    function mouseDownHandler(e, canvas) {
        console.log('mouse down');
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
            console.log('dragging', e.clientX - canvas.lastPosX, e.clientY - canvas.lastPosY, vpt);
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
            <canvas id='canvas' className={styles.canvas} >
                <img id='image' src={props.img} className={styles.image} alt="img"/>
            </canvas>
        </div>
      )
}