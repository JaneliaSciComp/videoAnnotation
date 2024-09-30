import React, {useState, useEffect, useRef} from 'react';
import { staticVerticalLineColor, dynamicVerticalLineColor } from '../utils/utils';
import { useStateSetters, useStates } from './AppContext'; 
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Tooltip,
    Legend,
  } from 'chart.js';

import { 
    staticVerticalLine, 
    dynamicVerticalLine, 
    additionalDataBufferFold, 
    additionalDataExtraBufferRange } from '../utils/utils.js';
import { getAnnotationForChart } from '../utils/requests';

  
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Tooltip,
    Legend,
    staticVerticalLine,
    dynamicVerticalLine,
);



/**
 *  The current design for the chart is to only display one group of non-coexisting category labels, such as 'chase' and 'no-chase'.
 *  If need to display multiple groups of labels, such as 'chase'/'no-chase' and 'grooming'/'no-grooming', then need to use another instance of this comp.
 *  Assuming these labels are defined in one btnGroup, and each label is globally unique among all category btns.
 *  Otherwise, it won't function correctly.
 *  This comp should only be used for video annotation 
 * 
 *  props:
 *      labels: ['chase', 'no-chase'], an arr of non-coexisting labels to display on chart.
        width: str. '100%'/'200px'/'50vw'..., default is 100%. Set the width of the chart.
        height: str. '100%'/'200px'/'50vh'..., default is 100%. Set the height of the chart
        // legendPosition: 'top'/'left'/'bottom'/'right'/'chartArea'. 'bottom' by default. Position of legend.
        // legendAlign: 'start'/'center'/'end'. 'end' by default. Horizontal position of legend.
        staticVerticalLineColor: 'rgb()', '#xxxxxx', 'red'. The color of the static vertical Line
        dynamicVerticalLineColor:  'rgb()', '#xxxxxx', 'red'. The color of the dynamic vertical Line
        // zoomSpeed: number. Speed for zooming on y axis. 0.01 by default.
        omitXLables: boolean. Omit x-axis labels. false by default.
        */
export default function AnnotationChart(props) {

    const chartRef = useRef();
    const [dataToDisplay, setDataToDisplay] = useState(
        {
            labels: [],  
            datasets: [{}]
        }
    );
    const [options, setOptions] = useState({
        plugins: {
            zoom: {
                pan: {
                    enabled: true,
                    mode: 'y',
                    modifierKey: 'alt',
                }
            }
        }
    });
    const [annotationForChart, setAnnotationForChart] = useState({framNum:null, range: null, data: null});
    const [info, setInfo] = useState(null);
    const trackCheckedFrameRef = useRef(null);
    const framesInsertedChartDataForRef = useRef(null);

    const setFrameNumSignal = useStateSetters().setFrameNumSignal;
    const frameNum = useStates().frameNum;
    const totalFrameCount = useStates().videoMetaRef.current.totalFrameCount;
    const annotationChartRange = useStates().annotationChartRange;
    const videoId = useStates().videoId;
    const intervalAnno = useStates().intervalAnno;
    const categoryColors = useStates().categoryColors;
    const videoMetaRef = useStates().videoMetaRef;
    const setCancelIntervalAnno = useStateSetters().setCancelIntervalAnno;  
    const addSingleCategory = useStates().addSingleCategory;
    const setAddSingleCategory = useStateSetters().setAddSingleCategory;
    const removeSingleCategory = useStates().removeSingleCategory;
    const setRemoveSingleCategory = useStateSetters().setRemoveSingleCategory;
    const singleCategoriesRef = useStates().singleCategoriesRef;
    const uploader = useStates().uploader;
    const resetAnnotationChart = useStates().resetAnnotationChart;
    const setResetAnnotationChart = useStateSetters().setResetAnnotationChart; 
    const intervalErasing = useStates().intervalErasing;



    useEffect(() => {
        if (uploader?.type && uploader?.file) {
            singleCategoriesRef.current = {};
            setAnnotationForChart(oldValue => {return {framNum: null, range: null, data: null}});
        }

    }, [uploader])

    useEffect(() => {
        if (resetAnnotationChart) {
            getAnnotationData({framNum:null, range: null, data: null});
            setResetAnnotationChart(false);
        }
    }, [resetAnnotationChart])


    useEffect(() => {
        if (addSingleCategory 
            && props.labels.some(label => label === addSingleCategory.label)
            && addSingleCategory.frameNum <= annotationForChart?.range[1]
            && addSingleCategory.frameNum >= annotationForChart?.range[0]
        ) {
            const index = addSingleCategory.frameNum - annotationForChart.range[0];
            const newData = {...annotationForChart};
            newData.data[index] = addSingleCategory;
            setAnnotationForChart(oldValue => newData);
            setAddSingleCategory(null);
        }
    }, [addSingleCategory])

    useEffect(() => {
        if (removeSingleCategory
            && props.labels.some(label => label === removeSingleCategory.label)
            && removeSingleCategory.frameNum >= annotationForChart?.range[0] 
            && removeSingleCategory.frameNum <= annotationForChart?.range[1]
        ) { 
            const index = removeSingleCategory.frameNum - annotationForChart.range[0];
            if (annotationForChart.data[index]?.label === removeSingleCategory.label) {
                const newData = {...annotationForChart};
                newData.data[index] = null;
                setAnnotationForChart(oldValue => newData);
                setRemoveSingleCategory(null);
            }
        }
    }, [removeSingleCategory])


    useEffect(() => {
        getAnnotationData();
    }, [frameNum, annotationChartRange])

    useEffect(() => {
        getAnnotationData({framNum:null, range: null, data: null});

        return () => {
            setAnnotationForChart(oldValue => {return {framNum: null, range: null, data: null}});
            singleCategoriesRef.current = {};
        }
    }, [props.labels, videoId])

    useEffect(() => {
        if (props.labels?.length>0) {
            const groupId = Object.keys(intervalErasing).filter(groupId => intervalErasing[groupId].labels.some(label=>label===props.labels[0]))[0];

            if (groupId && intervalErasing[groupId].on) {
                const index = frameNum - (annotationForChart.range ? annotationForChart.range[0] : 0);
                const newData = [...annotationForChart.data];
                newData[index] = null;
                
                setAnnotationForChart(oldValue => {
                    return {
                        frameNum: frameNum,
                        range: oldValue.range??[0, 0],
                        data: newData
                    };
                });
            } 

            else if (Object.values(intervalErasing).some(value=>value.on)) {
                getAnnotationData({framNum:null, range: null, data: null});
            } else {
                
                getAnnotationData({framNum:null, range: null, data: null});
            }
        } 
    }, [intervalErasing])

    useEffect(() => {

            getAnnotationData({framNum:null, range: null, data: null});
        
    }, [intervalAnno])

    

    useEffect(() => {
        if (!props.labels?.length>0) return;

        console.log('annotationChart generateDataForChart called', frameNum, annotationForChart, annotationChartRange);
        let initialLables = props.omitXLables ? [] : [1,2,3,4,5,6,7,8,9,10];
        let data = {labels: initialLables, datasets: [{}]};
        let startNeeded=0, endNeeded=0, start=0, end=0;
        if (props.labels?.length>0 && annotationForChart.range ) {
            const frameNums = [];
            startNeeded = (frameNum-annotationChartRange>0) ? (frameNum-annotationChartRange) : 0;
            endNeeded = (frameNum+annotationChartRange<totalFrameCount) ? (frameNum+annotationChartRange) : (totalFrameCount-1);
            if (!props.omitXLables) {
                for (let i = startNeeded+1; i <= endNeeded+1; i++) {
                    frameNums.push(i.toString());
                }
            }
            
            const [startBuffered, endBuffered] = annotationForChart.range;
            start = startNeeded - startBuffered;
            end = start + (endNeeded - startNeeded);
            const splittedData = {};
            props.labels.forEach(label => splittedData[label]={
                label: label,
                data: [],
                borderColor: categoryColors[label],
                backgroundColor: categoryColors[label],
                categoryPercentage: 0.95,
                barPercentage: 1,
            });
            for (let i = start; i <= end; i++) {
                const anno = annotationForChart.data[i];
                if (anno) {
                    splittedData[anno.label].data.push(1);
                    props.labels.forEach(label => {
                        if (label !== anno.label) {
                            splittedData[label].data.push(0)
                        }
                    });
                } else {
                    props.labels.forEach(label => splittedData[label].data.push(0));
                }
            }
            if (intervalAnno.on){
                for (let i = Math.max(intervalAnno.startFrame, startNeeded); i <= frameNum; i++) {
                    const index = i - startNeeded;
                        splittedData[intervalAnno.label].data[index] = 1;
                }
            }
            for (let fNum in singleCategoriesRef.current) {
                if (fNum >= startNeeded && fNum <= endNeeded) {
                    const index = fNum - startNeeded;
                    for (let id in singleCategoriesRef.current[fNum]) {
                        const anno = singleCategoriesRef.current[fNum][id];
                        if (props.labels.some(label => label === anno.label)) {
                            splittedData[anno.label].data[index] = 1;
                        }
                    }
                }
            }
            const groupId = Object.keys(intervalErasing).filter(groupId => intervalErasing[groupId].labels.some(label=>label===props.labels[0]))[0];
            const groupErasingData = intervalErasing[groupId];
            if (groupId && groupErasingData.on) {
                for (let i = Math.max(groupErasingData.startFrame, startNeeded); i <= frameNum; i++) {
                    const index = i - startNeeded;
                    props.labels.forEach(label => splittedData[label].data[index] = 0);
                }
            }

            data = {
                labels: frameNums,
                datasets: props.labels.map((m) => splittedData[m]),
            };
        }
        console.log('annotationChart generateDataForChart called', frameNum, data);
        setDataToDisplay(data);

        setOptions({
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            scales: {
                x: {
                    border: {
                        display: true
                    },
                    grid: {
                        display: false,
                        drawTicks: false,
                    },
                    stacked: true,
                },
                y: {
                    min: 0,
                    max: 1,
                    border: {
                        display: false
                    },
                    grid: {
                        display: false,
                        drawTicks: false,
                    },
                    afterFit(scale) {
                        scale.paddingLeft = 50;
                    },
                    ticks: {
                        display: false,
                    },
                    stacked: true,
                },
            },
            plugins: {
                legend: {
                    display: false,
                    position: props.legendPosition ? props.legendPosition : 'bottom',
                    align: props.legendAlign ? props.legendAlign : 'end',
                   
                },
                tooltip: {
                    intersect: false
                },
                staticVerticalLine: {
                    position: frameNum - startNeeded,
                    metricsNumber: 1,
                    color: props.staticVerticalLineColor ? props.staticVerticalLine : staticVerticalLineColor
                },
                dynamicVerticalLine: {
                    metricsNumber: 1,
                    color: props.dynamicVerticalLineColor ? props.dynamicVerticalLineColor : dynamicVerticalLineColor,
                    clickHandler: (intervalAnno.on || Object.values(intervalErasing).some(value=>value.on)) ? null : setFrameNumSignal,
                    startIndex: startNeeded,
                },
            },
        });

    }, [props, annotationForChart])


    async function getAnnotationData(initialData=null) { 
        console.log('getAnnotationData called', frameNum, annotationForChart);
        setInfo(null);
        if (props.labels?.length>0 && Number.isInteger(frameNum)) { 
            let retrievedAnnotationData = initialData??{...annotationForChart};
            const rangeNeeded = annotationChartRange;
            if (rangeNeeded >= 0) {
                const rangeStartNeeded = ((frameNum-rangeNeeded)<0) ? 0 : (frameNum-rangeNeeded);
                const rangeEndNeeded = ((frameNum+rangeNeeded)>(totalFrameCount-1)) ? (totalFrameCount-1) : (frameNum+rangeNeeded);
                const rangeInBuffer = retrievedAnnotationData ? retrievedAnnotationData.range : null;
                if (!rangeInBuffer || rangeStartNeeded < rangeInBuffer[0] || rangeEndNeeded > rangeInBuffer[1]) {
                    const extraRange = 0;
                    console.log('getAnnotationData called', frameNum, rangeInBuffer, videoMetaRef.current, rangeStartNeeded, rangeEndNeeded, extraRange);
                    const res = await getAnnotationForChart(videoId, frameNum, props.labels, rangeNeeded+extraRange); 
                    console.log(res);
                    if (res['error']) { 
                        setInfo(res['error']); 
                        retrievedAnnotationData = null;
                    } else {
                        const rangeStartRetrieved = (frameNum-(rangeNeeded+extraRange)<0) ? 0 : (frameNum-(rangeNeeded+extraRange))
                        const rangeEndRetrieved = ((frameNum+rangeNeeded+extraRange)>(totalFrameCount-1)) ? (totalFrameCount-1) : (frameNum+rangeNeeded+extraRange);
                        let trackRes = 0;
                        const annoArr = [];
                        for (let i = rangeStartRetrieved; i <= rangeEndRetrieved; i++) {
                            if (res[trackRes]?.frameNum === i) {
                                annoArr.push(res[trackRes]);
                                trackRes++;
                            } else if (res[trackRes]?.frameNum > i) {
                                annoArr.push(null);
                            } else if (res[trackRes]?.frameNum < i) {
                                trackRes++;
                                i--;
                            }
                        }

                            

                        retrievedAnnotationData = {
                            framNum: frameNum,
                            range: [rangeStartRetrieved, rangeEndRetrieved],
                            data: annoArr
                        };
                        console.log('insert anno to chart data retrieve:', frameNum, retrievedAnnotationData)
                    
                        for (let key in singleCategoriesRef.current) {
                            if (singleCategoriesRef.current[key].frameNum < rangeStartRetrieved || singleCategoriesRef.current[key].frameNum > rangeEndRetrieved) {
                                delete singleCategoriesRef.current[key];
                            }
                        }
                        console.log('remove anno out annoForChart.range from singleCategoriesRef', singleCategoriesRef.current);
                    }
                }
            }
            
            
            

            setAnnotationForChart(oldValue => retrievedAnnotationData);
        }
    }        


    function generateChart() {
        return <Bar ref={chartRef} 
                options={options} 
                data={dataToDisplay}
                id='annotationChart'
                />
    }



    return (
        <>
            <div id='annotationChart' style={{position: 'relative', width: props.width ?? '100%', height: props.height ?? (info? '80%' : '100%')}}> 
                {generateChart()}
            </div>
            <p>{info}</p>
        </>
    )
}