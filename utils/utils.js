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

export const defaultAdditionalDataRange = 20;
export const additionalDataBufferFold = 3; 
export const additionalDataExtraBufferRange = 25*additionalDataBufferFold;


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

