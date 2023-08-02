import React, {useState, useEffect, useRef} from 'react';
import styles from '../styles/Canvas.module.css';
import {Button} from 'react-bootstrap';
import {fabric} from 'fabric';


const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 500;
const CIRCLE_RADIUS = 10;
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
    const editPolygon = useRef(false);

    
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

            

            
            // canvasObj.on('mouse:down', //(opt) => {
            //     mouseDownHandler//(opt.e, canvasObj);
            // );
            
            
            

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

        // zoom in/out
        canvasObjRef.current.on('mouse:wheel', (opt) => {
            wheelHandler(opt.e, canvasObjRef.current);
        })
        canvasObjRef.current.on('mouse:down', (opt) => {
            mouseDownHandler(opt.e, canvasObjRef.current);
        });
        canvasObjRef.current.on('mouse:dblclick', mouseDblclickHandler);
        canvasObjRef.current.on('mouse:move', (opt) => {
            mouseMoveHandler(opt.e, canvasObjRef.current);
        });
        canvasObjRef.current.on('mouse:up', () => {
            mouseUpHandler(canvasObjRef.current);
        });

        console.log(canvasObjRef.current.__eventListeners);

        return () => {
            const eventListeners = canvasObjRef.current.__eventListeners;
            Object.keys(eventListeners).forEach(key => eventListeners[key]=[]);
            
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


    function mouseDblclickHandler(opt) {
        console.log('dbclick');
        // console.log(canvasObjRef.current.getActiveObject());
        const canvas = canvasObjRef.current;
        if (canvas.getActiveObject() && canvas.getActiveObject().type === 'polygon') {
            const polygon = canvas.getActiveObject();
            // console.log('polygon1 ', polygon);
            canvas.editPolygon = true;
            canvas.editingPolygonId = polygon.id;
            // editPolygon.current = true;
            // polygon.cornerColor = 'red';
            // polygon.cornerStrokeColor = 'white';
            polygon.pointObjects.forEach(obj=>canvas.add(obj));
            polygon.lineObjects.forEach(obj=>canvas.add(obj));
            canvas.remove(polygon);
        }

        
    }

    function mouseDownHandler(e, canvas) {
        console.log('mouse down');

        // drag image (mouse down + alt/option key down)
        if (e.altKey === true) {
            canvas.isDragging = true;
            canvas.selection = false;
            canvas.lastPosX = e.clientX;
            canvas.lastPosY = e.clientY;
        }
        
        // console.log(props.drawPolygon);
        if (props.drawPolygon === true) {
            canvas.selection = false;

            const clickPoint = canvas.getPointer();
            console.log(clickPoint);
           
            if (canvas.polygonPoints.length==0 && canvas.polygonLines.length==0) {
                const point = createPoint(clickPoint, 'red');
                canvas.add(point).setActiveObject(point);
                canvas.polygonPoints.push(point);
                // console.log(point.getCenterPoint(), point.getCoords());
            } else if (canvas.polygonPoints.length - canvas.polygonLines.length == 1) {
                const startPoint = canvas.polygonPoints[0].getCenterPoint();
                if (Math.abs(startPoint.x - clickPoint.x) <= CLICK_TOLERANCE 
                && Math.abs(startPoint.y - clickPoint.y) <= CLICK_TOLERANCE 
                && canvas.polygonPoints.length >= 3) {
                    const prePoint = canvas.polygonPoints[canvas.polygonPoints.length-1].getCenterPoint();
                    const line = createLine(prePoint, startPoint, 'red');
                    canvas.polygonLines.push(line);
                    canvas.add(line);
                    // console.log(canvas.polygonPoints.map(p => p.getCenterPoint()));
                    const polygonObj = new fabric.Polygon(
                        canvas.polygonPoints.map(p => p.getCenterPoint()), {
                            id: polygonObjListRef.current.length, ////
                            type: 'polygon',
                            stroke: 'red',
                            strokeWidth: 1,
                            fill: false,
                            edit: false, ////
                            pointObjects: [...canvas.polygonPoints], ////
                            lineObjects: [...canvas.polygonLines], ////
                        }
                    );
    
                    polygonObjListRef.current = [...polygonObjListRef.current, polygonObj];
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

        if (canvas.editPolygon) {
            const polygon = polygonObjListRef.current.filter(obj=>obj.id===canvas.editingPolygonId)[0];
            console.log(polygon);
            if (!canvas.getActiveObject()) {
                //TODO
            }
            else if (canvas.getActiveObject().type === 'polygonPoint') {
                console.log('selected');
                
                const point = canvas.getActiveObject();
                // console.log(polygonObjListRef.current[point.owner]);
                canvas.dragPoint = true;
                // dragPoint.current = true;
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

        if (canvas.dragPoint) {
            console.log('dragging');
            const point = canvas.getActiveObject();
            // console.log('point ', point);
            const polygon = polygonObjListRef.current[point.owner];
            // console.log('polygon ', polygon);
            const prePointIndex = point.index>0 ? point.index-1 : polygon.lineObjects.length-1;
            const postPointIndex = point.index<polygon.pointObjects.length-1 ? point.index+1 : 0;
            const newPreLine = createLine(polygon.pointObjects[prePointIndex].getCenterPoint(), point.getCenterPoint(), polygon.stroke);
            const newPostLine = createLine(point.getCenterPoint(), polygon.pointObjects[postPointIndex].getCenterPoint(), polygon.stroke);
            canvas.remove(polygon.lineObjects[prePointIndex]);
            canvas.remove(polygon.lineObjects[point.index]); //postLineIndex==pointIndex
            polygon.lineObjects[prePointIndex] = newPreLine;
            polygon.lineObjects[point.index] = newPostLine;
            canvas.add(newPreLine);
            canvas.add(newPostLine)
        }
    }
    
    function mouseUpHandler(canvas) {
        // on mouse up we want to recalculate new interaction
        // for all objects, so we call setViewportTransform
        canvas.setViewportTransform(canvas.viewportTransform);
        canvas.isDragging = false;
        canvas.selection = true;

        canvas.dragPoint = false;
    }

    
    function createPoint(clickPoint, color) {
        const point = new fabric.Circle({
            left: clickPoint.x - CIRCLE_RADIUS, //pointer.x,
            top: clickPoint.y - CIRCLE_RADIUS,  //pointer.y,
            radius: CIRCLE_RADIUS,
            strokeWidth: 1,
            stroke: color,
            fill: color,
            lockScalingX: true,
            lockScalingY: true,
            type: 'polygonPoint', ////
            owner: 0, ////
            index: canvasObjRef.current.polygonPoints.length, ////
        })
        return point;
    }

    function createLine(startPoint, endPoint, color) {
        const line = new fabric.Line([
            startPoint.x, startPoint.y, endPoint.x, endPoint.y
        ], {
            strokeWidth: 1,
            stroke: color,
            selectable: false,
            type: 'polygonLine', ////
            owner: 0, ////
            index: canvasObjRef.current.polygonLines.length, ////
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