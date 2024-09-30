export const defaultColor = '#1677FF';
export const defaultAlpha = 0.5;
export const hexArr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];
export const hexMap = {'0': 0, '1':1, '2':2, '3':3, '4':4, '5':5, '6':6, '7':7, '8':8, '9':9, 'A':10, 'B':11, 'C':12, 'D':13, 'E':14, 'F':15};

export const predefinedColors = [
    '#000000',
    // '#000000E0',
    // '#000000A6',
    // '#00000073',
    // '#00000040',
    // '#00000026',
    // '#0000001A',
    // '#00000012',
    // '#0000000A',
    // '#00000005',
    '#F5222D',
    '#D14D41', //
    '#FA8C16', 
    '#D0A215', //
    '#FADB14',
    '#F7FA5C', //
    '#9AFA5C', //
    '#8BBB11',
    '#52C41A',
    '#3DDCF9', //
    '#13A8A8',
    '#1677FF',
    '#2F54EB',
    '#722ED1',
    '#B75CFA', //
    '#8B7EC8', //
    '#FA5CE5', //
    '#CE5D97', //
    '#EB2F96',
    // '#F5222D4D',
    // '#FA8C164D',
    // '#FADB144D',
    // '#8BBB114D',
    // '#52C41A4D',
    // '#13A8A84D',
    // '#1677FF4D',
    // '#2F54EB4D',
    // '#722ED14D',
    // '#EB2F964D',

]

export const staticVerticalLineColor = 'rgb(100,100,100, 0.5)';
export const dynamicVerticalLineColor = 'rgb(220,220,220, 0.5)';

export const btnGroupTypeOptions = [
    {value: 'shape', label: 'Shape'},
    {value: 'category', label: 'Category'},
    {value: 'skeleton', label: 'Skeleton'},
    {value: 'brush', label: 'Brush'},
]

export const btnTypeOptions = {
    category: [
        {value: 'category', label: 'Category'}
    ],
    shape: [
        {value: 'keyPoint', label: 'Key Point'},
        {value: 'bbox', label: 'Bounding Box'},
        {value: 'polygon', label: 'Polygon'}
    ],
    skeleton: [
        {value: 'skeleton', label: 'Skeleton'}
    ],
    brush: [
        {value: 'brush', label: 'Brush'}
    ],
    general: [
        {value: 'category', label: 'Category'},
        {value: 'keyPoint', label: 'Key Point'},
        {value: 'bbox', label: 'Bounding Box'},
        {value: 'polygon', label: 'Polygon'},
        {value: 'skeleton', label: 'Skeleton'},
        {value: 'brush', label: 'Brush'},
    ]
}

export const crowdSelectOptions = [
    {value: 'yes', label: 'Yes'},
    {value: 'no', label: 'No'},
]

export const defaultAdditionalDataRange = 3;
export const additionalDataBufferFold = 3; 
export const additionalDataExtraBufferRange = 25*additionalDataBufferFold;

export const allowedCanvasShapes = new Set(['line', 'circle', 'rectangle']);

// export function clearUnfinishedAnnotation(frameAnnotation) {
//     /**
//      * when click on a annoBtn, before annoIdToDraw changes,
//      * clear unfinished shape and skeleton annoObj before setting new annoIdToDraw
//      *  */ 
//     let unfinished = [];
//     if (Object.keys(frameAnnotation).length > 0) {
//         unfinished = Object.keys(frameAnnotation).filter(id=>{
//             const annoObj = frameAnnotation[id];
//             // console.log('clear', annoObj);
//             if ((annoObj.type ==='polygon' 
//             || annoObj.type==='keyPoint' 
//             || annoObj.type==='bbox')
//              && !annoObj.data) {
//                 return true
//             } else if (annoObj.type === 'skeleton') {
//                 const unDraw = annoObj.data.filter(
//                     arr => arr[0]===null && arr[1]===null && arr[2]!==0)
//                 if (unDraw.length>0) {
//                     return true;
//                 } else {
//                     return false;
//                 }
//             } else {
//                 return false;
//             }
//         })
//     }
//     const annoCopy = {...frameAnnotation};
//     unfinished.forEach(id => delete(annoCopy[id]));
//     // console.log(annoCopy)
//     return annoCopy;
// }

export function clearUnfinishedAnnotation(frameAnnotationCopy) {
    // when switch frame or video, for skeleton, polygon and brush seg, they may not be finished (for brush, no data at all), remove such annoObj from frameAnnotation
    let unfinished =[];
    if (Object.keys(frameAnnotationCopy).length > 0) {
        unfinished = Object.keys(frameAnnotationCopy).filter(id=>{
            const annoObj = frameAnnotationCopy[id];
            // console.log('clear', annoObj, annoObj.type, annoObj.data, annoObj.first, annoObj.pathes);
            if ((annoObj.type ==='polygon' 
                || annoObj.type==='keyPoint' 
                || annoObj.type==='bbox')
                    && !annoObj.data) {
                return true
            } else if (annoObj.type === 'skeleton') {
                const unDraw = annoObj.data.filter(arr => arr[0]===null && arr[1]===null && arr[2]!==0)
                if (unDraw.length>0) {
                    return true;
                } else {
                    return false;
                }
            } else if (annoObj.type === 'brush' && (!annoObj.pathes || annoObj.pathes.length===0)) {
                return true;                    
            } 
            else {
                return false;
            }
        })
    }
    // const annoCopy = {...frameAnnotation};
    unfinished.forEach(id => delete(frameAnnotationCopy[id]));
    return frameAnnotationCopy; //annoCopy
}


export function createId() {
    const sufix = Math.random().toString().substring(2, 9);
    const id = Date.now().toString() + sufix;
    return id;
}



// chart plugins
export const staticVerticalLine = {
    id: 'staticVerticalLine',
    afterDraw: function(chart, args, options) {
        // console.log('staticVLine', chart, argv, options, options.position);
        if ( (options.position>=0)
          && chart?.getDatasetMeta() 
          && chart.getDatasetMeta(0)?.data?.length
          && (chart.getDatasetMeta(0)?.data?.length > options.position)) {
            // get first dataset, to get X coord of a point
            const data = chart.getDatasetMeta(0).data; 
            // console.log(data);
            let singleElemWidth = data[options.position].width;
            singleElemWidth = singleElemWidth ? singleElemWidth : 0;
            const width = singleElemWidth * options.metricsNumber;
            const x = data[options.position].x - singleElemWidth/2 + width/2;
            const topY = chart.scales.y.top;
            const bottomY = chart.scales.y.bottom;
            const ctx = chart.ctx;
            ctxDrawLine(ctx, x, topY, bottomY, options.color, width); 
        }
    }
};

export const dynamicVerticalLine = {
    id: 'dynamicVerticalLine',
    afterDraw: function(chart, args, options) {
        // console.log('dynamicVLine', chart, args, args.event);
        if (chart.tooltip._active?.length) {
            const activePoint = chart.tooltip._active[0];
            // console.log(activePoint);
            const ctx = chart.ctx;
            let singleElemWidth = activePoint.element.width;
            singleElemWidth = singleElemWidth ? singleElemWidth : 0;
            const  width = singleElemWidth * options.metricsNumber;
            const x = activePoint.element.x - singleElemWidth/2 * (activePoint.datasetIndex*2+1) + width/2;
            const topY = chart.scales.y.top;
            const bottomY = chart.scales.y.bottom;
            ctxDrawLine(ctx, x, topY, bottomY, options.color, width); //'rgb(220,220,220, 0.5)'
        }
    },

    //Click on the vertical line to reset frameNum
    afterEvent: function(chart, args, options) {
        if (args?.event?.type === 'click' && chart.tooltip._active?.length && options.clickHandler) {
            const activePoint = chart.tooltip._active[0];
            // console.log('dynamicLine', chart, activePoint, options);
            const focusFrame = activePoint.index + options.startIndex + 1;
            options.clickHandler(focusFrame);
        }
    }
};

function ctxDrawLine(ctx, x, topY, bottomY, color, width) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x, topY);
    ctx.lineTo(x, bottomY);
    ctx.lineWidth = width ? width : 2;
    ctx.strokeStyle = color; //'rgb(220,220,220, 0.5)';
    ctx.stroke();
    ctx.restore();
}

// export const chartAreaBorder = {
//     id: 'chartAreaBorder',
//     beforeDraw(chart, args, options) {
        
//       const {ctx, chartArea: {left, top, width, height}} = chart;
//       console.log(left, top, width, height);
//       ctx.save();
//       ctx.strokeStyle = options.borderColor;
//       ctx.lineWidth = options.borderWidth;
//       ctx.setLineDash(options.borderDash || []);
//       ctx.lineDashOffset = options.borderDashOffset;
//       ctx.strokeRect(left, top, width, height);
//       ctx.restore();
//     }
//   };