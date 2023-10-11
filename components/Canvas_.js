import React, {useState, useEffect, useRef, useContext} from 'react';
import styles from '../styles/Canvas.module.css';
import {fabric} from 'fabric';
import { useStates, useStateSetters } from './StatesContext';


const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 500;
const CIRCLE_RADIUS = 3;
const STROKE_WIDTH = 2;
const WHEEL_SENSITIVITY = 10;
const CLICK_TOLERANCE = 5;
const ANNOTATION_TYPES = new Set(['keyPoint', 'bbox', 'polygon', 'skeleton']);


export default function Canvas(props) {
    /**
     * props:
     *      width: canvas width
     *      height: canvas height
     *      circle_radius: radius for keypoint, skeleton landmark, polygon point
     *      stroke_width: thinkness of line
     *      wheel_sensitivity: wheel sensitivity for zooming
     *       
     */
    const imgRef = useRef();
    const canvasObjRef = useRef();
    const imageObjRef = useRef();
    // const keyPointObjListRef = useRef({});
    // const bboxObjListRef = useRef({});
    // const polygonObjListRef = useRef({});
    const fabricObjListRef = useRef({});

    const videoId = useStates().videoId;
    const frameUrl = useStates().frameUrl;
    const frameNum = useStates().frameNum;
    const drawType = useStates().drawType;
    const setDrawType = useStateSetters().setDrawType;
    const skeletonLandmark = useStates().skeletonLandmark;
    const setSkeletonLandmark = useStateSetters().setSkeletonLandmark;
    const frameAnnotation = useStates().frameAnnotation;
    const setFrameAnnotation = useStateSetters().setFrameAnnotation;
    const btnConfigData = useStates().btnConfigData;
    const setActiveIdObj = useStateSetters().setActiveIdObj;

    
    console.log('canvas render');

    //Set up canvas
    useEffect(() => {
        // console.log(imgRef.current);

        if (!canvasObjRef.current) {
            const canvasObj = new fabric.Canvas('canvas', {
                //TODO
                width: CANVAS_WIDTH,
                height: CANVAS_HEIGHT,
                polygonPoints: [],
                polygonLines: [],
                bboxLines: [],
                skeletonPoints: [],
                skeletonLines: {}, //{'pointIndex1-pointIndex2': Line(), ...}, index1 < index2
                hoverCursor: 'pointer',
            });
            
            // canvasObj.on('mouse:down', //(opt) => {
            //     mouseDownHandler//(opt.e, canvasObj);
            // );

            canvasObjRef.current = canvasObj;
        }

        
        // imgRef.current.addEventListener("load", imageLoadHandler)
        // canvasObjRef.current.on('mouse:wheel', wheelHandler);
        // canvasObjRef.current.on('mouse:down', mouseDownHandler);
        // canvasObjRef.current.on('mouse:dblclick', mouseDblclickHandler);
        // canvasObjRef.current.on('mouse:move', mouseMoveHandler);
        // canvasObjRef.current.on('mouse:up', mouseUpHandler);
        // document.addEventListener("keydown", deleteKeyHandler); // add delete key event listener

        // // console.log(canvasObjRef.current.__eventListeners);

        // return () => {
        //     const eventListeners = canvasObjRef.current.__eventListeners;
        //     Object.keys(eventListeners).forEach(key => eventListeners[key]=[]);
        //     document.removeEventListener("keydown", deleteKeyHandler);
        // }
      }, []
    )

    
    useEffect(() => {
        imgRef.current.addEventListener("load", imageLoadHandler);
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
            imgRef.current.removeEventListener("load", imageLoadHandler);
        }
      }, [props]
    )


    useEffect(()=> {
        //When switch video, remove current imgObj, create a new blank imgObj
        // console.log('img', imgRef.current.src);
        canvasObjRef.current.remove(imageObjRef.current);
        const imageObj = new fabric.Image(imgRef.current, {
            selectable: false,
            width: canvasObjRef.current.width,
            height: canvasObjRef.current.height,
        });
        canvasObjRef.current.add(imageObj);
        canvasObjRef.current.renderAll();
        imageObjRef.current = imageObj;
        
      }, [props.videoId]
    )


    useEffect(() => {
        // update image when url changes
        if (props.frameUrl) {
            imgRef.current.src = props.frameUrl;
        } else {
            imgRef.current.src = '';
        }
      }, [props.frameUrl]
    )

    
    useEffect(() => {
        //when frame changes, update objects on canvas
        // console.log('canvas useEffect called');
        if (Object.keys(fabricObjListRef.current).length>0) {
            Object.keys(fabricObjListRef.current).forEach(id => 
                canvasObjRef.current.remove(fabricObjListRef.current[id]));
            fabricObjListRef.current = {};
        }

        // createFabricObjBasedOnAnnotation();
      }, [props.frameAnnotation]
    )


    function createFabricObjBasedOnAnnotation() {
        if (Object.keys(props.frameAnnotation).length>0) {
            console.log('draw anno');
            Object.keys(props.frameAnnotation).forEach(id => {
                const annoObj = props.frameAnnotation[id];
                if (annoObj.frameNum === props.frameNum) {
                    console.log(annoObj);
                    let dataToCanvas;
                    switch (annoObj.type) {
                        case 'keyPoint':
                            dataToCanvas = getKeypointCoordToCanvas(annoObj);
                            // console.log('keypoint', dataToCanvas);
                            createKeyPoint(dataToCanvas, annoObj);
                            break;
                        case 'bbox':
                            dataToCanvas = getBBoxCoordToCanvas(annoObj);
                            // console.log('bbox', dataToCanvas);
                            createBBox(dataToCanvas, annoObj);
                            break;
                        case 'polygon':
                            dataToCanvas = getPolygonCoordToCanvas(annoObj);
                            // console.log('polygon', dataToCanvas);
                            createPolygon(dataToCanvas, annoObj);
                            break;
                    }
                }
            });
        }
    }

    
    function scaleImage(canvas, image) { //image, canvas
        // scale image to fit in the canvas
        const scale = Math.min(canvas.width/image.width, canvas.height/image.height);
        // console.log(canvas.width, image.width);
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
    }


    function imageLoadHandler(){
        //When new video is loaded
        //scale frame size to fit in canvas 
        // if (props.frameNum === 0) {
        if (!props.frameNum) { //including frameNum==0 (new video), frameNum==null (image instead of video)
            imageObjRef.current.width = imgRef.current.width;
            imageObjRef.current.height = imgRef.current.height;
            scaleImage(canvasObjRef.current, imageObjRef.current);
        }

        //Draw fabric objects according to annotation
        createFabricObjBasedOnAnnotation();
        canvasObjRef.current.renderAll();
    }


    /*  For the next four functions
        obj contains coordinates/width/height relative to canvas plane
        convert to coordinates relative to img plane 
    */
    function getPointCoordToImage(point){
        const img = imageObjRef.current;
        return ({
            x: (point.x - img.left)/img.scaleX,
            y: (point.y - img.top)/img.scaleY,
        });
    }

    function getKeypointCoordToImage(obj) {
        return getPointCoordToImage(obj.getCenterPoint())
    }

    function getBBoxCoordToImage(obj){
        const topLeft = getPointCoordToImage(obj.aCoords.tl);
        const width = getPointCoordToImage(obj.aCoords.tr).x - topLeft.x;
        const height = getPointCoordToImage(obj.aCoords.bl).y - topLeft.y;
        return {
            left: topLeft.x,
            top: topLeft.y,
            width: width,
            height: height
        }
    }

    function getPolygonCoordToImage(obj) {
        const newPoints = getUpdatedPolygonPoints(obj);
        const res = newPoints.map(p=>getPointCoordToImage(p));
        return Object.assign({}, res);
    }

    function getUpdatedPolygonPoints(polygon) {
        const matrix = polygon.calcTransformMatrix();
        const newPoints = polygon.points.map(p => new fabric.Point(p.x - polygon.pathOffset.x, p.y - polygon.pathOffset.y))
            .map(p => fabric.util.transformPoint(p, matrix));
        return newPoints;
    }


    /*  For the next four functions
        obj contains coordinates/width/height relative to img plane
        convert to coordinates relative to canvas plane 
    */
    function getPointCoordToCanvas(point){
        // point: {x:..., y:...}, the coord relative to img plane 
        const img = imageObjRef.current;
        return ({
            x: point.x * img.scaleX + img.left,
            y: point.y * img.scaleY + img.top,
        });
    }

    function getKeypointCoordToCanvas(obj) {
        return getPointCoordToCanvas(obj.data);
    }

    function getBBoxCoordToCanvas(obj){
        const img = imageObjRef.current;
        const topLeft = {x: obj.data.left, y: obj.data.top};
        const topLeftToCanvas = getPointCoordToCanvas(topLeft);
        const width = obj.data.width * img.scaleX;
        const height = obj.data.height * img.scaleY;
        return {
            left: topLeftToCanvas.x,
            top: topLeftToCanvas.y,
            width: width,
            height: height
        }
    }

    function getPolygonCoordToCanvas(obj) {
        return Object.keys(obj.data).map(i => getPointCoordToCanvas(obj.data[i]));
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
        if (zoom == 1) { //recenter canvas
            let vpt = canvas.viewportTransform;
            vpt[4] = 0;
            vpt[5] = 0;
            // canvas.requestRenderAll();
        }
        e.preventDefault();
        e.stopPropagation();
    }


    function mouseDblclickHandler() {
        console.log('dbclick');
        // console.log(canvasObjRef.current.getActiveObject());
        const canvas = canvasObjRef.current;
        if (canvas.getActiveObject() && canvas.getActiveObject().type === 'polygon') {
            const polygon = canvas.getActiveObject();
            canvas.editPolygon = true;
            canvas.editingPolygonId = polygon.id;

            const newPoints = getUpdatedPolygonPoints(polygon);
            const idObjToEdit = props.frameAnnotation[polygon.id];
            polygon.pointObjects = newPoints.map((p, i) => createPoint(p, idObjToEdit, i));
            polygon.lineObjects = newPoints.map((p, i) => i<newPoints.length-1 ? createLine(p, newPoints[i+1], props.frameAnnotation[polygon.id]) : createLine(p, newPoints[0], idObjToEdit))
            polygon.lineObjects.forEach(obj=>canvas.add(obj));
            polygon.pointObjects.forEach(obj=>canvas.add(obj));
            canvas.remove(polygon);
        }
    }


    function mouseDownHandler(opt) {
        const e = opt.e;
        const canvas = canvasObjRef.current;
        console.log('mouse down');

        if (!canvas.getActiveObject()){
            // drag image (mouse down + alt/option key down)
            if (e.altKey === true) {
                setupCanvasDrag(e);
            }

            canvas.activeObj = null;
            canvas.isEditingObj = null;
            props.setActiveIdObj(null);
        }
        
        if (canvas.getActiveObject()){ // when click on an obj
            // if (canvas.activeObj) { // if click on the same active obj, use is editing it
            //     canvas.isEditingObj = true;
            //     console.log('canvas activeObj2', canvas.activeObj);
            // } else { // if click on a new obj, use is choosing the obj
            //     canvas.activeObj = canvas.getActiveObject();
            //     console.log('canvas activeObj1', canvas.activeObj);
            //     // let activeObjId = null;
            //     // switch (canvas.activeObj.type) {
            //     //     case 'keyPoint':
            //     //         activeObjId = props.keyPointIdList
            //     // }
            //     // props.setActiveIdObj(activeObjId);
            // }
            const activeObj = canvas.getActiveObject();
            if (ANNOTATION_TYPES.has(activeObj.type)) {
                // canvas.activeObj = activeObj;
                // canvas.isEditingObj = true;
                // setActiveObjData();
                addActiveIdObj(activeObj);
            } else if (activeObj.type === 'skeletonPoint') {
                //TODO: add obj to anno display

            }
        }

        if (props.drawType === 'keyPoint') {
            const idTodraw = getIdToDraw();
            const annoObjToDraw = {...props.frameAnnotation[idTodraw]};
            createKeyPoint(canvas.getPointer(), annoObjToDraw);
        }

        if (props.drawType === 'bbox') {
            const idToDraw = getIdToDraw();
            canvas.bboxIdObjToDraw = {...props.frameAnnotation[idToDraw]};
            canvas.bboxStartPosition = canvas.getPointer();
        }
        
        if (props.drawType === 'polygon') {
            drawPolygon();
        }

        if (canvas.editPolygon) {
            // console.log(polygon);
            if (!canvas.getActiveObject() || canvas.getActiveObject().type !== 'polygonPoint'
            || canvas.getActiveObject().owner != canvas.editingPolygonId) {
                finishEditPolygon();
            } else {    
                console.log('selected');
                canvas.isDraggingPolygonPoint = true;
            }
        }

        // this if must be above next if, otherwise dragSkeletonPoint will be called right after drawing the last landmark and cause error
        if (canvas.getActiveObject() && canvas.getActiveObject().type==='skeletonPoint' && canvas.drawType !== 'skeleton') {
            canvas.isDraggingSkeletonPoint = true;
        }

        if (props.drawType === 'skeleton') {
            drawSkeleton();
        }

        
    }

    
    function mouseMoveHandler(opt) {
        const e = opt.e;
        const canvas = canvasObjRef.current;
        if (canvas.isDragging) {
            dragCanvas(e);
        }
        if (canvas.isDraggingPolygonPoint) {
            dragPolygonPoint();
        }
        if (props.drawType==='bbox' && canvas.bboxStartPosition) {
            drawBBox();
        }
        if (canvas.activeObj && canvas.isEditingObj) {
            setActiveObjData();
            // props.setActiveIdObj(props.rectIdList[canvas.activeObj.id]);
        }
        if (canvas.isDraggingSkeletonPoint) {
            dragSkeletonPoint();
        }
    }


    function setActiveObjData(){
        /* retrieve canvas.activeObj, calculate its data (coordinates) relative to image
           update its data in props.frameAnnotation, and parent's activeIdObj
        */
        const canvas = canvasObjRef.current;
        const obj = canvas.activeObj;
        let data = {};
        let newIdObj = {};
        // console.log('setActiveObjData');
        switch (obj.type) {
            case 'keyPoint':
                data = getKeypointCoordToImage(obj);
                break;
            case 'bbox':
                data = getBBoxCoordToImage(obj);
                break;
            case 'polygon':
                data = getPolygonCoordToImage(obj);
                break;
        }
        newIdObj = {...props.frameAnnotation[obj.id], data: data}; 
        // props.setFrameAnnotation({...props.frameAnnotation, [obj.id]: newIdObj});
        props.frameAnnotation[obj.id] = newIdObj;
        props.setActiveIdObj(newIdObj);
    }


    function mouseUpHandler() {
        /* on mouse up we want to recalculate new interaction
           for all objects, so we call setViewportTransform
           */
        const canvas = canvasObjRef.current;
        canvas.setViewportTransform(canvas.viewportTransform);
        canvas.isDragging = false;
        canvas.selection = true;
        canvas.isDraggingPolygonPoint = false;
        canvas.isDraggingSkeletonPoint = false;
        canvas.isEditingObj = false;

        // finish drawing bbox
        if (props.drawType === 'bbox') {
            canvas.bboxEndPosition = canvas.getPointer();
            finishDrawBBox();

            canvas.isEditingObj = false;// createRect() set it to be true, should be reset to be false
        }
    }


    function deleteKeyHandler(e) {
        if ((e.key === 'Backspace' || e.key === 'Delete') 
        && canvasObjRef.current.getActiveObject()
        && canvasObjRef.current.getActiveObject().type !== 'polygonPoint'
        && canvasObjRef.current.getActiveObject().type !== 'skeletonPoint') {
            removeObj();
        }
        // console.log(e.key); // Backspace
        // console.log(e.keyCode); // 8
    }


    function drawBBox() {
        const canvas = canvasObjRef.current;
        const idObj = canvas.bboxIdObjToDraw;
        const corner1 = canvas.bboxStartPosition;
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
        if (canvas.bboxLines.length == 4) {
            canvas.bboxLines.forEach(l => canvas.remove(l));
            canvas.bboxLines = [];
        }
        canvas.bboxLines.push(line1);
        canvas.bboxLines.push(line2);
        canvas.bboxLines.push(line3);
        canvas.bboxLines.push(line4);
    }


    function drawPolygon() {
        const canvas = canvasObjRef.current;
        canvas.selection = false;
        
        const idToDraw = getIdToDraw();
        const idObjToDraw = {...props.frameAnnotation[idToDraw]};

        const clickPoint = canvas.getPointer();
        //console.log(clickPoint);
       
        if (canvas.polygonPoints.length===0 && canvas.polygonLines.length===0) {
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
                createPolygon(canvas.polygonPoints.map(p => p.getCenterPoint()), idObjToDraw);
                // fabricObjListRef.current = {...fabricObjListRef.current, [polygonObj.id]: polygonObj};
                // canvas.add(polygonObj).setActiveObject(polygonObj);
                
                canvas.polygonPoints.forEach(p=>canvas.remove(p));
                canvas.polygonLines.forEach(l=>canvas.remove(l));
                canvas.polygonPoints=[];
                canvas.polygonLines=[];
                canvas.selection = true;
                props.setDrawType(null);

                // addActiveIdObj(polygonObj);
                // console.log('poly',canvas.activeObj, canvas.isEditingObj);

            } else {
                const point = createPoint(clickPoint, idObjToDraw, canvas.polygonPoints.length);
                const prePoint = canvas.polygonPoints[canvas.polygonPoints.length-1];
                const line = createLine(prePoint.getCenterPoint(), point.getCenterPoint(), idObjToDraw)//, canvas.polygonLines.length);
                canvas.add(line);
                canvas.bringToFront(prePoint);
                canvas.add(point).setActiveObject(point);
                canvas.polygonPoints.push(point);
                canvas.polygonLines.push(line);
            }
        }
    }


    function drawSkeleton() {
        const canvas = canvasObjRef.current;
        canvas.selection = false;
        
        const annoIdToDraw = getIdToDraw();
        const annoObjToDraw = {...props.frameAnnotation[annoIdToDraw]}; //{annoId: {id: annoId, groupIndex: , frameNum: , type: 'skeleton', data: [[null, null, 2], ...}}
        const landmarkToDraw = props.btnConfigData[annoObjToDraw.groupIndex].childData[props.skeletonLandmark]; //{index: 0, btnType: 'skeleton',label: 'head',color: '#1677FF'}
        const landmarkInfo = {
            id: annoIdToDraw,
            color: landmarkToDraw.color,
            type: landmarkToDraw.btnType,
        }
        // console.log('landmark', landmarkInfo);
        const landmarkTotalNum = props.btnConfigData[annoObjToDraw.groupIndex].childData.length;
        const edgesInfo = props.btnConfigData[annoObjToDraw.groupIndex].edgeData; // {color: '', edges: [set(), ...]}
        
        const clickPoint = canvas.getPointer();
        //console.log(clickPoint);
        //create landmark
        const landmark = createPoint(clickPoint, landmarkInfo, props.skeletonLandmark);
        canvas.add(landmark).setActiveObject(landmark);
        
        //create edges
        const neighbors = edgesInfo.edges[props.skeletonLandmark];
        const edgeColor = edgesInfo.color;
        const edgeInfo = {
            id: annoIdToDraw,
            type: landmarkToDraw.btnType,
            color: edgeColor,
        }
        // console.log('edge',edgeInfo);
        canvas.skeletonPoints.forEach(p => {
            if (neighbors.has(p.index)) {
                const line = createLine(p.getCenterPoint(), landmark.getCenterPoint(), edgeInfo);
                canvas.add(line);
                canvas.bringToFront(landmark);
                canvas.bringToFront(p);
                canvas.skeletonLines[`${p.index}-${landmark.index}`] = line;
            }
        })

        canvas.skeletonPoints.push(landmark); // must be after creating edges


        if (props.skeletonLandmark < landmarkTotalNum - 1) { // if not done with drawing
            props.setSkeletonLandmark(props.skeletonLandmark + 1);
        } else { // if done
            //add the skeleton landmarks and edges to ref
            fabricObjListRef.current[annoIdToDraw] = {
                landmarks: canvas.skeletonPoints,
                edges: canvas.skeletonLines,
            }
            canvas.skeletonPoints = [];
            canvas.skeletonLines = {};
            
            //TODO: add data to annotation

            props.setSkeletonLandmark(null);
            props.setDrawType(null);
            canvas.selection = true;
        }
    }


    function createKeyPoint(data, annoObjToDraw) {
        const canvas = canvasObjRef.current;
        // canvas.selection = false;
        const idTodraw = annoObjToDraw.id;
        // console.log('canvas',annoObjToDraw);
        const point = createPoint(data, annoObjToDraw, 0);
        point.id = idTodraw;
        point.type = 'keyPoint';
        point.hasControls = false;
        point.hasBorders = false;
        // console.log('keyPointObj', point);
        // console.log(point.__eventListeners);
        // fabricObjListRef.current = {...fabricObjListRef.current, [idTodraw]: point};
        fabricObjListRef.current[idTodraw] = point;
        // console.log('keyPointObjListRef', keyPointObjListRef.current);
        canvas.add(point)
        if (props.drawType) {
            canvas.setActiveObject(point);
            addActiveIdObj(point);
            props.setDrawType(null);
        }
        // canvas.selection = true;
    }


    function finishDrawBBox() {
        const canvas = canvasObjRef.current;
        const idObj = canvas.bboxIdObjToDraw;
        const startPos = canvas.bboxStartPosition;
        const endPos = canvas.bboxEndPosition;
        canvas.selection = false;
        const width = Math.abs(endPos.x - startPos.x);
        const height = Math.abs(endPos.y - startPos.y);
        
        if (width>0 && height>0) {
            const bboxObj = new fabric.Rect({
                id: idObj.id,
                label: idObj.label,
                type: idObj.type,
                //left,top,width,height need to consider user's drag direction
                left: Math.min(startPos.x, endPos.x),
                top: Math.min(startPos.y, endPos.y),
                width: width,
                height: height,
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
            // console.log(bboxObj);
            // fabricObjListRef.current = {...fabricObjListRef.current, [bboxObj.id]: bboxObj};
            fabricObjListRef.current[bboxObj.id] = bboxObj;
            // console.log('drawbboxObj', bboxObj.left, bboxObj.height, bboxObj.width, bboxObj.height);
            canvas.add(bboxObj).setActiveObject(bboxObj);
            addActiveIdObj(bboxObj);
        } else {
            // const annotationList = {...props.frameAnnotation};
            // delete(annotationList[idObj.id]);
            // props.setFrameAnnotation(annotationList);
            delete(props.frameAnnotation[idObj.id])
        }   
        canvas.bboxStartPosition = null;
        canvas.bboxEndPosition = null;
        canvas.bboxIdObjToDraw = null;
        canvas.bboxLines.forEach(l => canvas.remove(l));
        canvas.bboxLines = [];
        props.setDrawType(null);
        canvas.selection = true;
        // console.log('rect',canvas.activeObj, canvas.isEditingObj);
    }


    function createBBox(data, annoObjToDraw) {
        if (data.width===0 || data.height===0) {
            return;
        }
        const canvas = canvasObjRef.current;
        canvas.selection = false;
        const bboxObj = new fabric.Rect({
            id: annoObjToDraw.id,
            label: annoObjToDraw.label,
            type: annoObjToDraw.type,
            //left,top,width,height need to consider user's drag direction
            left: data.left,
            top: data.top,
            width: data.width,
            height: data.height,
            stroke: annoObjToDraw.color,
            strokeWidth: STROKE_WIDTH,
            strokeUniform: true,
            fill: null,
            lockRotation: true,
            lockScalingFlip: true,
            lockSkewingX: true,
            lockSkewingY: true,
            hasRotatingPoint: false
        });
        // fabricObjListRef.current = {...fabricObjListRef.current, [bboxObj.id]: bboxObj};
        fabricObjListRef.current[bboxObj.id] = bboxObj;
        canvas.add(bboxObj);
        // console.log('createbboxObj', bboxObj.left, bboxObj.height, bboxObj.width, bboxObj.height);
    }

    
    function createPoint(clickPoint, annoObj, index) {
        const point = new fabric.Circle({
            left: clickPoint.x,  /////
            top: clickPoint.y,  /////
            radius: CIRCLE_RADIUS,
            originX: 'center',
            originY: 'center',
            strokeWidth: 1,
            strokeUniform: true,
            stroke: annoObj.color,
            fill: annoObj.type==='keyPoint'?annoObj.color:'white', //'white',//idObj.color,
            lockScalingX: true,
            lockScalingY: true,
            lockRotation: true,
            lockScalingFlip: true,
            lockSkewingX: true,
            lockSkewingY: true,
            //centeredScaling: true,
            type: annoObj.type + 'Point', 
            owner: annoObj.id,
            index: index, // point index for polygon or skeleton
        })
        // console.log('point', point);
        point.on('mouseover', (opt)=>{
            opt.target.set({
                // radius: 10,
                strokeWidth: 2,
                fill: annoObj.type==='keyPoint'?false:'white',
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
                fill: annoObj.type==='keyPoint'?annoObj.color:'white',
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

    function createPolygon(points, annoObjToDraw) {
        const canvas = canvasObjRef.current;
        const polygon = new fabric.Polygon(points, {
                id: annoObjToDraw.id, 
                type: annoObjToDraw.type,
                lable: annoObjToDraw.label,
                stroke: annoObjToDraw.color,
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
        fabricObjListRef.current[polygon.id] = polygon;/////
        canvas.add(polygon);
        if (props.drawType || canvas.editPolygon) {
            canvas.setActiveObject(polygon);
            addActiveIdObj(polygon);
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
        // console.log('point ', point, point.getCenterPoint());
        // console.log(point.calcTransformMatrix(),point.calcOwnMatrix());
        const polygon = fabricObjListRef.current[point.owner];
        const idObjToEdit = props.frameAnnotation[point.owner];
        // console.log('polygon ', polygon);
        const prePointIndex = point.index>0 ? point.index-1 : polygon.lineObjects.length-1;
        const postPointIndex = point.index<polygon.pointObjects.length-1 ? point.index+1 : 0;
        const newPreLine = createLine(polygon.pointObjects[prePointIndex].getCenterPoint(), point.getCenterPoint(), idObjToEdit)//, prePointIndex);
        const newPostLine = createLine(point.getCenterPoint(), polygon.pointObjects[postPointIndex].getCenterPoint(), idObjToEdit)//, point.index);
        canvas.remove(polygon.lineObjects[prePointIndex], polygon.lineObjects[point.index]);
        // delete(polygon.lineObjects[prePointIndex]);
        // delete(polygon.lineObjects[point.index]);
        polygon.lineObjects[prePointIndex] = newPreLine;
        polygon.lineObjects[point.index] = newPostLine;
        canvas.add(newPreLine, newPostLine);
        canvas.bringToFront(polygon.pointObjects[prePointIndex]);
        canvas.bringToFront(polygon.pointObjects[postPointIndex]);
    }

    function dragSkeletonPoint() {
        const canvas = canvasObjRef.current;
        // console.log('dragging');
        const point = canvas.getActiveObject();
        const landmarks = fabricObjListRef.current[point.owner].landmarks;
        const edgesInfo = props.btnConfigData[props.frameAnnotation[point.owner].groupIndex].edgeData; // {color: '', edges: [set(), ...]}
        const edgeInfo = {
            id: point.owner,
            type: 'skeleton',
            color: edgesInfo.color,
        }
        // console.log(point, landmarks, edgesInfo);
        const neighbors = Array.from(edgesInfo.edges[point.index]);
        neighbors.forEach(n => {
                const edge = createLine(landmarks[n].getCenterPoint(), point.getCenterPoint(), edgeInfo);
                let name;
                if (n < point.index) {
                    name = `${n}-${point.index}`;
                } else {
                    name = `${point.index}-${n}`;
                }
                const oldEdge = fabricObjListRef.current[point.owner].edges[name];
                canvas.remove(oldEdge);
                canvas.add(edge);
                canvas.bringToFront(point);
                canvas.bringToFront(landmarks[n]);
                fabricObjListRef.current[point.owner].edges[name] = edge;
            }
        )
    }


    function setupCanvasDrag(e) {
        const canvas = canvasObjRef.current;
        canvas.isDragging = true;
        canvas.selection = false;
        canvas.lastPosX = e.clientX;
        canvas.lastPosY = e.clientY;
    }


    function finishEditPolygon() {
        const canvas = canvasObjRef.current;
        const polygon = fabricObjListRef.current[canvas.editingPolygonId];
        const idObjToEdit = props.frameAnnotation[canvas.editingPolygonId];
        createPolygon(polygon.pointObjects.map(p => p.getCenterPoint()),idObjToEdit);
        // fabricObjListRef.current[newPolygon.id] = newPolygon;/////
        // canvas.add(newPolygon).setActiveObject(newPolygon);
        polygon.pointObjects.forEach(p=>canvas.remove(p));
        polygon.lineObjects.forEach(l=>canvas.remove(l));
        canvas.editPolygon = false;
        canvas.editingPolygonId = null;
        // delete(polygon);
        // addActiveIdObj(newPolygon);
    }


    function removeObj() {
        // remove obj from canvas, objListRef, remove idObj in parent
        const canvas = canvasObjRef.current;
        const activeObj = canvas.getActiveObject();
        delete(fabricObjListRef.current[activeObj.id]);
        // const annotationList = {...props.frameAnnotation};
        // delete(annotationList[activeObj.id]);
        // props.setFrameAnnotation(annotationList);
        delete(props.frameAnnotation[activeObj.id]);
        
        canvas.remove(activeObj);

        canvas.activeObj = null;
        canvas.isEditingObj = null;
        props.setActiveIdObj(null);
    }

    function addActiveIdObj(activeObj) {
        // these commands will be used at multiple places, when create, choose, edit, and delete an object
        const canvas = canvasObjRef.current;
        canvas.activeObj = activeObj;
        canvas.isEditingObj = true;
        setActiveObjData();
    }


    function getIdToDraw() {
        const existingIds = new Set(Object.keys(fabricObjListRef.current));
        const idToDraw = Object.entries(props.frameAnnotation).filter(([id, annoObj]) => !existingIds.has(id) && ANNOTATION_TYPES.has(annoObj.type))[0][0];
        return idToDraw;
    }



    // src={props.imgUrl}ref={imgRef} 
    return (
        
        <div className='px-0'>
            {/* <p>{console.log('return called')}</p> */}
            <canvas id='canvas' className={styles.canvas} >
                <img id='image' ref={imgRef} className={styles.image} alt="img"/>
            </canvas>
        </div>
      )
}