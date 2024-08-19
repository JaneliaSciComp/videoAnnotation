import {fabric} from 'fabric-with-erasing';

/**
 * 
 * @param {Object} target - Contains the fabric.js canvas and img obj.
 * @param {Array} circleData - [x, y, radius], x, y are the coordinates of the center
 * @param {String} color - 'red', '#000000', 'rgb(0,0,0)'
 */
export function drawCircle(target, circleData, color) {
    const canvas = target.canvas;
    const img = target.img;
    const convertedData = convertCoordImgToCanvas(circleData, img, 'circle');
    const circle = new fabric.Circle({
        left: convertedData[0],
        top: convertedData[1],
        radius: convertedData[2],
        originX: 'center',
        originY: 'center',
        strokeWidth: 1,
        strokeUniform: true,
        stroke: color,
        fill: color,
        lockScalingX: true,
        lockScalingY: true,
        lockRotation: true,
        lockScalingFlip: true,
        lockSkewingX: true,
        lockSkewingY: true,
        hasControls: false,
        lockMovementX: true,
        lockMovementY: true,
        selectable: false,
        type: 'additional'
    })
    canvas.add(circle);
    addObjToRef(circle, target.additionalDataName, target.objListRef); 
}


/**
 * 
 * @param {Object} target - Contains the fabric.js canvas and img obj.
 * @param {Array} lineData - [[x1, y1], [x2, y2]], Coordinates of the two endpoints
 * @param {String} color - 'red', '#000000', 'rgb(0,0,0)'
 */
export function drawLine(target, lineData, color) {
    const canvas = target.canvas;
    const img = target.img;
    const convertedData = convertCoordImgToCanvas(lineData, img, 'line');
    const line = new fabric.Line([
        convertedData[0][0], convertedData[0][1], convertedData[1][0], convertedData[1][1]
    ], {
        strokeWidth: 1,
        stroke: color,
        selectable: false,
        lockRotation: true,
        lockScalingFlip: true,
        lockSkewingX: true,
        lockSkewingY: true,
        lockScalingX: true,
        lockScalingY: true,
        hasControls: false,
        lockMovementX: true,
        lockMovementY: true,
        selectable: false,
        type: 'additional',
    })
    canvas.add(line);
    addObjToRef(line, target.additionalDataName, target.objListRef); 
}

/**
 * 
 * @param {Array} coord - Coord data for each shape, corresponding to the 2nd param for the func above
 * @param {Object} imgObj 
 * @param {String} type - enum, 'circle', 'line', 
 */
function convertCoordImgToCanvas(coord, imgObj, type) {
    let res;
    switch (type) {
        case 'circle':
            const scale = imgObj.scaleX;
            const [x, y] = convertPointCoordImgToCanvas([coord[0], coord[1]], imgObj);
            const r = coord[2] * scale;
            res = [x, y, r];
            break;
        case 'line':
            const res1 = convertPointCoordImgToCanvas(coord[0], imgObj);
            const res2 = convertPointCoordImgToCanvas(coord[1], imgObj);
            res = [res1, res2];
            break;
    }   
    return res;
}

/**
 * 
 * @param {Array} pointCoord - [x, y]
 * @param {Object} imgObj 
 */
function convertPointCoordImgToCanvas(pointCoord, imgObj) {
    const scale = imgObj.scaleX;
    const x = pointCoord[0] * scale + imgObj.left;
    const y = pointCoord[1] * scale + imgObj.top;
    return [x, y];
}

function addObjToRef(obj, addtionalDataName, ref) {
    if (ref.current.hasOwnProperty(addtionalDataName)) {
        const array = ref.current[addtionalDataName];
        array.push(obj);
    } else {
        const array = [obj];
        ref.current[addtionalDataName] = array;
    }
}