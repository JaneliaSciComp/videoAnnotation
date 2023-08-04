import React, {useState, useEffect, useRef} from 'react';
import styles from '../styles/Canvas.module.css';
import {Button} from 'react-bootstrap';
import {fabric} from 'fabric';


const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 500;
const CIRCLE_RADIUS = 3;
const STROKE_WIDTH = 2;
const WHEEL_SENSITIVITY = 10;
const CLICK_TOLERANCE = 5;


export default function Canvas(props) {
    const canvasObjRef = useRef(null);
    const imageObjRef = useRef(null);
    const rectObjListRef = useRef([]);
    // const preRectIdListRef = useRef([...props.rectIdList]); // to remember previous rect ids
    const polygonObjListRef = useRef({});

    
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
                polygonLines: [],
                rectLines: [],
                hoverCursor: 'pointer',
            });
            const imageObj = new fabric.Image('image', {
                selectable: false,
            });

            scaleImage(canvasObj, imageObj);
            canvasObj.add(imageObj);
            
            // canvasObj.on('mouse:down', //(opt) => {
            //     mouseDownHandler//(opt.e, canvasObj);
            // );

            canvasObjRef.current = canvasObj;
            imageObjRef.current = imageObj;
        }

        canvasObjRef.current.on('mouse:wheel', wheelHandler);
        canvasObjRef.current.on('mouse:down', mouseDownHandler);
        canvasObjRef.current.on('mouse:dblclick', mouseDblclickHandler);
        canvasObjRef.current.on('mouse:move', mouseMoveHandler);
        canvasObjRef.current.on('mouse:up', mouseUpHandler);
        document.addEventListener("keydown", deleteKeyHandler); // add delete key event listener

        // console.log(canvasObjRef.current.__eventListeners);

        return () => {
            const eventListeners = canvasObjRef.current.__eventListeners;
            Object.keys(eventListeners).forEach(key => eventListeners[key]=[]);
            document.removeEventListener("keydown", deleteKeyHandler);
        }
      }, [props]
    )

    
    // draw newly added rect
    // useEffect(() => {
    //     // console.log(props.rectIdList.length, preRectIdListRef.current);
    //     if (props.drawRect) {
    //         createRect();
    //         // console.log('rectObjList length: ', rectObjListRef.current);
    //         // console.log(preRectIdListRef.current, props.rectIdList.length);
    //     }
    //   }
    //   , [props.rectIdList]
    // )


    function createRect() {
        const canvas = canvasObjRef.current;
        const idObj = canvas.rectIdObjToDraw;
        const startPos = canvas.rectStartPosition;
        const endPos = canvas.rectEndPosition;
        canvas.selection = false;

        const rectObj = new fabric.Rect({
            id: idObj.id,
            label: idObj.label,
            type: idObj.type,
            //left,top,width,height need to consider user's drag direction
            left: Math.min(startPos.x, endPos.x),
            top: Math.min(startPos.y, endPos.y),
            width: Math.abs(endPos.x - startPos.x),
            height: Math.abs(endPos.y - startPos.y),
            stroke: idObj.color,
            strokeWidth: STROKE_WIDTH,
            strokeUniform: true,
            fill: null,
            lockRotation: true,
            lockScalingFlip: true,
            lockSkewingX: true,
            lockSkewingY: true,
            hasRotatingPoint: false
        });
        // console.log(recObj);
        rectObjListRef.current = {...rectObjListRef.current, [rectObj.id]: rectObj};
        // console.log(rectObjListRef.current.length);
        canvas.add(rectObj).setActiveObject(rectObj);
        canvas.rectStartPosition = null;
        canvas.rectEndPosition = null;
        canvas.rectIdObjToDraw = null;
        canvas.rectLines.forEach(l => canvas.remove(l));
        canvas.rectLines = [];
        props.setDrawRect(false);
        canvas.selection = true;
    }


    function drawRect() {
        const canvas = canvasObjRef.current;
        const idObj = canvas.rectIdObjToDraw;
        const corner1 = canvas.rectStartPosition;
        const corner3 = canvas.getPointer();
        const corner2 = {x: corner1.x, y: corner3.y};
        const corner4 = {x: corner3.x, y: corner1.y};
        const line1 = createLine(corner1, corner2, idObj);
        canvas.add(line1);
        const line2 = createLine(corner2, corner3, idObj);
        canvas.add(line2);
        const line3 = createLine(corner3, corner4, idObj);
        canvas.add(line3);
        const line4 = createLine(corner4, corner1, idObj);
        canvas.add(line4);
        if (canvas.rectLines.length == 4) {
            canvas.rectLines.forEach(l => canvas.remove(l));
            canvas.rectLines = [];
        }
        canvas.rectLines.push(line1);
        canvas.rectLines.push(line2);
        canvas.rectLines.push(line3);
        canvas.rectLines.push(line4);
    }


    function removeObj(){
        // remove obj from canvas, objListRef, remove idObj in parent
        const canvas = canvasObjRef.current;
        const activeObj = canvas.getActiveObject();
        switch (activeObj.type) {
            case 'rect':
                // rectObjListRef.current = rectObjListRef.current.filter(Obj =>  Obj.id !== activeObj.id)
                // preRectIdListRef.current = preRectIdListRef.current.filter(obj => obj.id !== activeObj.id);
                // props.setRectIdList([...preRectIdListRef.current]);
                delete(rectObjListRef.current[activeObj.id]);
                const newRectIdList = {...props.rectIdList};
                delete(newRectIdList[activeObj.id]);
                props.setRectIdList(newRectIdList);
                // console.log(rectObjListRef.current, props.rectIdList);
            case 'polygon':
                // console.log(polygonObjListRef.current, Object.keys(props.polygonIdList));
                delete(polygonObjListRef.current[activeObj.id]);
                const newPolygonIdList = {...props.polygonIdList};
                delete(newPolygonIdList[activeObj.id]);
                // console.log(newIdList);
                props.setPolygonIdList(newPolygonIdList);
                // console.log(polygonObjListRef.current, props.polygonIdList);
        }
        
        canvas.remove(activeObj);
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
        // console.log(image);
    }


    function wheelHandler(opt) {
        // zoom in/out
        const e = opt.e;
        const canvas = canvasObjRef.current;
        let zoom = canvas.getZoom();
        // zoom *= 0.999 ** (-opt.e.deltaY);
        zoom += e.deltaY * WHEEL_SENSITIVITY /10000;
        zoom = Math.max(1, zoom);
        canvas.zoomToPoint({x: e.offsetX, y: e.offsetY}, zoom);
        e.preventDefault();
        e.stopPropagation();
    }


    function mouseDblclickHandler() {
        console.log('dbclick');
        // console.log(canvasObjRef.current.getActiveObject());
        const canvas = canvasObjRef.current;
        if (canvas.getActiveObject() && canvas.getActiveObject().type === 'polygon') {
            // const p = new fabric.Point(20,20);
            // canvas.add(p);
            const polygon = canvas.getActiveObject();
            console.log(polygon);
            console.log('own matrix', polygon.calcOwnMatrix());
            console.log('matrix', polygon.calcTransformMatrix());
            canvas.editPolygon = true;
            canvas.editingPolygonId = polygon.id;

            console.log('points', polygon.points);
            console.log(polygon.pathOffset, polygon.getCenterPoint());
            const matrix = polygon.calcTransformMatrix();
            const newPoints = polygon.points.map(p => new fabric.Point(p.x - polygon.pathOffset.x, p.y - polygon.pathOffset.y))
                .map(p => fabric.util.transformPoint(p, matrix));
            console.log('new points', newPoints);
            const idObjToEdit = props.polygonIdList[polygon.id];
            polygon.pointObjects = newPoints.map((p, i) => createPoint(p, idObjToEdit, i));
            polygon.lineObjects = newPoints.map((p, i) => i<newPoints.length-1 ? createLine(p, newPoints[i+1], props.polygonIdList[polygon.id]) : createLine(p, newPoints[0], idObjToEdit))
            console.log(polygon.lineObjects);
            polygon.lineObjects.forEach(obj=>canvas.add(obj));
            polygon.pointObjects.forEach(obj=>canvas.add(obj));
            canvas.remove(polygon);
        }
    }


    function mouseDownHandler(opt) {
        const e = opt.e;
        const canvas = canvasObjRef.current;
        console.log('mouse down');

        // drag image (mouse down + alt/option key down)
        if (e.altKey === true) {
            setupCanvasDrag(e);
        }

        if (props.drawRect === true) {
            const existingIds = new Set(Object.keys(rectObjListRef.current));
            const idToDraw = Object.keys(props.rectIdList).filter(id => !existingIds.has(id))[0];
            canvas.rectIdObjToDraw = {...props.rectIdList[idToDraw]};
            canvas.rectStartPosition = canvas.getPointer();
        }
        
        if (props.drawPolygon === true) {
            drawPolygon();
        }

        if (canvas.editPolygon) {
            // console.log(polygon);
            if (!canvas.getActiveObject() || canvas.getActiveObject().type !== 'polygonPoint'
            || canvas.getActiveObject().owner != canvas.editingPolygonId) {
                finishEditPolygon();
            } else {    
                console.log('selected');
                canvas.isDraggingPoint = true;
            }
        }
    }

    function setupCanvasDrag(e) {
        const canvas = canvasObjRef.current;
        canvas.isDragging = true;
        canvas.selection = false;
        canvas.lastPosX = e.clientX;
        canvas.lastPosY = e.clientY;
    }

    function drawPolygon() {
        const canvas = canvasObjRef.current;
        canvas.selection = false;
        
        const existingIds = new Set(Object.keys(polygonObjListRef.current));
        const idToDraw = Object.keys(props.polygonIdList).filter(id => !existingIds.has(id))[0];
        const idObjToDraw = {...props.polygonIdList[idToDraw]};

        const clickPoint = canvas.getPointer();
        //console.log(clickPoint);
       
        if (canvas.polygonPoints.length==0 && canvas.polygonLines.length==0) {
            const point = createPoint(clickPoint, idObjToDraw, 0);
            canvas.add(point).setActiveObject(point);
            canvas.polygonPoints.push(point);
            // console.log(point.getCenterPoint(), point.getCoords());
        } else if (canvas.polygonPoints.length - canvas.polygonLines.length == 1) {
            const startPoint = canvas.polygonPoints[0].getCenterPoint();
            //if user click on the startPoint, then finish drawing
            if (Math.abs(startPoint.x - clickPoint.x) <= CLICK_TOLERANCE 
            && Math.abs(startPoint.y - clickPoint.y) <= CLICK_TOLERANCE 
            && canvas.polygonPoints.length >= 3) {
                const prePoint = canvas.polygonPoints[canvas.polygonPoints.length-1].getCenterPoint();
                const line = createLine(prePoint, startPoint, idObjToDraw)//, canvas.polygonLines.length);
                canvas.polygonLines.push(line);
                canvas.add(line);

                // console.log(canvas.polygonPoints.map(p => p.getCenterPoint()));
                const polygonObj = createPolygon(canvas.polygonPoints.map(p => p.getCenterPoint()), idObjToDraw);
                polygonObjListRef.current = {...polygonObjListRef.current, [polygonObj.id]: polygonObj};
                canvas.add(polygonObj).setActiveObject(polygonObj);
                
                canvas.polygonPoints.forEach(p=>canvas.remove(p));
                canvas.polygonLines.forEach(l=>canvas.remove(l));
                canvas.polygonPoints=[];
                canvas.polygonLines=[];
                canvas.selection = true;
                props.setDrawPolygon(false);
            } else {
                const point = createPoint(clickPoint, idObjToDraw, canvas.polygonPoints.length);
                canvas.add(point).setActiveObject(point);
                const prePoint = canvas.polygonPoints[canvas.polygonPoints.length-1].getCenterPoint();
                const line = createLine(prePoint, point.getCenterPoint(), idObjToDraw)//, canvas.polygonLines.length);
                canvas.add(line);
                canvas.polygonPoints.push(point);
                canvas.polygonLines.push(line);
            }
        }
    }

    function finishEditPolygon() {
        const canvas = canvasObjRef.current;
        const polygon = polygonObjListRef.current[canvas.editingPolygonId];
        const idObjToEdit = props.polygonIdList[canvas.editingPolygonId];
        const newPolygon = createPolygon(polygon.pointObjects.map(p => p.getCenterPoint()),idObjToEdit);
        polygonObjListRef.current[newPolygon.id] = newPolygon;////
        canvas.add(newPolygon).setActiveObject(newPolygon);
        polygon.pointObjects.forEach(p=>canvas.remove(p));
        polygon.lineObjects.forEach(l=>canvas.remove(l));
        // newPolygon.pointObjects = polygon.pointObjects;
        // newPolygon.lineObjects = polygon.lineObjects;
        canvas.editPolygon = false;
        canvas.editingPolygonId = null;
        // delete(polygon);
    }
    

    function mouseMoveHandler(opt) {
        const e = opt.e;
        const canvas = canvasObjRef.current;
        if (canvas.isDragging) {
            dragCanvas(e);
        }
        if (canvas.isDraggingPoint) {
            dragPolygonPoint();
        }
        if (props.drawRect && canvas.rectStartPosition) {
            drawRect();
        }
    }

    function dragCanvas(e) {
        const canvas = canvasObjRef.current;
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
        canvas.requestRenderAll();
        canvas.lastPosX = e.clientX;
        canvas.lastPosY = e.clientY;
    }

    function dragPolygonPoint() {
        const canvas = canvasObjRef.current;
        // console.log('dragging');
        const point = canvas.getActiveObject();
        console.log('point ', point, point.getCenterPoint());
        console.log(point.calcTransformMatrix(),point.calcOwnMatrix());
        const polygon = polygonObjListRef.current[point.owner];
        const idObjToEdit = props.polygonIdList[point.owner];
        // console.log('polygon ', polygon);
        const prePointIndex = point.index>0 ? point.index-1 : polygon.lineObjects.length-1;
        const postPointIndex = point.index<polygon.pointObjects.length-1 ? point.index+1 : 0;
        const newPreLine = createLine(polygon.pointObjects[prePointIndex].getCenterPoint(), point.getCenterPoint(), idObjToEdit)//, prePointIndex);
        const newPostLine = createLine(point.getCenterPoint(), polygon.pointObjects[postPointIndex].getCenterPoint(), idObjToEdit)//, point.index);
        canvas.remove(polygon.lineObjects[prePointIndex], polygon.lineObjects[point.index]);
        delete(polygon.lineObjects[prePointIndex]);
        delete(polygon.lineObjects[point.index]);
        polygon.lineObjects[prePointIndex] = newPreLine;
        polygon.lineObjects[point.index] = newPostLine;
        canvas.add(newPreLine, newPostLine);
    }
    
    function mouseUpHandler() {
        // on mouse up we want to recalculate new interaction
        // for all objects, so we call setViewportTransform
        const canvas = canvasObjRef.current;
        canvas.setViewportTransform(canvas.viewportTransform);
        canvas.isDragging = false;
        canvas.selection = true;
        canvas.isDraggingPoint = false;

        // finish drawing rect
        if (props.drawRect) {
            canvas.rectEndPosition = canvas.getPointer();
            createRect();
        }
    }

    function deleteKeyHandler(e) {
        if ((e.key === 'Backspace' || e.key === 'Delete') && canvasObjRef.current.getActiveObject()) {
            removeObj();
        }
        // console.log(e.key); // Backspace
        // console.log(e.keyCode); // 8
    }

    
    function createPoint(clickPoint, idObj, index) {
        const point = new fabric.Circle({
            left: clickPoint.x,  
            top: clickPoint.y,  
            radius: CIRCLE_RADIUS,
            originX: 'center',
            originY: 'center',
            strokeWidth: 1,
            strokeUniform: true,
            stroke: idObj.color,
            fill: idObj.color,
            lockScalingX: true,
            lockScalingY: true,
            lockRotation: true,
            lockScalingFlip: true,
            lockSkewingX: true,
            lockSkewingY: true,
            //centeredScaling: true,
            type: idObj.type + 'Point', 
            owner: idObj.id,
            index: index,
        })
        // console.log('point', point);
        point.on('mouseover', (opt)=>{
            opt.target.set({
                // radius: 10,
                strokeWidth: 2,
                fill: 'white',
                scaleX: 2,
                scaleY: 2,
                //centeredScaling: true,
            });
            canvasObjRef.current.renderAll();
        });
        point.on('mouseout', (opt)=>{
            opt.target.set({
                // radius: CIRCLE_RADIUS,
                strokeWidth: 1,
                fill: idObj.color,
                scaleX: 1,
                scaleY: 1,
                //centeredScaling: true,
            });
            canvasObjRef.current.renderAll();
        });
        return point;
    }

    function createLine(startPoint, endPoint, idObj){//, index) {
        return new fabric.Line([
            startPoint.x, startPoint.y, endPoint.x, endPoint.y
        ], {
            strokeWidth: STROKE_WIDTH,
            stroke: idObj.color,
            selectable: false,
            type: idObj.type+'Line',
            owner: idObj.id,
            //index: index, 
            lockRotation: true,
            lockScalingFlip: true,
            lockSkewingX: true,
            lockSkewingY: true,
            lockScalingX: true,
            lockScalingY: true,
        })
    }

    function createPolygon(points, idObj) {
        const canvas = canvasObjRef.current;
        return new fabric.Polygon(points, {
                id: idObj.id, 
                type: idObj.type,
                lable: idObj.label,
                stroke: idObj.color,
                strokeWidth: STROKE_WIDTH,
                strokeUniform: true,
                fill: false,
                // lockRotation: true,
                lockScalingFlip: true,
                lockSkewingX: true,
                lockSkewingY: true,
                // lockScalingX: true,
                // lockScalingY: true,
            }
        ); 
    }


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