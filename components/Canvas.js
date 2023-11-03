import React, {useEffect, useRef} from 'react';
import styles from '../styles/Canvas.module.css';
import {fabric} from 'fabric';
import { useStates, useStateSetters } from './AppContext';
import { defaultAlpha, hexArr, hexMap } from '../utils/utils';

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 500;
const CIRCLE_RADIUS = 3;
const STROKE_WIDTH = 2;

const WHEEL_SENSITIVITY = 10;
const CLICK_TOLERANCE = 5;
// const COLOR_TOLERANCE = 10; //TODO
const ANNOTATION_TYPES = new Set(['keyPoint', 'bbox', 'polygon', 'skeleton', 'brush']);


export default function Canvas(props) {
    /**
     * props:
     *      width: canvas width
     *      height: canvas height
     *      circleRadius: radius for keypoint, skeleton landmark, polygon point
     *      strokeWidth: thinkness of line
     *      wheelSensitivity: wheel sensitivity for zooming
     *      alpha: number, [0,1]. transparency for segementation (brush) drawing
     */
    const imgRef = useRef();
    const imageObjRef = useRef();
    const canvasRef = useRef();
    const canvasObjRef = useRef();
    const testCanvasRef = useRef();
    // const keyPointObjListRef = useRef({});
    // const bboxObjListRef = useRef({});
    // const polygonObjListRef = useRef({});
    const fabricObjListRef = useRef({}); // for skeleton: annoId: {id: annoId, type: 'skeleton', landmarks: [KeyPoints (if not labelled, then that entry is empty/undefined)], edges: {'0-1': Line, ...} }
                                         // for brush: annoId: {id: annoId, type: 'brush', pathes: []}
    const prevDrawTypeRef = useRef({});

    const videoId = useStates().videoId;
    const frameUrl = useStates().frameUrl;
    const frameNum = useStates().frameNum;
    const drawType = useStates().drawType;
    const setDrawType = useStateSetters().setDrawType;
    const skeletonLandmark = useStates().skeletonLandmark;
    const setSkeletonLandmark = useStateSetters().setSkeletonLandmark;
    const frameAnnotation = useStates().frameAnnotation;
    // const setFrameAnnotation = useStateSetters().setFrameAnnotation;
    const btnConfigData = useStates().btnConfigData;
    const setActiveAnnoObj = useStateSetters().setActiveAnnoObj;
    const brushThickness = useStates().brushThickness;
    const useEraser = useStates().useEraser;
    const undo = useStates().undo;
    // const setUndo = useStateSetters().setUndo;
    const annoIdToDraw = useStates().annoIdToDraw;
    const setAnnoIdToDraw = useStateSetters().setAnnoIdToDraw;
    // const projectType = useStates().projectType;
    
    console.log('canvas render');
    // fabric.Object.prototype.erasable = false;

    //Set up canvas
    useEffect(() => {
        if (!canvasObjRef.current) {
            // activate brushCanvas
            // const brushCanvasObj = new fabric.Canvas('brushCanvas', {
            //     width: props.width ? props.width : CANVAS_WIDTH,
            //     height: props.height ? props.height : CANVAS_HEIGHT,
            // })
            // brushCanvasObjRef.current = brushCanvasObj;

            const canvasObj = new fabric.Canvas('canvas', {
                width: props.width ? props.width : CANVAS_WIDTH,
                height: props.height ? props.height : CANVAS_HEIGHT,
                polygonPoints: [],
                polygonLines: [],
                bboxLines: [],
                skeletonPoints: [],
                skeletonLines: {}, //{'pointIndex1-pointIndex2': Line(), ...}, index1 < index2
                hoverCursor: 'pointer',
                freeDrawingCursor: 'pointer',
                enableRetinaScaling: false,
                stopContextMenu: true
            });
            
            // canvasObj.on('mouse:down', //(opt) => {
            //     mouseDownHandler//(opt.e, canvasObj);
            // );

            canvasObjRef.current = canvasObj;

            // activate brushCanvas
            // const brushCanvasObj = new fabric.Canvas('brushCanvas', {
            //     width: props.width ? props.width : CANVAS_WIDTH,
            //     height: props.height ? props.height : CANVAS_HEIGHT,
            // })
            // brushCanvasObjRef.current = brushCanvasObj;

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
        // if (canvasObjRef.current) {
            canvasObjRef.current.on('mouse:wheel', wheelHandler);
            canvasObjRef.current.on('mouse:down', mouseDownHandler);
            canvasObjRef.current.on('mouse:dblclick', mouseDblclickHandler);
            canvasObjRef.current.on('mouse:move', mouseMoveHandler);
            canvasObjRef.current.on('mouse:up', mouseUpHandler);
            canvasObjRef.current.on("path:created", pathCreateHandler); // make draw brush unselectable
                
        // }
        document.addEventListener("keydown", deleteKeyHandler); // add delete key event listener

        // console.log(canvasObjRef.current.__eventListeners);

        return () => {
            // if (canvasObjRef.current) {
                const eventListeners = canvasObjRef.current.__eventListeners;
                // if (eventListeners) {
                    Object.keys(eventListeners).forEach(key => eventListeners[key]=[]);
                // }
            // }
            document.removeEventListener("keydown", deleteKeyHandler);
            if (imgRef.current) {
                imgRef.current.removeEventListener("load", imageLoadHandler);
            }
        }
      }, [videoId, frameUrl, frameNum, drawType, skeletonLandmark, frameAnnotation, btnConfigData, brushThickness, undo, annoIdToDraw, useEraser] /////check if these are enough
    )


    useEffect(()=> {
        //When switch video, remove current imgObj, create a new blank imgObj
        canvasObjRef.current.remove(imageObjRef.current);
        const imageObj = new fabric.Image(imgRef.current, {
            selectable: false,
            width: canvasObjRef.current.width,
            height: canvasObjRef.current.height,
        });
        canvasObjRef.current.add(imageObj);
        canvasObjRef.current.renderAll();
        imageObjRef.current = imageObj;
        
      }, [videoId]
    )



    useEffect(() => {
        console.log('canvas frameUrl useEffect: canvas clear');

        // update image when url changes
        if (frameUrl) {
            imgRef.current.src = frameUrl;
        } else {
            imgRef.current.src = '';
        }

        // when switch frame, get brush data before clear canvas
        getBrushData();

        // remove fabric object
        const canvas = canvasObjRef.current;
        if (Object.keys(fabricObjListRef.current).length>0) {
            Object.keys(fabricObjListRef.current).forEach(id => {
                const obj = fabricObjListRef.current[id];
                if (obj.type==='skeleton') {
                    obj.landmarks.forEach(l => {
                        if (l) { //if l is labelled
                            canvas.remove(l);
                        };
                    });
                    Object.entries(obj.edges).forEach(([_, line])=>canvas.remove(line));
                } else if (obj.type==='brush') {
                    obj.pathes.forEach( p => canvas.remove(p));
                } else {
                    canvas.remove(obj);
                }} 
            );
            fabricObjListRef.current = {};
        }

        // remove unfinished objects
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
        
        //reset all drawing/editing/dragging property
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

      }, [frameUrl]
    )

    
    // useEffect(() => {
    //     //when frame changes, update objects on canvas
    //     if (Object.keys(fabricObjListRef.current).length>0) {
    //         Object.keys(fabricObjListRef.current).forEach(id => 
    //             canvasObjRef.current.remove(fabricObjListRef.current[id]));
    //         fabricObjListRef.current = {};
    //     }

    //     // createFabricObjBasedOnAnnotation();
    //   }, [frameAnnotation]
    // )

    useEffect(() => {
        const canvas = canvasObjRef.current;
        // remove unfinished objects
        canvas.polygonPoints.forEach(p=>canvas.remove(p));
        canvas.polygonLines.forEach(l=>canvas.remove(l));
        canvas.skeletonPoints.forEach(p=>canvas.remove(p));
        Object.keys(canvas.skeletonLines).forEach(name=>canvas.remove(canvas.skeletonLines[name]));
        canvas.polygonPoints = [];
        canvas.polygonLines = [];
        canvas.skeletonPoints = [];
        canvas.skeletonLines = {};
        canvas.isDrawingSkeleton = null;
        canvas.renderAll();
        
    }, [frameAnnotation])


    useEffect(() => {
        console.log('canvas drawtype useEffect');
        const canvas = canvasObjRef.current;

        if (!drawType) {
            if (canvas.isDrawingSkeleton) { // user choose the last landmark as 'not labelled' in skeletonBtn and finish drawing skeleton
                finishDrawSkeleton(); //pass skeletonObj to fabricObjListRef
                canvas.isDrawingSkeleton=false;
            }

            if (prevDrawTypeRef.current==='brush') { // user click on the same brush btn to inactivate it
                resetBrush();
                // canvas.clear();
                // const ctx = canvasRef.current.getContext("2d");
                // const img = imageObjRef.current;
                // const imageData = ctx.getImageData(0,0,500,50);
                // console.log('imgData', img.left, img.top, img.width,img.scaleX, img.height,img.scaleY, img);
                // console.log( imageData, imageData.data.filter(n=>n>0));
                
                // console.log('paths', fabricObjListRef.current);
                getBrushData();
                setAnnoIdToDraw(null); // should not be set too early, since need annoId to generate rle 
            }
        }
        else if (drawType==='brush') { // when other anno is being drawn, user clicked on brush btn
            setPencilBrush();
        }
        else {
            if (prevDrawTypeRef.current==='brush') { // when brush btn is activated, user click on another draw btn
                resetBrush();
                getBrushData();
                // setAnnoIdToDraw(null); // should not use. the other draw btn already set annoIdToDraw to their id
            }
        }
        prevDrawTypeRef.current = drawType;
    }, [drawType])

    
    useEffect(()=> {
        // when a brushBtn is clicked, user click on another brushBtn, thus change annoIdToDraw but keep drawType 'brush', should call getBrushData()
        console.log(annoIdToDraw, frameAnnotation, frameAnnotation[annoIdToDraw]);
        if (annoIdToDraw && frameAnnotation[annoIdToDraw]?.type==='brush' && prevDrawTypeRef.current==='brush') {
            resetBrush();
            setPencilBrush();
        }

        return ()=>{
            if (annoIdToDraw && frameAnnotation[annoIdToDraw]?.type==='brush'){ //annoIdToDraw hasn't changed, should point to prev brush annoObj
                getBrushData(); 
            }
        }
    }, [annoIdToDraw])


    function setPencilBrush() {
        const canvas = canvasObjRef.current;
        const annoObj = frameAnnotation[annoIdToDraw];
        canvas.isDrawingMode = true;
        canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
        // console.log('drawBrush');
        canvas.freeDrawingBrush.limitedToCanvasSize = true; //When `true`, the free drawing is limited to the whiteboard size
        const alphaFloat = props.alpha?props.alpha:defaultAlpha;
        canvas.freeDrawingBrush.color = annoObj.color + convertAlphaFloatToHex(alphaFloat);
        // console.log('setBrush', annoObj,canvas.freeDrawingBrush.color);
        canvas.freeDrawingBrush.width = brushThickness;
    }

    function resetBrush() {
        const canvas = canvasObjRef.current;
        canvas.isDrawingMode = false;
        canvas.freeDrawingBrush = null;
    }

    useEffect(()=>{
        if (drawType==='brush') {
            if (useEraser) {
                setEraserBrush();
            } else {
                setPencilBrush();
            }
        }        
        
    }, [useEraser])

    function setEraserBrush() {
        const canvas = canvasObjRef.current;
        // const annoObj = frameAnnotation[annoIdToDraw];
        canvas.isDrawingMode = true;
        canvas.freeDrawingBrush = new fabric.EraserBrush(canvas);
        console.log('setEraserBrush');
        // canvas.freeDrawingBrush.limitedToCanvasSize = true; //When `true`, the free drawing is limited to the whiteboard size
        // const alphaFloat = props.alpha?props.alpha:defaultAlpha;
        // canvas.freeDrawingBrush.color = annoObj.color + convertAlphaFloatToHex(alphaFloat);
        // console.log('setBrush', annoObj,canvas.freeDrawingBrush.color);
        canvas.freeDrawingBrush.width = brushThickness;
    }

    function pathCreateHandler(e) {
        if (drawType==='brush') {
            e.path.selectable=false;
            e.path.erasable=true;
            // console.log(e.path);

            // check if fabricObjListRef has this brush obj, if not, create one
            const existingIds = new Set(Object.keys(fabricObjListRef.current));
            if (!existingIds.has(annoIdToDraw)) {
                const brushObj = {
                    id: annoIdToDraw,
                    type: 'brush',
                    pathes: [],
                    // eraserPaths: []
                }
                fabricObjListRef.current[annoIdToDraw] = brushObj;
            }

            // const brushObj = {...fabricObjListRef.current[annoIdToDraw]};
            
            //TODO
            // if (useEraser) {
            //     brushObj.eraserPaths.push(e.path);
            // } else {
                // brushObj.pathes.push(e.path);
            // }
            // fabricObjListRef.current = {...fabricObjListRef.current, [annoIdToDraw]:brushObj};
            fabricObjListRef.current[annoIdToDraw].pathes.push(e.path);
            console.log('brushObj', annoIdToDraw, fabricObjListRef.current[annoIdToDraw]);
        }
    }


    async function getBrushData() {
        console.log('get brush data');
        const canvas = canvasObjRef.current;
        const img = imageObjRef.current;
        const upperCanvasCtx = canvas.getSelectionContext();
        const brushObjArr = Object.values(fabricObjListRef.current).filter(obj=>obj.type==='brush');
        // console.log(brushObjArr);

        if (brushObjArr.length > 0) {
            let offscreen = new OffscreenCanvas(img.width, img.height);
            const offscreenCtx = offscreen.getContext('2d');
            
            const vptCopy = [...canvas.viewportTransform];
            // canvas.zoom = 1;
            let vpt = [...canvas.viewportTransform];
            // canvas.set({width: img.width, height: img.height}); // useless, only update when refresh page
            vpt[0] = 1; 
            vpt[3] = 1; 
            vpt[4] = -img.left;
            vpt[5] = -img.top; 
            canvas.setViewportTransform(vpt);
            canvas.renderAll(); // must have
            // console.log(zoomCopy, vptCopy, widthCopy, heightCopy, canvas);
            
            const pixelDataCollection = {};
            for (let brushObj of brushObjArr) {
                canvas.clearContext(upperCanvasCtx);
                canvas.renderCanvas(upperCanvasCtx, brushObj.pathes);
                const upperCanvasData = upperCanvasCtx.getImageData(0,0,img.width*img.scaleX,img.height*img.scaleY);
                // const upperCanvasData = canvasRef.current.getContext("2d").getImageData(0,0,img.width*img.scaleX,img.height*img.scaleY);
                pixelDataCollection[brushObj.id] = upperCanvasData;

                frameAnnotation[brushObj.id].pathes = getPathInfo(brushObj);
            }
            canvas.clearContext(upperCanvasCtx);
            canvas.setViewportTransform(vptCopy);

            for (let id in pixelDataCollection) {
                const upperCanvasData = pixelDataCollection[id];
                const resizedData = await window.createImageBitmap(upperCanvasData, 0, 0, img.width*img.scaleX,img.height*img.scaleY, {resizeWidth: img.width, resizeHeight: img.height});

                offscreenCtx.drawImage(resizedData, 0, 0);
                const offscreenData = offscreenCtx.getImageData(0,0,img.width, img.height);
                console.log('offscreen data', id, offscreenData);
                offscreenCtx.clearRect(0, 0, img.width, img.height); //clear ctx for redrawing

                const pixelData = offscreenData.data;
                const pixelDataFiltered = new Uint8ClampedArray(offscreenData.data); //for testing
                const rle = [];
                let first;
                // const [r,g,b] = convertColorHexToBit(frameAnnotation[annoIdToDraw].color); 
                // const alpha = (props.alpha ? props.alpha : defaultAlpha) * 255;
                // console.log('rgb', r, g, b);
                let count = 1;
                let inSeg = false;
                for (let i=0; i<pixelData.length; i=i+4) {
                    // if (Math.abs(pixelData[i]-r) <= COLOR_TOLERANCE 
                    // && Math.abs(pixelData[i+1]-g) <= COLOR_TOLERANCE 
                    // && Math.abs(pixelData[i+2]-b) <= COLOR_TOLERANCE) {
                    if (pixelData[i+3] > 0) {
                        if (i===0) {
                            inSeg = true;
                            first = 1;
                        } else {
                            if (inSeg) {
                                count++;
                            } else {
                                rle.push(count);
                                count = 1;
                                inSeg = true;
                            }
                        }
                        // //for testing
                        // pixelDataFiltered[i] = r;
                        // pixelDataFiltered[i+1] = g;
                        // pixelDataFiltered[i+2] = b;
                        // pixelDataFiltered[i+3] = (props.alpha?props.alpha:defaultAlpha)*255;
                    } else {
                        if (i===0) {
                            inSeg = false;
                            first = 0;
                        } else {
                            if (!inSeg) {
                                count++;
                            } else {
                                rle.push(count);
                                count = 1;
                                inSeg = false;
                            }
                        }

                        //for testing
                        pixelDataFiltered[i] = 0;
                        pixelDataFiltered[i+1] = 0;
                        pixelDataFiltered[i+2] = 0;
                        pixelDataFiltered[i+3] = 0;
                    }
                }
                rle.push(count);
                console.log(id, rle);
                // fabricObjListRef.current[id].rle = rle;
                // const annoObj = {...frameAnnotation[id]};
                // annoObj.data = rle;
                // annoObj.first = first;
                // setFrameAnnotation({...frameAnnotation, [id]: annoObj});
                frameAnnotation[id].data = rle;
                frameAnnotation[id].first = first;

                //for testing
                // console.log(pixelDataFiltered, img.width);
                const imageDataFiltered = new ImageData(pixelDataFiltered, img.width, img.height) ;
                testCanvasRef.current.width = img.width; //*img.scaleX;
                testCanvasRef.current.height = img.height; //*img.scaleY;
                const testCtx = testCanvasRef.current.getContext("2d");
                // testCtx.scale(img.scaleX, img.scaleY);
                // testCtx.putImageData(upperCanvasData, 0, 0);
                // testCtx.drawImage(resizedData, 0, 0);
                // console.log(img.width*img.scaleX,img.height*img.scaleY);
                // console.log('canvas', upperCanvasData, resizedData);
                testCtx.putImageData(imageDataFiltered, 0,0);
            }
            offscreen = null; // delete offscreen canvas when done
            // console.log();
            // setAnnoIdToDraw(null);
            

        }
    }

    function getPathInfo(brushObj) {
        return brushObj.pathes.map(obj => {
            const subStr = obj.path.map((p) => p.join(' '));
            const joinedStr = subStr.join(' ');
            return {
                steps: joinedStr,
                left: obj.left,
                top: obj.top,
                width: obj.width,
                height: obj.height,
                stroke: obj.stroke,
                strokeWidth: obj.strokeWidth,
                strokeDashArray: obj.strokeDashArray,
                strokeLineCap: obj.strokeLineCap,
                strokeLineJoin: obj.strokeLineJoin,
                strokeMiterLimit: obj.strokeMiterLimit,
            }
        })
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
                const path = brushObj.pathes.pop();
                if (path) {
                    canvasObjRef.current.remove(path);
                }   
            }
        }
    }, [undo])


    function convertAlphaFloatToHex(alphaFloat) {
        // convert alpha float to hex string, e.g. 0.5 return '7F'
        const alphaBit = alphaFloat * 255;
        const secondDigit = Math.floor(alphaBit / 16);
        const firstDigit = Math.floor(alphaBit % 16);
        const res = hexArr[secondDigit] + hexArr[firstDigit];
        return res;
    }

    function convertColorHexToBit(colorHex) {
        // convert color hex string to bit, e.g. '#FFFFFF' return [255, 255, 255]
        const charArr = colorHex.split('');
        const r = hexMap[charArr[1]] * 16 + hexMap[charArr[2]];
        const g = hexMap[charArr[3]] * 16 + hexMap[charArr[4]];
        const b = hexMap[charArr[5]] * 16 + hexMap[charArr[6]];
        return [r, g, b];
    }


    function createFabricObjBasedOnAnnotation() {
        if (Object.keys(frameAnnotation).length>0) {
            // console.log('draw anno');
            Object.keys(frameAnnotation).forEach(id => {
                const annoObj = frameAnnotation[id];
                if (annoObj.frameNum === frameNum) {
                    // console.log(annoObj);
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
                        case 'skeleton':
                            dataToCanvas = getSkeletonCoordToCanvas(annoObj);
                            console.log('skeleton', dataToCanvas);
                            createSkeleton(dataToCanvas, annoObj);
                            break;
                        case 'brush':
                            createPathes(annoObj);
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
        if (!frameNum) { //including frameNum==0 (new video), frameNum==null (image instead of video)
            imageObjRef.current.width = imgRef.current.width;
            imageObjRef.current.height = imgRef.current.height;
            scaleImage(canvasObjRef.current, imageObjRef.current);
        }
        // const rect = new fabric.Rect({
        //     left:100,
        //     top:0,
        //     width: 50,
        //     height:30,
        //     // strokeWidth: STROKE_WIDTH,
        //     stroke: `rgba(135,183,255,${255/255})`,
        //     fill: `rgba(135,183,255,${255/255})`
        // })
        // canvasObjRef.current.add(rect).renderAll();

        //Draw fabric objects according to annotation
        createFabricObjBasedOnAnnotation();
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

    function getSkeletonCoordToImage(obj) { //obj is the skeleton obj in fabricObjRef: {id: , type:'skeleton', landmarks: [...], edges: {'0-1': Line, ...}}
        const oldData = frameAnnotation[obj.id].data; // anno data is already created before skeleton finish drawing
        const newData = oldData.map((coorArr,i) => { //coorArr:[x,y,v]. Loop through oldData, not obj.landmarks, because landmark could be unlabelled in obj.landmarks, but has to be existed in oldData
            const p = obj.landmarks[i];
            if (p) { //p could be unlabelled, thus undefined
                const newPoint = getPointCoordToImage(p.getCenterPoint());
                return [newPoint.x, newPoint.y, coorArr[2]];
            } else {
                return coorArr;
            }
        });
        // console.log(oldData, newData);
        return newData;
    }

    


    /*  For the next five functions
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
        // zoom in/out
        const e = opt.e;
        const canvas = canvasObjRef.current;
        let zoom = canvas.getZoom();
        // zoom *= 0.999 ** (-opt.e.deltaY);
        const sensitivity = props.wheelSensitivity ? props.wheelSensitivity : WHEEL_SENSITIVITY;
        zoom += e.deltaY * sensitivity /10000;
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
        // console.log('zooming',imageObjRef.current);
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
            // drag image (mouse down + alt/option key down)
            if (e.altKey === true) {
                setupCanvasDrag(e);
            }

            canvas.activeObj = null;
            canvas.isEditingObj = null;
            setActiveAnnoObj(null);
        }

        if (canvas.getActiveObject()){ // when click on an obj
            const activeObj = canvas.getActiveObject();
            if (ANNOTATION_TYPES.has(activeObj.type)) {
                addActiveIdObj(activeObj);
            } else if (activeObj.type === 'skeletonPoint' && !drawType) {
                const skeletonObj = fabricObjListRef.current[activeObj.owner];
                addActiveIdObj(skeletonObj);
            }
        }

        // console.log(drawType);
        if (drawType === 'keyPoint') {
            // const idTodraw = getIdToDraw();
            const annoObjToDraw = {...frameAnnotation[annoIdToDraw]};
            createKeyPoint(canvas.getPointer(), annoObjToDraw);
        }

        if (drawType === 'bbox') {
            // const idToDraw = getIdToDraw();
            canvas.bboxIdObjToDraw = {...frameAnnotation[annoIdToDraw]};
            canvas.bboxStartPosition = canvas.getPointer();
        }
        
        if (drawType === 'polygon') {
            drawPolygon();
        }

        if (canvas.editPolygon) {
            // console.log('mouse down', canvas.getActiveObject(), drawType);
            if (!canvas.getActiveObject()) {
                finishEditPolygon();
            } else if (canvas.getActiveObject()?.type !== 'polygonPoint'
            || canvas.getActiveObject()?.owner != canvas.editingPolygonId){
                const activeObj = canvas.getActiveObject();
                finishEditPolygon();
                // canvas.setActiveObject(null);
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

        // console.log('mouse down', canvas.getActiveObject(), drawType);
        // this if must be above next if, otherwise dragSkeletonPoint will be called right after drawing the last landmark and cause error
        if (canvas.getActiveObject() && canvas.getActiveObject().type==='skeletonPoint' && drawType !== 'skeleton') {
            canvas.isDraggingSkeletonPoint = true;
            console.log(canvas.isDraggingSkeletonPoint);
        }

        if (drawType === 'skeleton') {
            canvas.isDrawingSkeleton = true;
            drawSkeleton();
        }

        // if (drawType === 'brush' && useEraser) {
        //     eraseBrush();
        //     canvas.isErasing = true;
        // }
    }


    
    function mouseMoveHandler(opt) {
        const e = opt.e;
        const canvas = canvasObjRef.current;
        if (canvas.isDragging) {
            dragCanvas(e);
            // console.log('dragging',imageObjRef.current);
        }
        if (canvas.isDraggingPolygonPoint) {
            dragPolygonPoint();
        }
        if (drawType==='bbox' && canvas.bboxStartPosition) {
            drawBBox();
        }
        if (canvas.activeObj && canvas.isEditingObj) { //when drag, rotate, scale obj, update coord
            setActiveObjData();
            // props.setActiveIdObj(props.rectIdList[canvas.activeObj.id]);
        }
        // console.log('mouse move')
        if (canvas.isDraggingSkeletonPoint) { //when drag skeletonPoint, the if above also holds, so will update coord when drag skeletonPoint
            dragSkeletonPoint();
        }
        // if (canvas.isErasing) {
        //     eraseBrush();
        // }
    }


    function setActiveObjData(){
        /* retrieve canvas.activeObj, calculate its data (coordinates) relative to image
           update its data in props.frameAnnotation, and parent's activeIdObj
        */
        const canvas = canvasObjRef.current;
        const obj = canvas.activeObj;
        let data = {};
        let newAnnoObj = {};
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
            case 'skeleton':
                data = getSkeletonCoordToImage(obj);
                break;
        }
        newAnnoObj = {...frameAnnotation[obj.id], data: data}; 
        // props.setFrameAnnotation({...props.frameAnnotation, [obj.id]: newIdObj});
        frameAnnotation[obj.id] = newAnnoObj;
        setActiveAnnoObj(newAnnoObj);
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
        // canvas.isErasing = false;

        // finish drawing bbox
        if (drawType === 'bbox') {
            canvas.bboxEndPosition = canvas.getPointer();
            finishDrawBBox();

            canvas.isEditingObj = false;// createRect() set it to be true, should be reset to be false
        }
    }


    function deleteKeyHandler(e) {
        if ((e.key === 'Backspace' || e.key === 'Delete') 
        && canvasObjRef.current.getActiveObject()
        && canvasObjRef.current.getActiveObject().type !== 'polygonPoint'
        // && canvasObjRef.current.getActiveObject().type !== 'skeletonPoint'
        ) {
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
        
        const idToDraw = annoIdToDraw; //getIdToDraw();
        const idObjToDraw = {...frameAnnotation[idToDraw]};

        const clickPoint = canvas.getPointer();
        // console.log('draw polygon', canvas.polygonPoints, canvas.polygonLines);
       
        if (canvas.polygonPoints.length===0 && canvas.polygonLines.length===0) {
            const point = createPoint(clickPoint, idObjToDraw, 0);
            canvas.add(point).setActiveObject(point);
            canvas.polygonPoints.push(point);
            // console.log('first',point.getCenterPoint(), point.getCoords());
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
                // canvas.selection = true;
                setDrawType(null);
                setAnnoIdToDraw(null);

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
        
        const idToDraw = annoIdToDraw //getIdToDraw();
        const annoObjToDraw = {...frameAnnotation[idToDraw]}; //{annoId: {id: annoId, groupIndex: , frameNum: , type: 'skeleton', data: [[null, null, 2], ...}}
        // console.log(annoObjToDraw);
        const landmarkToDraw = btnConfigData[annoObjToDraw.groupIndex].childData[skeletonLandmark]; //{index: 0, btnType: 'skeleton',label: 'head',color: '#1677FF'}
        const landmarkInfo = {
            id: idToDraw,
            color: landmarkToDraw.color,
            type: landmarkToDraw.btnType,
        }
        // console.log('landmark', landmarkInfo);
        const landmarkTotalNum = btnConfigData[annoObjToDraw.groupIndex].childData.length;
        const edgesInfo = btnConfigData[annoObjToDraw.groupIndex].edgeData; // {color: '', edges: [set(), ...]}
        
        const clickPoint = canvas.getPointer();
        //console.log(clickPoint);
        //create landmark
        const landmark = createPoint(clickPoint, landmarkInfo, skeletonLandmark);
        
        canvas.add(landmark).setActiveObject(landmark);
        
        //create edges
        const neighbors = edgesInfo.edges[skeletonLandmark];
        const edgeColor = edgesInfo.color;
        const edgeInfo = {
            id: idToDraw,
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

        canvas.skeletonPoints[skeletonLandmark] = (landmark); // must be after creating edges


        if (skeletonLandmark < landmarkTotalNum - 1) { // if not done with drawing
            setSkeletonLandmark(skeletonLandmark + 1);
        } else { // if done
            setSkeletonLandmark(null);
            setDrawType(null); // will trigger useEffect to call finishDrawSkeleton() 
            setAnnoIdToDraw(null);
        }
    }


    function finishDrawSkeleton() {
        // pass skeletonObj to fabricObjListRef
        // called by useEffect (monitor drawType)
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
        
        //add coord data to annotation
        addActiveIdObj(skeletonObj);
        
        // canvas.selection = true;
    }


    // function drawBrush() {
    //     const canvas = canvasObjRef.current;
    //     const annoObj = frameAnnotation[annoIdToDraw];
    //     const pos = canvas.getPointer();
    //     const circle = new fabric.Circle({
    //         left: pos.x,  /////
    //         top: pos.y,  /////
    //         radius: brushThickness,
    //         originX: 'center',
    //         originY: 'center',
    //         // strokeWidth: 1,
    //         // strokeUniform: true,
    //         // stroke: annoObj.color,
    //         fill: annoObj.color+'80',
    //         lockScalingX: true,
    //         lockScalingY: true,
    //         lockRotation: true,
    //         lockScalingFlip: true,
    //         lockSkewingX: true,
    //         lockSkewingY: true,
    //         hasControls: false,
    //         selectable:false,
    //         lockMovementX: true,
    //         lockMovementY: true,
    //         //centeredScaling: true,
    //         type: annoObj.type + 'Circle', 
    //         owner: annoObj.id,
    //     })
    //     canvas.add(circle);
    // }

    // function eraseBrush() {
        // const canvas = canvasObjRef.current;
        // const annoObj = frameAnnotation[annoIdToDraw];
        // const pos = canvas.getPointer();
        // const circle = new fabric.Circle({
        //     left: pos.x,  /////
        //     top: pos.y,  /////
        //     radius: brushThickness,
        //     originX: 'center',
        //     originY: 'center',
        //     strokeWidth: 1,
        //     strokeUniform: true,
        //     stroke: 'black',
        //     // fill: annoObj.color+'80',
        //     lockScalingX: true,
        //     lockScalingY: true,
        //     lockRotation: true,
        //     lockScalingFlip: true,
        //     lockSkewingX: true,
        //     lockSkewingY: true,
        //     hasControls: false,
        //     selectable:false,
        //     lockMovementX: true,
        //     lockMovementY: true,
        //     //centeredScaling: true,
        //     type: annoObj.type + 'Eraser', 
        //     owner: annoObj.id,
        // })
        // circle.filters.push({color: annoObj.color+'80'});
        // circle.applyFilters();
        // canvas.add(circle);

    // }


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
        if (drawType==='keyPoint') {
            canvas.setActiveObject(point);
            addActiveIdObj(point);
            setDrawType(null);
            setAnnoIdToDraw(null);
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
            delete(frameAnnotation[idObj.id])
        }   
        canvas.bboxStartPosition = null;
        canvas.bboxEndPosition = null;
        canvas.bboxIdObjToDraw = null;
        canvas.bboxLines.forEach(l => canvas.remove(l));
        canvas.bboxLines = [];
        setDrawType(null);
        setAnnoIdToDraw(null);
        // canvas.selection = true;
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
            strokeWidth: props.strokeWidth ? props.strokeWidth : STROKE_WIDTH,
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
        // console.log(annoObj.type==='skeleton'||annoObj.type==='polygon');
        const point = new fabric.Circle({
            left: clickPoint.x,  /////
            top: clickPoint.y,  /////
            radius: props.circleRadius ? props.circleRadius : CIRCLE_RADIUS,
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
            hasControls: false,
            lockMovementX: annoObj.type==='skeleton'||annoObj.type==='polygon' ? true : false,
            lockMovementY: annoObj.type==='skeleton'||annoObj.type==='polygon' ? true : false,
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
            strokeWidth: props.strokeWidth ? props.strokeWidth : STROKE_WIDTH,
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
            strokeWidth: props.strokeWidth ? props.strokeWidth : STROKE_WIDTH,
            strokeUniform: true,
            fill: false,
            // lockRotation: true,
            lockScalingFlip: true,
            lockSkewingX: true,
            lockSkewingY: true,
            // lockScalingX: true,
            // lockScalingY: true,
        }); 
        fabricObjListRef.current[polygon.id] = polygon;/////
        canvas.add(polygon);
        if (drawType || canvas.editPolygon) {
            canvas.setActiveObject(polygon);
            addActiveIdObj(polygon);
        }  
    }

    function createSkeleton(points, annoObjToDraw) {
        // called only when go a frame with skeleton annotation, to draw skeleton landmarks and edges
        // points: arr of point. [{x1: , y1: }, {x2:, y2: }, ...]
        const canvas = canvasObjRef.current;
        const id = annoObjToDraw.id;
        const landmarksToDraw = btnConfigData[annoObjToDraw.groupIndex].childData; //[{index: 0, btnType: 'skeleton',label: 'head',color: '#1677FF'}, ...]
        const edgesInfo = btnConfigData[annoObjToDraw.groupIndex].edgeData; // {color: '', edges: [set(), ...]}
        const landmarksDrawn = [];
        const edgesDrawn = {};

        points.forEach((point, i) => { //point: {x: , y: }
            if (annoObjToDraw.data[i][2]!==0) { //to exclude unlabelled landmark
                const landmarkInfo = {
                    id: id,
                    color: landmarksToDraw[i].color,
                    type: landmarksToDraw[i].btnType,
                }
                const landmark = createPoint(point, landmarkInfo, i);
                canvas.add(landmark);
                landmarksDrawn[i] = landmark;
    
                const neighbors = edgesInfo.edges[i];
                const edgeColor = edgesInfo.color;
                const edgeInfo = {
                    id: id,
                    type: landmarksToDraw[i].btnType,
                    color: edgeColor,
                }
                for (let n=0; n<i; n++) {
                    if (landmarksDrawn[n] && neighbors.has(n)) { // the landmark is labelled and is a neighbor
                        const line = createLine(point, points[n], edgeInfo);
                        canvas.add(line);
                        edgesDrawn[`${landmarksDrawn[n].index}-${landmark.index}`] = line;
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
        fabricObjListRef.current[id] = skeletonObj; /////
    }

    function createPathes(annoObjToDraw) {
        // called only when go to a frame with brush annotation, to draw brush pathes
        const canvas = canvasObjRef.current;
        const brushObj = {
            id: annoObjToDraw.id,
            type: 'brush',
            pathes: [],
        }
        annoObjToDraw.pathes.forEach((p, i) => {
            console.log(p);
            const pathObj = new fabric.Path(p.steps);
            pathObj.set({ 
                left: p.left,
                top: p.top,
                width: p.width,
                height: p.height,
                stroke: p.stroke,
                strokeWidth: p.strokeWidth,
                strokeDashArray: p.strokeDashArray,
                strokeLineCap: p.strokeLineCap,
                strokeLineJoin: p.strokeLineJoin,
                strokeMiterLimit: p.strokeMiterLimit,
            })
            console.log(pathObj);
            brushObj.pathes.push(pathObj);
            canvas.add(pathObj); 
        })
        fabricObjListRef.current[annoObjToDraw.id] = brushObj;
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
        const idObjToEdit = frameAnnotation[point.owner];
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
        console.log('dragging skeleton point');
        const point = canvas.getActiveObject();
        const landmarks = fabricObjListRef.current[point.owner].landmarks;
        const edgesInfo = btnConfigData[frameAnnotation[point.owner].groupIndex].edgeData; // {color: '', edges: [set(), ...]}
        const edgeInfo = {
            id: point.owner,
            type: 'skeleton',
            color: edgesInfo.color,
        }
        // console.log(point, landmarks, edgesInfo);
        const neighbors = Array.from(edgesInfo.edges[point.index]);
        neighbors.forEach(n => {
            const neighborObj = landmarks[n];
            if (neighborObj) { // check if neighbor exists, if not labelled, then undefined
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
        
        if (activeObj.type === 'skeletonPoint') { //for skeleton
            if (!drawType) { // if already finished drawing, allow deleting, and will delete the entire skeleton
                const annoId = activeObj.owner;
                const skeletonObj = fabricObjListRef.current[annoId];
                skeletonObj.landmarks.forEach(p => canvas.remove(p));
                Object.entries(skeletonObj.edges).forEach(([_, line]) => canvas.remove(line));
                delete(fabricObjListRef.current[annoId]);
                delete(frameAnnotation[annoId]);
            }
        } else { // for other shapes
            delete(fabricObjListRef.current[activeObj.id]);
            // const annotationList = {...props.frameAnnotation};
            // delete(annotationList[activeObj.id]);
            // props.setFrameAnnotation(annotationList);
            delete(frameAnnotation[activeObj.id]);
            
            canvas.remove(activeObj);
        }

        canvas.activeObj = null;
        canvas.isEditingObj = null;
        setActiveAnnoObj(null);
    }

    function addActiveIdObj(activeObj) { // for skeleton: the skeleton Obj in fabricObjListRef
        // these commands will be used at multiple places, when create, choose, edit, and delete an object
        const canvas = canvasObjRef.current;
        canvas.activeObj = activeObj;
        canvas.isEditingObj = true; // when drag, rotate, scale obj
        setActiveObjData();
    }

    //TODO: remove this func, replace by annoIdToDraw context, but need to change btn clickHandler to set the context
    function getIdToDraw() {
        const existingIds = new Set(Object.keys(fabricObjListRef.current));
        let idToDraw;
        // if (drawType==='brush') {

        // } else {
            idToDraw = Object.entries(frameAnnotation).filter(([id, annoObj]) => !existingIds.has(id) && ANNOTATION_TYPES.has(annoObj.type))[0][0];
        // } 
        return idToDraw;
    }



    // src={props.imgUrl}ref={imgRef} 
    return (
        <>
        <div className={styles.canvasContainer}
             style={{width: props.width?props.width:CANVAS_WIDTH, height: props.height?props.height:CANVAS_HEIGHT}}>
            {/* <canvas id='brushCanvas' ref={brushCanvasRef} className={styles.brushCanvas} /> */}
            <canvas id='canvas' ref={canvasRef} className={styles.canvas}>
                <img id='image' ref={imgRef} className={styles.image} alt="img"/>
            </canvas>
            
        </div>
        <canvas ref={testCanvasRef} style={{border: 'solid'}}></canvas>
        {/* width:300, height:200,  */}
        </>
      )
}