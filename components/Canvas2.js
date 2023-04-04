import React, {useState, useEffect, useRef} from 'react';
import {fabric, useCanvas} from 'fabric';
import styles from '../styles/Home.module.css';


const WHEEL_SENSITIVITY = 10;


export default function Canvas(props) {
    // const imgRef = useRef(null);
    // const canvasRef = useRef(null);
    const [canvas, setCanvas] = useState(null);
    const [image, setImage] = useState(null);

    if (canvas && image) {
        console.log('here');
        console.log(image);
        initialize(canvas, image);
    }

    function initialize(canvas, image) {
        console.log('init');
        scaleImage(image, canvas);
        canvas.add(image);
        
    //     console.log(canvas);
    //     console.log(image);
    //     canvas.on('mouse:wheel', (opt) => {
    //         console.log('wheel');
    //         let zoom = canvas.getZoom();
    //         // zoom *= 0.999 ** (-opt.e.deltaY);
    //         zoom += opt.e.deltaY * WHEEL_SENSITIVITY /10000;
    //         zoom = Math.max(1, zoom);
    //         canvas.zoomToPoint({x: opt.e.offsetX, y: opt.e.offsetY}, zoom);
    //         opt.e.preventDefault();
    //         opt.e.stopPropagation();
        // })

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
    }
    
    useEffect(() => {
        setImage(new fabric.Image.fromURL(props.img, (img)=>{
            // selectable: true,
        }), console.log(image));
        
        setCanvas(new fabric.Canvas('canvas', {
            width: 650,
            height: 500,
        }))

        // const canvas = new fabric.Canvas('canvas', {
        //     width: 650,
        //     height: 500,
        // })

        // console.log(canvas);
        // console.log(canvasRef.current);
        // console.log(canvas===canvasRef.current);
        // imgRef.current = new fabric.Image.fromURL(props.img, (img)=>{
        //     // img is this image object, do everything to it like outside this constructor
        //     // scale img to fit in canvas: img.set({scaleX:..., scaleY:...})
        //     canvas.add(img);
        // })

        

        // const image = new fabric.Image('image')
        // scaleImage(image, canvas);
        // canvas.add(image);
    //     // // const resizeFilter = new fabric.Image.filters.Resize();
    //     // // image.filters.push(resizeFilter);
    //     // // image.applyFilters();

    //     canvas.on('mouse:wheel', (opt) => {
    //         let zoom = canvas.getZoom();
    //         // zoom *= 0.999 ** (-opt.e.deltaY);
    //         zoom += opt.e.deltaY * WHEEL_SENSITIVITY /10000;
    //         zoom = Math.max(1, zoom);
    //         canvas.zoomToPoint({x: opt.e.offsetX, y: opt.e.offsetY}, zoom);
    //         opt.e.preventDefault();
    //         opt.e.stopPropagation();
    //     })

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
        
    //       canvas.on('mouse:move', function(opt) {
    //         if (this.isDragging) {
    //           var e = opt.e;
    //           var vpt = this.viewportTransform;
    //           vpt[4] += e.clientX - this.lastPosX;
    //           vpt[5] += e.clientY - this.lastPosY;
    //           this.requestRenderAll();
    //           this.lastPosX = e.clientX;
    //           this.lastPosY = e.clientY;
    //         }
    //       });
    //       canvas.on('mouse:up', function(opt) {
    //         // on mouse up we want to recalculate new interaction
    //         // for all objects, so we call setViewportTransform
    //         this.setViewportTransform(this.viewportTransform);
    //         this.isDragging = false;
    //         this.selection = true;
    //       });
              
      }, [props]
    )
    
    function scaleImage() { //image, canvas
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

    function WheelHandler(e) {
        let zoom = canvas.getZoom();
        // zoom *= 0.999 ** (-opt.e.deltaY);
        zoom += opt.e.deltaY * WHEEL_SENSITIVITY /10000;
        zoom = Math.max(1, zoom);
        canvas.zoomToPoint({x: e.offsetX, y: e.offsetY}, zoom);
        e.preventDefault();
        opt.e.stopPropagation();
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