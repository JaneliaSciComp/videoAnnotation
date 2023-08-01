import React, {useState, useEffect, useRef} from 'react';
import styles from '../styles/Canvas.module.css';
import {Button} from 'react-bootstrap';
import {fabric} from 'fabric';


const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 500;
const CIRCLE_RADIUS = 4;
const WHEEL_SENSITIVITY = 10;
const CLICK_TOLERANCE = 5;


export default function Canvas(props) {
    // const imgRef = useRef(null);
    // const canvasRef = useRef(null);
    // const [canvas, setCanvas] = useState(null);
    // const [image, setImage] = useState(null);
    const canvasObjRef = useRef(null);
    const imageObjRef = useRef(null);
    const rectObjListRef = useRef([]);
    const preRectIdListRef = useRef([...props.rectIdList]); // to remember previous rect ids
    const polygonObjListRef = useRef([]);

    
    console.log('canvas render');

    //Set up canvas
    useEffect(() => {
        //console.log(fabric.Object.prototype);

        if (!canvasObjRef.current && !imageObjRef.current) {
            const canvasObj = new fabric.Canvas('canvas', {
                //TODO
                width: CANVAS_WIDTH,
                height: CANVAS_HEIGHT,
                polygonPoints: [],
                polygonLines:[],
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
            // canvasObj.on('mouse:down', (opt) => {
            //     mouseDownHandler(opt.e, canvasObj);
            // });
            canvasObj.on('mouse:move', (opt) => {
                mouseMoveHandler(opt.e, canvasObj);
            });
            canvasObj.on('mouse:up', () => {
                mouseUpHandler(canvasObj);
            });
            


            // add delete key event listener
            document.onkeydown = (e) => {
                if ((e.key === 'Backspace' || e.key === 'Delete') && canvasObj.getActiveObject()) {
                    removeRect(canvasObj);
                }
                // console.log(e.key); // Backspace
                // console.log(e.keyCode); // 8
            }
            

            canvasObjRef.current = canvasObj;
            imageObjRef.current = imageObj;
        }

        canvasObjRef.current.on('mouse:down', (opt) => {
            mouseDownHandler(opt.e, canvasObjRef.current);
        });

        // console.log(canvasObjRef.current.__eventListeners["mouse:down"]);

        return () => {
            canvasObjRef.current.__eventListeners["mouse:down"] = [];
            
        }
      }, [props]
    )

    // function canvasbtnclick() {
    //     console.log(props.rectIdList.length);
    //     removeRect(canvasObjRef.current);
    //     console.log(props.rectIdList.length);
    // }

    
    // draw newly added rect
    useEffect(() => {
        // console.log(props.rectIdList.length, preRectIdListRef.current);
        if (props.rectIdList.length > preRectIdListRef.current.length) {
            drawRect(props.rectIdList[props.rectIdList.length-1]);
            // console.log('rectObjList length: ', rectObjListRef.current);
            preRectIdListRef.current = [...preRectIdListRef.current, props.rectIdList[props.rectIdList.length-1]];
            // console.log(preRectIdListRef.current, props.rectIdList.length);
        }
        
      }
      , [props.rectIdList]
    )


    function drawRect(idObj) {
        const recObj = new fabric.Rect({
            id: idObj.id,
            label: idObj.label,
            type: idObj.type,
            width: 50,
            height:50,
            stroke: idObj.color,
            strokeWidth: 1,
            fill: null,
            lockRotation: true,
            lockScalingFlip: true,
            lockSkewingX: true,
            lockSkewingY: true,
        });
        // console.log(recObj);
        rectObjListRef.current = [...rectObjListRef.current, recObj];
        // console.log(rectObjListRef.current.length);
        canvasObjRef.current.add(recObj).setActiveObject(recObj);

    }


    function removeRect(canvasObj){
        // remove rectObj from canvas, remove rectIdObj in parent
        const activeObj = canvasObj.getActiveObject();
        if (activeObj.type === 'rect') {
            rectObjListRef.current = rectObjListRef.current.filter(Obj =>  Obj.id !== activeObj.id)
            preRectIdListRef.current = preRectIdListRef.current.filter(obj => obj.id !== activeObj.id);
            props.resetRectaIdList([...preRectIdListRef.current]);
            // console.log(rectObjListRef.current.length, preRectIdListRef);
        }
        canvasObj.remove(activeObj);
    }

    
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
        // console.log('scaled: ', image.getScaledWidth(), image.getScaledHeight());
        // console.log('original: ', image.get('width'), image.get('height'));
        console.log(image);
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
        // console.log(canvas.getZoom(), canvas.getWidth());
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
        
        // console.log(props.drawPolygon);
        if (props.drawPolygon === true) {
            canvas.selection = false;
            // const polygonObj = new fabric.Polygon([
            //     {x:100, y:100}, {x:150, y:100}, {x:125, y:150}
            // ], {
            //     stroke: 'red',
            //     strokeWidth: 1,
            // });

            // console.log(canvas);

            const clickPoint = canvas.getPointer();
            console.log(clickPoint);
           
            if (canvas.polygonPoints.length==0 && canvas.polygonLines.length==0) {
                const point = createPoint(clickPoint, 'red');
                canvas.add(point).setActiveObject(point);
                canvas.polygonPoints.push(point);
                // console.log(point.getCenterPoint(), point.getCoords());
            } else if (canvas.polygonPoints.length - canvas.polygonLines.length == 1) {
                const startPoint = canvas.polygonPoints[0].getCenterPoint();
                if (Math.abs(startPoint.x - clickPoint.x) <= CLICK_TOLERANCE && Math.abs(startPoint.y - clickPoint.y) <= CLICK_TOLERANCE) {
                    const prePoint = canvas.polygonPoints[canvas.polygonPoints.length-1].getCenterPoint();
                    const line = createLine(prePoint, startPoint, 'red');
                    canvas.polygonLines.push(line);
                    canvas.add(line);
                    // console.log(canvas.polygonPoints.map(p => p.getCenterPoint()));
                    const polygonObj = new fabric.Polygon(
                        canvas.polygonPoints.map(p => p.getCenterPoint()), {
                            stroke: 'red',
                            strokeWidth: 1,
                            fill: false
                        }
                    );
                    // console.log(polygonObj)
                    canvas.add(polygonObj).setActiveObject(polygonObj);
                    canvas.polygonPoints.forEach(p=>canvas.remove(p));
                    canvas.polygonLines.forEach(l=>canvas.remove(l));
                    canvas.polygonPoints = [];
                    canvas.polygonLines = [];
                    canvas.selection = true;
                    props.setDrawPolygon(false);

                } else {
                    const prePoint = canvas.polygonPoints[canvas.polygonPoints.length-1].getCenterPoint();
                    const point = createPoint(clickPoint, 'red');
                    canvas.add(point).setActiveObject(point);
                    canvas.polygonPoints.push(point);
                    const line = createLine(prePoint, point.getCenterPoint(), 'red');
                    canvas.add(line);  //.setActiveObject(point);
                    // canvas.renderAll();
                    canvas.polygonLines.push(line);
                }
            }
        }
            
    }
    

    function mouseMoveHandler(e, canvas) {
        if (canvas.isDragging) {
            let vpt = canvas.viewportTransform;
            let zoom = canvas.getZoom();
            let tempX = vpt[4] + e.clientX - canvas.lastPosX;
            let tempY = vpt[5] + e.clientY - canvas.lastPosY;
            // Doesn't let drag go infinitely
            vpt[4] = Math.max(Math.min(0, tempX), canvas.getWidth() - canvas.getWidth()*zoom);
            vpt[5] = Math.max(Math.min(0, tempY), canvas.getHeight() - canvas.getHeight()*zoom);
            // Free drag
            // vpt[4] += e.clientX - canvas.lastPosX;
            // vpt[5] += e.clientY - canvas.lastPosY;
            // console.log(canvas.viewportTransform);
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

    
    function createPoint(clickPoint, color) {
        const point = new fabric.Circle({
            left: clickPoint.x - CIRCLE_RADIUS, //pointer.x,
            top: clickPoint.y - CIRCLE_RADIUS,  //pointer.y,
            radius: CIRCLE_RADIUS,
            strokeWidth: 1,
            stroke: color,
            fill: color,
        })
        return point;
    }

    function createLine(startPoint, endPoint, color) {
        const line = new fabric.Line([
            startPoint.x, startPoint.y, endPoint.x, endPoint.y
        ], {
            strokeWidth: 1,
            stroke: color,
        })
        return line;
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
            {/* <Button onClick={canvasbtnclick}>test</Button> */}
        </div>
      )
}