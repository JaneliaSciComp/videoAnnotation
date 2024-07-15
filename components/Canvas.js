import React, {useEffect, useState, useRef} from 'react';
import styles from '../styles/Canvas.module.css';
import {fabric} from 'fabric-with-erasing';
import { useStates, useStateSetters } from './AppContext';
import { defaultAlpha, hexArr, hexMap } from '../utils/utils';
import { deleteAnnotation, getFrameAnnotation } from '../utils/requests';

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 500;
const CIRCLE_RADIUS = 3;
const STROKE_WIDTH = 2;

const WHEEL_SENSITIVITY = 10;
const CLICK_TOLERANCE = 5;
const ANNOTATION_TYPES = new Set(['keyPoint', 'bbox', 'polygon', 'skeleton', 'brush']);


/**
 * props:
 *      width: canvas width
 *      height: canvas height
 *      circleRadius: radius for keypoint, skeleton landmark, polygon point
 *      strokeWidth: thinkness of line
 *      wheelSensitivity: wheel sensitivity for zooming
 *      alpha: number, [0,1]. transparency for segementation (brush) drawing
 */
export default function Canvas(props) {
    
    const imgRef = useRef();
    const imageObjRef = useRef();
    const canvasRef = useRef();
    const canvasObjRef = useRef();
    const testCanvasRef1 = useRef();
    const testCanvasRef2 = useRef();
    const fabricObjListRef = useRef({});
    const prevDrawTypeRef = useRef({});
    const prevUploaderRef = useRef();
    const [info, setInfo] = useState();

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
    const setActiveAnnoObj = useStateSetters().setActiveAnnoObj;
    const brushThickness = useStates().brushThickness;
    const useEraser = useStates().useEraser;
    const undo = useStates().undo;
    const annoIdToDraw = useStates().annoIdToDraw;
    const setAnnoIdToDraw = useStateSetters().setAnnoIdToDraw;
    const annoIdToDelete = useStates().annoIdToDelete;
    const setAnnoIdToDelete = useStateSetters().setAnnoIdToDelete;
    const annoIdToShow = useStates().annoIdToShow;
    const uploader = useStates().uploader;
    const setGetAdditionalDataSignal = useStateSetters().setGetAdditionalDataSignal;

    
    console.log('canvas render');
    fabric.Object.prototype.erasable = false;

    useEffect(() => {
        if (!canvasObjRef.current) {

            const canvasObj = new fabric.Canvas('canvas', {
                width: props.width ? props.width : CANVAS_WIDTH,
                height: props.height ? props.height : CANVAS_HEIGHT,
                polygonPoints: [],
                polygonLines: [],
                bboxLines: [],
                skeletonPoints: [],
                skeletonLines: {},
                hoverCursor: 'pointer',
                freeDrawingCursor: 'pointer',
                enableRetinaScaling: false,
                stopContextMenu: true
            });
            

            canvasObjRef.current = canvasObj;

        } 
      }, []
    )

    useEffect(()=>{
        if (props.alpha && (props.alpha < 0 || props.alpha > 1)) {
            throw Error('Alpha should be in the range [0, 1].');
        }
    }, [props.alpha])


    useEffect(() => {
        if (imgRef.current) {
            imgRef.current.addEventListener("load", imageLoadHandler);
        }
            canvasObjRef.current.on('mouse:wheel', wheelHandler);
            canvasObjRef.current.on('mouse:down', mouseDownHandler);
            canvasObjRef.current.on('mouse:dblclick', mouseDblclickHandler);
            canvasObjRef.current.on('mouse:move', mouseMoveHandler);
            canvasObjRef.current.on('mouse:up', mouseUpHandler);
            canvasObjRef.current.on("path:created", pathCreateHandler);
                
        document.addEventListener("keydown", deleteKeyHandler);


        return () => {
                const eventListeners = canvasObjRef.current.__eventListeners;
                    Object.keys(eventListeners).forEach(key => eventListeners[key]=[]);
            document.removeEventListener("keydown", deleteKeyHandler);
            if (imgRef.current) {
                imgRef.current.removeEventListener("load", imageLoadHandler);
            }
        }
      }, [useStates()]
    )


    useEffect(() => {
        if (annoIdToDelete) {
            removeObjFromCanvasById(annoIdToDelete);
            delete(fabricObjListRef.current[annoIdToDelete]);
            setAnnoIdToDelete(null);
        }
    }, [annoIdToDelete])

    useEffect(() => {
        Object.keys(fabricObjListRef.current).forEach(id => {
            removeObjFromCanvasById(id);
        });
        annoIdToShow.forEach(id => {
            addObjToCanvasById(id);
        })
    }, [annoIdToShow])


    useEffect(()=> {
        canvasObjRef.current.remove(imageObjRef.current);
        console.log(videoId);
        if (!videoId) {
            canvasObjRef.current.clear();
        } else {
            const imageObj = new fabric.Image(imgRef.current, {
                selectable: false,
                width: canvasObjRef.current.width,
                height: canvasObjRef.current.height,
                erasable: false
            });
            canvasObjRef.current.add(imageObj);
            canvasObjRef.current.renderAll();
            imageObjRef.current = imageObj;
        }
        
      }, [videoId]
    )



    useEffect(() => {
        if (frameUrl) {
            createPathes().then(
                () => {
                    if (frameUrl) {
                        imgRef.current.src = frameUrl;
                    } else {
                        imgRef.current.src = '';
                    }
                }
            )
        }
        
        return ()=>{
            const canvas = canvasObjRef.current;
            console.log('canvas frameUrl useEffect return:', frameUrl);
            getBrushData();
    
            removeAllObjFromCanvas();
            fabricObjListRef.current = {};
            
    
            canvas.polygonPoints.forEach(p=>canvas.remove(p));
            canvas.polygonLines.forEach(l=>canvas.remove(l));
            canvas.bboxLines.forEach(l=>canvas.remove(l));
            canvas.skeletonPoints.forEach(p=>canvas.remove(p));
            Object.keys(canvas.skeletonLines).forEach(name=>canvas.remove(canvas.skeletonLines[name]));
            canvas.polygonPoints = [];
            canvas.polygonLines = [];
            canvas.bboxLines = [];
            canvas.skeletonPoints = [];
            canvas.skeletonLines = {};
            
            canvas.isDragging = null;
            canvas.lastPosX = null;
            canvas.lastPosY = null;
            canvas.bboxStartPosition = null;
            canvas.bboxEndPosition = null;
            canvas.bboxIdObjToDraw = null;
            canvas.isDrawingSkeleton = null;
            canvas.isDraggingSkeletonPoint = false;
            canvas.editPolygon = null;
            canvas.editingPolygonId = null;
            canvas.isDraggingPolygonPoint = false;
            canvas.isEditingObj = null;
            canvas.activeObj = null;
            prevDrawTypeRef.current = null;
            resetBrush();
        }

      }, [frameUrl]
    )

    function removeAllObjFromCanvas() {
        console.log(fabricObjListRef.current);
        console.log('canvas objs before remove', canvasObjRef.current.getObjects())
        if (Object.keys(fabricObjListRef.current).length>0) {
            Object.keys(fabricObjListRef.current).forEach(id => {
                removeObjFromCanvasById(id);
            });
        }
        console.log('canvas objs after remove', canvasObjRef.current.getObjects());
    }

    function removeObjFromCanvasById(id) {
        const canvas = canvasObjRef.current;
        const obj = fabricObjListRef.current[id];
        console.log('removeObjFromCanvasById', obj);
        if (obj) {
            if (obj.type==='skeleton') {
                obj.landmarks.forEach(l => {
                    if (l) {
                        canvas.remove(l);
                    };
                });
                Object.entries(obj.edges).forEach(([_, line])=>canvas.remove(line));
            } else if (obj.type==='brush') {
                obj.pathes.forEach( p => canvas.remove(p));
            } else {
                canvas.remove(obj);
            }
        } 
    }

    function addObjToCanvasById(id) {
        const canvas = canvasObjRef.current;
        const obj = fabricObjListRef.current[id];
        if (obj) {
            if (obj.type==='skeleton') {
                Object.entries(obj.edges).forEach(([_, line])=>canvas.add(line));
                obj.landmarks.forEach(l => {
                    if (l) {
                        canvas.add(l);
                    };
                });
            } else if (obj.type==='brush') {
                obj.pathes.forEach( p => canvas.add(p));
            } else {
                canvas.add(obj);
            }
        } 
    }


    useEffect(() => {
        setInfo(null);
        const canvas = canvasObjRef.current;
        
        canvas.polygonPoints.forEach(p=>canvas.remove(p));
        canvas.polygonLines.forEach(l=>canvas.remove(l));
        canvas.skeletonPoints.forEach(p=>canvas.remove(p));
        Object.keys(canvas.skeletonLines).forEach(name=>canvas.remove(canvas.skeletonLines[name]));
        canvas.polygonPoints = [];
        canvas.polygonLines = [];
        canvas.skeletonPoints = [];
        canvas.skeletonLines = {};
        canvas.isDrawingSkeleton = null;
        

        if ((uploader?.type==='annotation') && (uploader !== prevUploaderRef.current)) {
            console.log('frameAnno useEffect uploader', uploader);
            removeAllObjFromCanvas();
            fabricObjListRef.current = {};
            createPathes();
            createFabricObjBasedOnAnnotation();
            prevUploaderRef.current = uploader;
        }

        return ()=>{
            console.log('frameAnno return func')
        }
        
    }, [frameAnnotation])


    useEffect(() => {
        console.log('canvas drawtype useEffect', drawType);
        const canvas = canvasObjRef.current;

        if (!drawType) {
            if (canvas.isDrawingSkeleton) {
                finishDrawSkeleton();
                canvas.isDrawingSkeleton=false;
            }

            if (prevDrawTypeRef.current==='brush') {
                resetBrush();
                
                getBrushData();
                setAnnoIdToDraw(null);
            }
        }
        else if (drawType==='brush') {
            setPencilBrush();
        }
        else {
            if (prevDrawTypeRef.current==='brush') {
                resetBrush();
                getBrushData();
            }
        }
        prevDrawTypeRef.current = drawType;
    }, [drawType])

    
    useEffect(()=> {
        if (annoIdToDraw && frameAnnotation[annoIdToDraw]?.type==='brush' && prevDrawTypeRef.current==='brush') {
            resetBrush();
            setPencilBrush();
        }

        return ()=>{
            if (annoIdToDraw && frameAnnotation[annoIdToDraw]?.type==='brush'){
                getBrushData(); 
            }
        }
    }, [annoIdToDraw])


    function setPencilBrush() {
        const canvas = canvasObjRef.current;
        const annoObj = frameAnnotation[annoIdToDraw];
        canvas.isDrawingMode = true;
        canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
        canvas.freeDrawingBrush.limitedToCanvasSize = true;
        const alphaFloat = props.alpha?props.alpha:defaultAlpha;
        canvas.freeDrawingBrush.color = annoObj.color + convertAlphaFloatToHex(alphaFloat);
        canvas.freeDrawingBrush.width = brushThickness;
    }

    function resetBrush() {
        const canvas = canvasObjRef.current;
        canvas.isDrawingMode = false;
        canvas.freeDrawingBrush = null;
    }

    useEffect(()=>{
            if (useEraser) {
                setEraserBrush();
            } else {
                if (drawType !== 'brush') {
                    resetBrush();
                } else {
                    setPencilBrush();
                }
                
            }
        
    }, [useEraser])

    function setEraserBrush() {
        const canvas = canvasObjRef.current;
        canvas.isDrawingMode = true;
        canvas.freeDrawingBrush = new fabric.EraserBrush(canvas);
        canvas.freeDrawingBrush.limitedToCanvasSize = true;
        canvas.freeDrawingBrush.width = brushThickness;
    }

    function pathCreateHandler(e) {
        if (drawType==='brush') {
            e.path.selectable=false;
            e.path.erasable=true;
            e.path.id = annoIdToDraw;
            
            addPathObjToRef(e.path);
            if (e.path.globalCompositeOperation!=="destination-out") {
                if (!frameAnnotation[annoIdToDraw].pathes) {
                    frameAnnotation[annoIdToDraw].pathes = [];
                }
                frameAnnotation[annoIdToDraw].pathes.push(JSON.stringify(e.path.toJSON(["id"])));
            }
        }
    }

    function addPathObjToRef(pathObj){
        if (pathObj.globalCompositeOperation!=="destination-out") { 
            const existingIds = new Set(Object.keys(fabricObjListRef.current));
            if (!existingIds.has(pathObj.id)) {
                const brushObj = {
                    id: pathObj.id,
                    type: 'brush',
                    pathes: [],
                }
                fabricObjListRef.current[pathObj.id] = brushObj;
            }
            fabricObjListRef.current[pathObj.id].pathes.push(pathObj);
        }
    }
        


    async function getBrushData() {
        console.log('get brush data', frameAnnotation);
        const canvas = canvasObjRef.current;
        canvas.discardActiveObject();
        
        const img = imageObjRef.current;
        const upperCanvasCtx = canvas.getSelectionContext();
        const brushObjArr = Object.values(fabricObjListRef.current).filter(obj=>obj.type==='brush');

        if (brushObjArr.length > 0) {
            let offscreen = new OffscreenCanvas(img.width, img.height);
            const offscreenCtx = offscreen.getContext('2d');
            
            const vptCopy = [...canvas.viewportTransform];
            let vpt = [...canvas.viewportTransform];
            vpt[0] = 1; 
            vpt[3] = 1; 
            vpt[4] = -img.left;
            vpt[5] = -img.top; 
            canvas.setViewportTransform(vpt);
            canvas.renderAll();
            
            const pixelDataCollection = {};
            
            
            for (let brushObj of brushObjArr) {
                canvas.clearContext(upperCanvasCtx);
                canvas.renderCanvas(upperCanvasCtx, brushObj.pathes);
                const upperCanvasData = upperCanvasCtx.getImageData(0,0,img.width*img.scaleX,img.height*img.scaleY);
                pixelDataCollection[brushObj.id] = upperCanvasData;

                frameAnnotation[brushObj.id].pathes = getPathInfo(brushObj);
            }
            
            canvas.clearContext(upperCanvasCtx);
            canvas.setViewportTransform(vptCopy);

            for (let id in pixelDataCollection) {
                const upperCanvasData = pixelDataCollection[id];
                const resizedData = await window.createImageBitmap(upperCanvasData, 0, 0, 
                                        img.width*img.scaleX,img.height*img.scaleY, 
                                        {resizeWidth: img.width, resizeHeight: img.height});

                offscreenCtx.drawImage(resizedData, 0, 0);
                const offscreenData = offscreenCtx.getImageData(0,0,img.width, img.height);
                console.log('offscreen data', id, offscreenData);
                offscreenCtx.clearRect(0, 0, img.width, img.height);

                const pixelData = offscreenData.data;
                const pixelDataFiltered = new Uint8ClampedArray(offscreenData.data);
                const rle = [];
                let count = 1;
                let inSeg = false;
                for (let i=0; i<pixelData.length; i=i+4) {
                    if (pixelData[i+3] > 0) {
                        if (i===0) {
                            inSeg = true;
                            rle.push(0);
                        } else {
                            if (inSeg) {
                                count++;
                            } else {
                                rle.push(count);
                                count = 1;
                                inSeg = true;
                            }
                        }
                    } else {
                        if (i===0) {
                            inSeg = false;
                        } else {
                            if (!inSeg) {
                                count++;
                            } else {
                                rle.push(count);
                                count = 1;
                                inSeg = false;
                            }
                        }

                        pixelDataFiltered[i] = 0;
                        pixelDataFiltered[i+1] = 0;
                        pixelDataFiltered[i+2] = 0;
                        pixelDataFiltered[i+3] = 0;
                    }
                }
                rle.push(count);
                console.log(id, rle);
                frameAnnotation[id].data = rle;

                console.log(rle.reduce((res, count) => res+count, 0), img.width*img.height);
            }
            offscreen = null;
        } 
    }

    function getPathInfo(brushObj) {
        return brushObj.pathes.map(obj => {
            return JSON.stringify(obj.toJSON(["id"]));
          }
        )
    }

    useEffect(()=>{
        const canvas = canvasObjRef.current;
        if (canvas.freeDrawingBrush) {
            canvas.freeDrawingBrush.width = brushThickness;
        }
    },[brushThickness])


    useEffect(() => {
        if (drawType==='brush' && undo>0) {
            const brushObj = fabricObjListRef.current[annoIdToDraw];
            if (brushObj) {
                frameAnnotation[annoIdToDraw].pathes.pop();
                const path = brushObj.pathes.pop();
                if (path) {
                    canvasObjRef.current.remove(path);
                }
                if (brushObj.pathes.length === 0) {
                    delete(fabricObjListRef.current[annoIdToDraw]);
                    frameAnnotation[annoIdToDraw].pathes = null;
                }
            }
        }
    }, [undo])


    function convertAlphaFloatToHex(alphaFloat) {
        const alphaBit = alphaFloat * 255;
        const secondDigit = Math.floor(alphaBit / 16);
        const firstDigit = Math.floor(alphaBit % 16);
        const res = hexArr[secondDigit] + hexArr[firstDigit];
        return res;
    }

    function convertColorHexToBit(colorHex) {
        const charArr = colorHex.split('');
        const r = hexMap[charArr[1]] * 16 + hexMap[charArr[2]];
        const g = hexMap[charArr[3]] * 16 + hexMap[charArr[4]];
        const b = hexMap[charArr[5]] * 16 + hexMap[charArr[6]];
        return [r, g, b];
    }


    async function createFabricObjBasedOnAnnotation() {
        
        const canvas = canvasObjRef.current;
        const nextFrameAnno = await getFrameAnnotationFromDB();
        console.log('createObjBasedOnAnno', nextFrameAnno);
        if (nextFrameAnno && Object.keys(nextFrameAnno).length>0) {
            Object.keys(nextFrameAnno).forEach(id => {
                const annoObj = nextFrameAnno[id];
                console.log('1', annoObj);
                if (annoObj.frameNum === frameNum) {
                    let dataToCanvas;
                    switch (annoObj.type) {
                        case 'keyPoint':
                            dataToCanvas = getKeypointCoordToCanvas(annoObj);
                            createKeyPoint(dataToCanvas, annoObj);
                            break;
                        case 'bbox':
                            dataToCanvas = getBBoxCoordToCanvas(annoObj);
                            createBBox(dataToCanvas, annoObj);
                            break;
                        case 'polygon':
                            dataToCanvas = getPolygonCoordToCanvas(annoObj);
                            createPolygon(dataToCanvas, annoObj);
                            break;
                        case 'skeleton':
                            dataToCanvas = getSkeletonCoordToCanvas(annoObj);
                            createSkeleton(dataToCanvas, annoObj);
                            break;
                    }
                }
            });

            console.log('canvas objs after createObjBasedOnAnno', canvas.getObjects());
            canvas.getObjects().forEach(obj=>{
                if (obj.id || obj.owner) {
                    canvas.bringToFront(obj);
                }
            });
            canvas.renderAll();


        }

        setGetAdditionalDataSignal(true);

    }

    async function getFrameAnnotationFromDB() {
        if (Number.isInteger(frameNum) && videoId) {
            const res = await getFrameAnnotation(frameNum, videoId);
            if (res?.annotations?.length > 0) {
                const frameAnno = {};
                res.annotations.forEach((anno) => frameAnno[anno.id] = anno);
                return frameAnno;
            } else {
                return {};
            }
        }
        
    }

    
    function scaleImage(canvas, image) {
        const scale = Math.min(canvas.width/image.width, canvas.height/image.height);
        image.set({scaleX: scale, scaleY: scale});
        const offsetX = (canvas.width - image.width * scale) / 2;
        const offsetY = (canvas.height - image.height * scale) / 2;
        if (offsetX > 0) {
            image.set({left: offsetX});
        } else {
            image.set({top: offsetY});
        }
    }


    async function imageLoadHandler(){
        if (!frameNum) {
            imageObjRef.current.width = imgRef.current.width;
            imageObjRef.current.height = imgRef.current.height;
            scaleImage(canvasObjRef.current, imageObjRef.current);
        }
        console.log('img load handler', frameUrl, imgRef.current.url);
        
        await createFabricObjBasedOnAnnotation();
        canvasObjRef.current.renderAll();
    }


    /*  For the next six functions
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

    function getSkeletonCoordToImage(obj) {
        const oldData = frameAnnotation[obj.id].data;
        const newData = oldData.map((coorArr,i) => {
            const p = obj.landmarks[i];
            if (p) {
                const newPoint = getPointCoordToImage(p.getCenterPoint());
                return [newPoint.x, newPoint.y, coorArr[2]];
            } else {
                return coorArr;
            }
        });
        return newData;
    }

    


    /*  For the next five functions
        obj contains coordinates/width/height relative to img plane
        convert to coordinates relative to canvas plane 
    */
    function getPointCoordToCanvas(point){
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

    function getSkeletonCoordToCanvas(obj) {
        return obj.data.map(([x,y,v]) => {
            if (v===0) {
                return {x:null, y:null};
            } else {
                return getPointCoordToCanvas({x:x, y:y});
            }
        });
    }


    function wheelHandler(opt) {
        const e = opt.e;
        const canvas = canvasObjRef.current;
        let zoom = canvas.getZoom();
        const sensitivity = props.wheelSensitivity ? props.wheelSensitivity : WHEEL_SENSITIVITY;
        zoom += e.deltaY * sensitivity /10000;
        zoom = Math.max(1, zoom);
        canvas.zoomToPoint({x: e.offsetX, y: e.offsetY}, zoom);
        if (zoom == 1) {
            let vpt = canvas.viewportTransform;
            vpt[4] = 0;
            vpt[5] = 0;
        }
        e.preventDefault();
        e.stopPropagation();
    }


    function mouseDblclickHandler() {
        console.log('dbclick');
        const canvas = canvasObjRef.current;
        if (canvas.getActiveObject() && canvas.getActiveObject().type === 'polygon') {
            const polygon = canvas.getActiveObject();
            canvas.editPolygon = true;
            canvas.editingPolygonId = polygon.id;

            const newPoints = getUpdatedPolygonPoints(polygon);
            const idObjToEdit = frameAnnotation[polygon.id];
            polygon.pointObjects = newPoints.map((p, i) => createPoint(p, idObjToEdit, i));
            polygon.pointObjects.forEach(p => {p.lockMovementX=false; p.lockMovementY=false});
            polygon.lineObjects = newPoints.map((p, i) => i<newPoints.length-1 ? createLine(p, newPoints[i+1], frameAnnotation[polygon.id]) : createLine(p, newPoints[0], idObjToEdit))
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
            if (e.altKey === true) {
                setupCanvasDrag(e);
            }

            canvas.activeObj = null;
            canvas.isEditingObj = null;
            setActiveAnnoObj(null);
        }

        if (canvas.getActiveObject()){
            const activeObj = canvas.getActiveObject();
            if (ANNOTATION_TYPES.has(activeObj.type)) {
                addActiveIdObj(activeObj);
            } else if (activeObj.type === 'skeletonPoint' && !drawType) {
                const skeletonObj = fabricObjListRef.current[activeObj.owner];
                addActiveIdObj(skeletonObj);
            }
        }

        if (drawType === 'keyPoint') {
            const annoObjToDraw = {...frameAnnotation[annoIdToDraw]};
            createKeyPoint(canvas.getPointer(), annoObjToDraw);
        }

        if (drawType === 'bbox') {
            canvas.bboxIdObjToDraw = {...frameAnnotation[annoIdToDraw]};
            canvas.bboxStartPosition = canvas.getPointer();
        }
        
        if (drawType === 'polygon') {
            drawPolygon();
        }

        if (canvas.editPolygon) {
            if (!canvas.getActiveObject()) {
                finishEditPolygon();
            } else if (canvas.getActiveObject()?.type !== 'polygonPoint'
            || canvas.getActiveObject()?.owner != canvas.editingPolygonId){
                const activeObj = canvas.getActiveObject();
                finishEditPolygon();
                if (ANNOTATION_TYPES.has(activeObj.type)) {
                    addActiveIdObj(activeObj);
                } else if (activeObj.type==='skeletonPoint' && drawType !== 'skeleton') {
                    canvas.isDraggingSkeletonPoint = true;
                    canvas.setActiveObject(activeObj);
                } else {
                    canvas.setActiveObject(null);
                }
            } else {    
                canvas.isDraggingPolygonPoint = true;
            }
        }

        if (canvas.getActiveObject() && canvas.getActiveObject().type==='skeletonPoint' && drawType !== 'skeleton') {
            canvas.isDraggingSkeletonPoint = true;
            console.log(canvas.isDraggingSkeletonPoint);
        }

        if (drawType === 'skeleton') {
            canvas.isDrawingSkeleton = true;
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
        if (drawType==='bbox' && canvas.bboxStartPosition) {
            drawBBox();
        }
        if (canvas.activeObj && canvas.isEditingObj) {
            setActiveObjData();
        }
        if (canvas.isDraggingSkeletonPoint) {
            dragSkeletonPoint();
        }
       
    }


    function setActiveObjData(){
        /* retrieve canvas.activeObj, calculate its data (coordinates) relative to image
           update its data in frameAnnotation, and parent's activeIdObj
        */
        const canvas = canvasObjRef.current;
        const obj = canvas.activeObj;
        let data;
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
            case 'skeleton':
                data = getSkeletonCoordToImage(obj);
                break;
        }
        const newAnnoObj = {...frameAnnotation[obj.id], data: data}; 
        setFrameAnnotation({...frameAnnotation, [obj.id]: newAnnoObj});
        setActiveAnnoObj(newAnnoObj)
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

        if (drawType === 'bbox') {
            canvas.bboxEndPosition = canvas.getPointer();
            finishDrawBBox();

            canvas.isEditingObj = false;
        }
    }


    function deleteKeyHandler(e) {
        if ((e.key === 'Backspace' || e.key === 'Delete') 
        && canvasObjRef.current.getActiveObject()
        && canvasObjRef.current.getActiveObject().type !== 'polygonPoint'
        ) {
            setInfo(null);
            removeObj();
        }
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
        
        const idToDraw = annoIdToDraw;
        const idObjToDraw = {...frameAnnotation[idToDraw]};

        const clickPoint = canvas.getPointer();
       
        if (canvas.polygonPoints.length===0 && canvas.polygonLines.length===0) {
            const point = createPoint(clickPoint, idObjToDraw, 0);
            canvas.add(point).setActiveObject(point);
            canvas.polygonPoints.push(point);
        } else if (canvas.polygonPoints.length - canvas.polygonLines.length == 1) {
            const startPoint = canvas.polygonPoints[0].getCenterPoint();
            if (Math.abs(startPoint.x - clickPoint.x) <= CLICK_TOLERANCE 
            && Math.abs(startPoint.y - clickPoint.y) <= CLICK_TOLERANCE 
            && canvas.polygonPoints.length >= 3) {
                const prePoint = canvas.polygonPoints[canvas.polygonPoints.length-1].getCenterPoint();
                const line = createLine(prePoint, startPoint, idObjToDraw)
                canvas.polygonLines.push(line);
                canvas.add(line);

                createPolygon(canvas.polygonPoints.map(p => p.getCenterPoint()), idObjToDraw);
                
                canvas.polygonPoints.forEach(p=>canvas.remove(p));
                canvas.polygonLines.forEach(l=>canvas.remove(l));
                canvas.polygonPoints=[];
                canvas.polygonLines=[];
                setDrawType(null);
                setAnnoIdToDraw(null);


            } else {
                const point = createPoint(clickPoint, idObjToDraw, canvas.polygonPoints.length);
                const prePoint = canvas.polygonPoints[canvas.polygonPoints.length-1];
                const line = createLine(prePoint.getCenterPoint(), point.getCenterPoint(), idObjToDraw)
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
        
        const idToDraw = annoIdToDraw
        const annoObjToDraw = {...frameAnnotation[idToDraw]};
        const landmarkToDraw = btnConfigData[annoObjToDraw.groupIndex].childData[skeletonLandmark];
        const landmarkInfo = {
            id: idToDraw,
            color: landmarkToDraw.color,
            type: landmarkToDraw.btnType,
        }
        const landmarkTotalNum = btnConfigData[annoObjToDraw.groupIndex].childData.length;
        const edgesInfo = btnConfigData[annoObjToDraw.groupIndex].edgeData;
        
        const clickPoint = canvas.getPointer();
        const landmark = createPoint(clickPoint, landmarkInfo, skeletonLandmark);
        
        canvas.add(landmark).setActiveObject(landmark);
        
        if (edgesInfo?.edges && edgesInfo.edges[skeletonLandmark]) {
            const neighbors = new Set(edgesInfo.edges[skeletonLandmark]);
            const edgeColor = edgesInfo.color;
            const edgeInfo = {
                id: idToDraw,
                type: landmarkToDraw.btnType,
                color: edgeColor,
            }
            canvas.skeletonPoints.forEach(p => {
                if (neighbors.has(p.index)) {
                    const line = createLine(p.getCenterPoint(), landmark.getCenterPoint(), edgeInfo);
                    canvas.add(line);
                    canvas.bringToFront(landmark);
                    canvas.bringToFront(p);
                    canvas.skeletonLines[`${p.index}-${landmark.index}`] = line;
                }
            })
        }

        canvas.skeletonPoints[skeletonLandmark] = (landmark);


        if (skeletonLandmark < landmarkTotalNum - 1) {
            setSkeletonLandmark(skeletonLandmark + 1);
        } else {
            setSkeletonLandmark(null);
            setDrawType(null);
            setAnnoIdToDraw(null);
        }
    }


    function finishDrawSkeleton() {
        console.log('finishDrawSkeleton called');
        const canvas = canvasObjRef.current;
        canvas.skeletonPoints.forEach(p => {p.lockMovementX=false; p.lockMovementY=false});
        const idToDraw = getIdToDraw();
        const skeletonObj = {
            id: idToDraw,
            type: 'skeleton',
            landmarks: canvas.skeletonPoints,
            edges: canvas.skeletonLines,
        };
        fabricObjListRef.current[idToDraw] = skeletonObj;
        canvas.skeletonPoints = [];
        canvas.skeletonLines = {};
        
        addActiveIdObj(skeletonObj);
        
    }


    function createKeyPoint(data, annoObjToDraw) {
        const canvas = canvasObjRef.current;
        const idTodraw = annoObjToDraw.id;
        const point = createPoint(data, annoObjToDraw, 0);
        point.id = idTodraw;
        point.type = 'keyPoint';
        point.hasControls = false;
        point.hasBorders = false;
        fabricObjListRef.current[idTodraw] = point;
        canvas.add(point)
        if (drawType==='keyPoint') {
            canvas.setActiveObject(point);
            addActiveIdObj(point);
            setDrawType(null);
            setAnnoIdToDraw(null);
        }
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
            fabricObjListRef.current[bboxObj.id] = bboxObj;
            canvas.add(bboxObj).setActiveObject(bboxObj);
            addActiveIdObj(bboxObj);
        } else {
            const annotationList = {...frameAnnotation};
            delete(annotationList[idObj.id]);
            setFrameAnnotation(annotationList);
        }   
        canvas.bboxStartPosition = null;
        canvas.bboxEndPosition = null;
        canvas.bboxIdObjToDraw = null;
        canvas.bboxLines.forEach(l => canvas.remove(l));
        canvas.bboxLines = [];
        setDrawType(null);
        setAnnoIdToDraw(null);
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
            left: data.left,
            top: data.top,
            width: data.width,
            height: data.height,
            stroke: annoObjToDraw.color,
            strokeWidth: props.strokeWidth ? props.strokeWidth : STROKE_WIDTH,
            strokeUniform: true,
            fill: null,
            lockRotation: true,
            lockScalingFlip: true,
            lockSkewingX: true,
            lockSkewingY: true,
            hasRotatingPoint: false
        });
        fabricObjListRef.current[bboxObj.id] = bboxObj;
        canvas.add(bboxObj);
    }

    
    function createPoint(clickPoint, annoObj, index) {
        const point = new fabric.Circle({
            left: clickPoint.x,
            top: clickPoint.y,
            radius: props.circleRadius ? props.circleRadius : CIRCLE_RADIUS,
            originX: 'center',
            originY: 'center',
            strokeWidth: 1,
            strokeUniform: true,
            stroke: annoObj.color,
            fill: annoObj.type==='keyPoint'?annoObj.color:'white',
            lockScalingX: true,
            lockScalingY: true,
            lockRotation: true,
            lockScalingFlip: true,
            lockSkewingX: true,
            lockSkewingY: true,
            hasControls: false,
            lockMovementX: annoObj.type==='skeleton'||annoObj.type==='polygon' ? true : false,
            lockMovementY: annoObj.type==='skeleton'||annoObj.type==='polygon' ? true : false,
            type: annoObj.type + 'Point', 
            owner: annoObj.id,
            index: index,
        })
        point.on('mouseover', (opt)=>{
            opt.target.set({
                strokeWidth: 2,
                fill: annoObj.type==='keyPoint'?false:'white',
                scaleX: 2,
                scaleY: 2,
            });
            canvasObjRef.current.renderAll();
        });
        point.on('mouseout', (opt)=>{
            opt.target.set({
                strokeWidth: 1,
                fill: annoObj.type==='keyPoint'?annoObj.color:'white',
                scaleX: 1,
                scaleY: 1,
            });
            canvasObjRef.current.renderAll();
        });
        return point;
    }


    function createLine(startPoint, endPoint, idObj){
        return new fabric.Line([
            startPoint.x, startPoint.y, endPoint.x, endPoint.y
        ], {
            strokeWidth: props.strokeWidth ? props.strokeWidth : STROKE_WIDTH,
            stroke: idObj.color,
            selectable: false,
            type: idObj.type+'Line',
            owner: idObj.id,
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
            strokeWidth: props.strokeWidth ? props.strokeWidth : STROKE_WIDTH,
            strokeUniform: true,
            fill: false,
            lockScalingFlip: true,
            lockSkewingX: true,
            lockSkewingY: true,
        }); 
        fabricObjListRef.current[polygon.id] = polygon;
        canvas.add(polygon);
        if (drawType || canvas.editPolygon) {
            canvas.setActiveObject(polygon);
            addActiveIdObj(polygon);
        }  
    }

    function createSkeleton(points, annoObjToDraw) {
        const canvas = canvasObjRef.current;
        const id = annoObjToDraw.id;
        if (btnConfigData[annoObjToDraw.groupIndex]?.groupType==='skeleton') {
            const landmarksToDraw = btnConfigData[annoObjToDraw.groupIndex].childData;
            const edgesInfo = btnConfigData[annoObjToDraw.groupIndex].edgeData;
            const landmarksDrawn = [];
            const edgesDrawn = {};
    
            points.forEach((point, i) => {
                if (annoObjToDraw.data[i][2]!==0) {
                    const landmarkInfo = {
                        id: id,
                        color: landmarksToDraw[i].color,
                        type: landmarksToDraw[i].btnType,
                    }
                    const landmark = createPoint(point, landmarkInfo, i);
                    canvas.add(landmark);
                    landmarksDrawn[i] = landmark;
        
                    if (edgesInfo?.edges && edgesInfo.edges[i]) {
                        const neighbors = new Set(edgesInfo.edges[i]);
                        const edgeColor = edgesInfo.color;
                        const edgeInfo = {
                            id: id,
                            type: landmarksToDraw[i].btnType,
                            color: edgeColor,
                        }
                        for (let n=0; n<i; n++) {
                            if (landmarksDrawn[n] && neighbors.has(n)) {
                                const line = createLine(point, points[n], edgeInfo);
                                canvas.add(line);
                                edgesDrawn[`${landmarksDrawn[n].index}-${landmark.index}`] = line;
                            }
                        }
                    }
                }
            })
            landmarksDrawn.forEach(p => {
                p.lockMovementX=false; 
                p.lockMovementY=false;
                canvas.bringToFront(p);});
    
            const skeletonObj = {
                id: id,
                type: 'skeleton',
                landmarks: landmarksDrawn,
                edges: edgesDrawn,
            };
            fabricObjListRef.current[id] = skeletonObj;
        }
        
    }

    async function createPathes() {
        console.log('createPath', frameNum);
        const nextFrameAnno = await getFrameAnnotationFromDB(frameNum, videoId);
        const pathStrArr=[];
        if (nextFrameAnno && Object.keys(nextFrameAnno).length>0) {
            Object.keys(nextFrameAnno).forEach(id => {
                const annoObj = nextFrameAnno[id];
                if (annoObj.frameNum === frameNum && annoObj.type === 'brush' && annoObj.pathes?.length > 0) {
                    annoObj.pathes.forEach(str => pathStrArr.push(str));
                }
            })
        }
        console.log(pathStrArr);

        if (pathStrArr.length > 0) {
            const canvas = canvasObjRef.current;
            canvas.remove(imageObjRef.current);
            let pathStr = pathStrArr.reduce((res, p) => res+p+',', '');
            pathStr = pathStr.slice(0, -1);
            console.log('path',pathStr);
            const canvasStr = JSON.stringify(canvas);
            console.log('before add path',canvasStr);
            const prefix = canvasStr.search('objects');
            const newCanvasStr = canvasStr.slice(0, prefix-1) + '"objects":[' 
                                    + pathStr +canvasStr.slice(prefix+10);
            console.log('after add path',newCanvasStr);
            canvas.loadFromJSON(newCanvasStr,canvas.renderAll.bind(canvas));
            const pathes = canvas.getObjects();
            pathes.forEach(obj=>{
                obj.selectable = false;
                addPathObjToRef(obj);
            });
            canvas.add(imageObjRef.current);
        }       
        console.log('canvas objs after createPath:', canvasObjRef.current.getObjects());
    }


    function dragCanvas(e) {
        const canvas = canvasObjRef.current;
        let vpt = canvas.viewportTransform;
        let zoom = canvas.getZoom();
        let tempX = vpt[4] + e.clientX - canvas.lastPosX;
        let tempY = vpt[5] + e.clientY - canvas.lastPosY;
        vpt[4] = Math.max(Math.min(0, tempX), canvas.getWidth() - canvas.getWidth()*zoom);
        vpt[5] = Math.max(Math.min(0, tempY), canvas.getHeight() - canvas.getHeight()*zoom);
        canvas.requestRenderAll();
        canvas.lastPosX = e.clientX;
        canvas.lastPosY = e.clientY;
    }

    function dragPolygonPoint() {
        const canvas = canvasObjRef.current;
        const point = canvas.getActiveObject();
        const polygon = fabricObjListRef.current[point.owner];
        const idObjToEdit = frameAnnotation[point.owner];
        const prePointIndex = point.index>0 ? point.index-1 : polygon.lineObjects.length-1;
        const postPointIndex = point.index<polygon.pointObjects.length-1 ? point.index+1 : 0;
        const newPreLine = createLine(polygon.pointObjects[prePointIndex].getCenterPoint(), point.getCenterPoint(), idObjToEdit)
        const newPostLine = createLine(point.getCenterPoint(), polygon.pointObjects[postPointIndex].getCenterPoint(), idObjToEdit)
        canvas.remove(polygon.lineObjects[prePointIndex], polygon.lineObjects[point.index]);
        polygon.lineObjects[prePointIndex] = newPreLine;
        polygon.lineObjects[point.index] = newPostLine;
        canvas.add(newPreLine, newPostLine);
        canvas.bringToFront(polygon.pointObjects[prePointIndex]);
        canvas.bringToFront(polygon.pointObjects[postPointIndex]);
    }

    function dragSkeletonPoint() {
        const canvas = canvasObjRef.current;
        
        const point = canvas.getActiveObject();
        const edgesInfo = btnConfigData[frameAnnotation[point.owner].groupIndex].edgeData;
        if (edgesInfo) {
            const landmarks = fabricObjListRef.current[point.owner].landmarks;
            const edgeInfo = {
                id: point.owner,
                type: 'skeleton',
                color: edgesInfo.color,
            }
            if (edgesInfo.edges[point.index]?.length>0) {
                const neighbors = edgesInfo.edges[point.index];
                neighbors.forEach(n => {
                    const neighborObj = landmarks[n];
                    if (neighborObj) {
                        const edge = createLine(neighborObj.getCenterPoint(), point.getCenterPoint(), edgeInfo);
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
                })
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


    function finishEditPolygon() {
        const canvas = canvasObjRef.current;
        const polygon = fabricObjListRef.current[canvas.editingPolygonId];
        const idObjToEdit = frameAnnotation[canvas.editingPolygonId];
        createPolygon(polygon.pointObjects.map(p => p.getCenterPoint()),idObjToEdit);
        polygon.pointObjects.forEach(p=>canvas.remove(p));
        polygon.lineObjects.forEach(l=>canvas.remove(l));
        canvas.editPolygon = false;
        canvas.editingPolygonId = null;
    }


    async function removeObj() {
        const canvas = canvasObjRef.current;
        const activeObj = canvas.getActiveObject();
        
        if (activeObj.type === 'skeletonPoint') {
            if (!drawType) {
                const annoId = activeObj.owner;
                const skeletonObj = fabricObjListRef.current[annoId];
                skeletonObj.landmarks.forEach(p => canvas.remove(p));
                Object.entries(skeletonObj.edges).forEach(([_, line]) => canvas.remove(line));
                
                const res = await deleteAnnotation(annoId);
                if (res['error']) {
                    setInfo(res['error']);
                } else if (res['success']) {
                    setInfo(null);
                    delete(fabricObjListRef.current[annoId]);
                    const frameAnnoCopy = {...frameAnnotation};
                    delete(frameAnnoCopy[annoId]);
                    setFrameAnnotation(frameAnnoCopy);
                } 
            }
        } else {
            const res = await deleteAnnotation(activeObj.id);
            if (res['error']) {
                setInfo(res['error']);
            } else if (res['success']) {
                setInfo(null);
                delete(fabricObjListRef.current[activeObj.id]);
                const frameAnnoCopy = {...frameAnnotation};
                delete(frameAnnoCopy[activeObj.id]);
                setFrameAnnotation(frameAnnoCopy);
                
                canvas.remove(activeObj);
            }
        }

        canvas.activeObj = null;
        canvas.isEditingObj = null;
        setActiveAnnoObj(null);
    }

    function addActiveIdObj(activeObj) {
        const canvas = canvasObjRef.current;
        canvas.activeObj = activeObj;
        canvas.isEditingObj = true;
        setActiveObjData();
    }

    function getIdToDraw() {
        const existingIds = new Set(Object.keys(fabricObjListRef.current));
        let idToDraw;

            idToDraw = Object.entries(frameAnnotation).filter(([id, annoObj]) => !existingIds.has(id) && ANNOTATION_TYPES.has(annoObj.type))[0][0];
        return idToDraw;
    }



    return (
        <>
        <div className={styles.canvasContainer}
             style={{width: props.width?props.width:CANVAS_WIDTH, height: props.height?props.height:CANVAS_HEIGHT}}>
            {}
            <canvas id='canvas' ref={canvasRef} className={styles.canvas}>
                <img id='image' ref={imgRef} className={styles.image} alt="img"/>
            </canvas>
            <p>{info}</p>
        </div>
        {/* <div style={{display: 'flex', flexWrap: 'row'}}>
            <canvas ref={testCanvasRef1} style={{border: 'solid'}}></canvas>
            <canvas ref={testCanvasRef2} style={{border: 'solid'}}></canvas>
        </div> */}
        
        {}
        </>
      )
}