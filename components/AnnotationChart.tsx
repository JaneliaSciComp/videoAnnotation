import React, {useState, useEffect, useRef} from 'react';
import { staticVerticalLineColor, dynamicVerticalLineColor, staticVerticalLine, dynamicVerticalLine } from '../utils/utils';
import { useStateSetters, useStates } from './AppContext'; 
import { Bar } from 'react-chartjs-2';
import type { Annotation } from '@/types/annotations';
import {
    Chart as ChartJS,
    ChartData,
    ChartDataset,
    ChartOptions,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Tooltip,
    Legend,
    Scale,
    ChartType,
  } from 'chart.js';
  
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

declare module 'chart.js' {
   interface PluginOptionsByType<TType extends ChartType = ChartType> {
        staticVerticalLine?: {
            position: number,
            metricsNumber: number,
            color: string
        },
        dynamicVerticalLine?: {
            metricsNumber: number,
            color: string,
            clickHandler: ()=> void, // return to this later
            startIndex: number
        }
    }
}

type AnnotationChartProps = {
    labels: string[],
    width?: string,
    height?: string,
    staticVerticalLineColor?: string, //'rgb()', '#xxxxxx', 'red'
    dynamicVerticalLineColor?: string, //'rgb()', '#xxxxxx', 'red'
    omitXLabels?: boolean,
    legendPosition?: "bottom" | "left" | "top" | "right" | "center" | "chartArea" | undefined, // should include _DeepPartialObject<{ [scaleId:string]: number; }> ?
    legendAlign?: "center" | "end" | "start" | undefined,
}

type AnnotationDataForChart = {
    frameNum: number | null,
    range: [number, number] | null,
    data: (Annotation | null)[] | null,
}

type IntervalErasingValues = {
    on: boolean,
    startFrame: number,
    videoID: string | null,
    labels: string[], 
}

type IntervalErasingType = {
    [groupId: string]: IntervalErasingValues
}

/**
 *  The current design for the chart is to only display one group of mutuallyExclusive category labels, such as 'chase' and 'no-chase'.
 *  If need to display multiple groups of labels, such as 'chase'/'no-chase' and 'grooming'/'no-grooming', then need to use another instance of this comp.
 *  Assume these labels are defined in one btnGroup, and each label is globally unique among all category btns.
 *  Otherwise, it won't function correctly.
 *  This comp should only be used for video annotation 
 * 
 *  props:
 *      labels: ['chase', 'no-chase'], an arr of mutuallyExclusive labels to display on chart. Consistent with labels of annotation buttons. TODO: should be replaced by another ChartController component
        width: str. '100%'/'200px'/'50vw'..., default is 100%. Set the width of the chart.
        height: str. '100%'/'200px'/'50vh'..., default is 100%. Set the height of the chart
        // legendPosition: 'top'/'left'/'bottom'/'right'/'chartArea'. 'bottom' by default. Position of legend.
        // legendAlign: 'start'/'center'/'end'. 'end' by default. Horizontal position of legend.
        staticVerticalLineColor: 'rgb()', '#xxxxxx', 'red'. The color of the static vertical Line
        dynamicVerticalLineColor:  'rgb()', '#xxxxxx', 'red'. The color of the dynamic vertical Line
        // zoomSpeed: number. Speed for zooming on y axis. 0.01 by default.
        omitXLabels: boolean. Omit x-axis labels. false by default.
        */


export default function AnnotationChart({labels, width, height, staticVerticalLineColor='rgb(100,100,100, 0.5)', dynamicVerticalLineColor='rgb(220,220,220, 0.5)', omitXLabels, legendPosition, legendAlign}: AnnotationChartProps) {

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

    const setFrameNumSignal = useStateSetters().setFrameNumSignal;
    const frameNum = useStates().frameNum;
    const totalFrameCount = useStates().videoMetaRef.current.totalFrameCount;
    const annotationChartRange = useStates().annotationChartRange;
    const videoId = useStates().videoId;
    const intervalAnno = useStates().intervalAnno;
    const categoryColors = useStates().categoryColors;
    const videoMetaRef = useStates().videoMetaRef;
    const setCancelIntervalAnno = useStateSetters().setCancelIntervalAnno;  
    const updateAnnotationChart = useStates().updateAnnotationChart;
    const setUpdateAnnotationChart = useStateSetters().setUpdateAnnotationChart;
    const uploader = useStates().uploader;
    const resetAnnotationChart = useStates().resetAnnotationChart;
    const setResetAnnotationChart = useStateSetters().setResetAnnotationChart; 
    const intervalErasing = useStates().intervalErasing;
    const annotationRef = useStates().annotationRef;
    const setGlobalInfo = useStateSetters().setGlobalInfo;


    useEffect(() => {
        if (uploader?.type && uploader?.file) {
            setAnnotationForChart(oldValue => {return {framNum: null, range: null, data: null}});
        }

    }, [uploader])

    useEffect(() => {
        if (resetAnnotationChart) {
            getAnnotationData();
            setResetAnnotationChart(false);
        }
    }, [resetAnnotationChart])


    useEffect(() => {
        if (updateAnnotationChart) {
            getAnnotationData();
            setUpdateAnnotationChart(false);
        }
    }, [updateAnnotationChart])


    useEffect(() => {
        getAnnotationData();
    }, [frameNum, annotationChartRange])

    useEffect(() => {
        getAnnotationData();

        return () => {
            setAnnotationForChart(()=> {return {framNum: null, range: null, data: null}});
        }
    }, [labels, videoId])

    useEffect(() => {
        if (labels?.length>0) {
            const groupId = Object.keys(intervalErasing).filter(groupId => intervalErasing[groupId].labels.some(label=>label===labels[0]))[0];

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
                getAnnotationData();
            } else {
                getAnnotationData();
            }
        } 
    }, [intervalErasing])


    useEffect(() => {
        if (!labels?.length>0) return;

        let initialLables = [1,2,3,4,5,6,7,8,9,10];
        let data = {labels: initialLables, datasets: [{}]};
        let startNeeded=0, endNeeded=0, start=0, end=0;
        if (labels?.length>0 && annotationForChart.range ) {
            const frameNums = [];
            startNeeded = (frameNum-annotationChartRange>0) ? (frameNum-annotationChartRange) : 0;
            endNeeded = (frameNum+annotationChartRange<totalFrameCount-1) ? (frameNum+annotationChartRange) : (totalFrameCount-1);
                for (let i = startNeeded+1; i <= endNeeded+1; i++) {
                    frameNums.push(i.toString());
                }
            
            start = 0;
            end = endNeeded - startNeeded;
            const splittedData = {};
            labels.forEach(label => splittedData[label]={
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
                    labels.forEach(label => {
                        if (label !== anno.label) {
                            splittedData[label].data.push(0)
                        }
                    });
                } else {
                    labels.forEach(label => splittedData[label].data.push(0));
                }
            }
            if (intervalAnno.on && labels.some(l=>l===intervalAnno.label)) {
                const intervalStart = Math.min(intervalAnno.startFrame, frameNum);
                const intervalEnd = Math.max(intervalAnno.startFrame, frameNum);
                for (let i = Math.max(intervalStart, startNeeded); i <= Math.min(intervalEnd, endNeeded); i++) {
                    const index = i - startNeeded;
                    splittedData[intervalAnno.label].data[index] = 1;
                    labels.forEach(label => {
                        if (label !== intervalAnno.label) {
                            splittedData[label].data[index] = 0;
                        }
                    });
                }
            }
            const groupId = Object.keys(intervalErasing).filter(groupId => intervalErasing[groupId].labels.some(label=>label===labels[0]))[0];
            const groupErasingData = intervalErasing[groupId];
            if (groupId && groupErasingData.on) {
                const intervalStart = Math.min(groupErasingData.startFrame, frameNum);
                const intervalEnd = Math.max(groupErasingData.startFrame, frameNum);
                for (let i = Math.max(intervalStart, startNeeded); i <= Math.min(intervalEnd, endNeeded); i++) {
                    const index = i - startNeeded;
                    labels.forEach(label => splittedData[label].data[index] = 0);
                }
            }

            data = {
                labels: frameNums,
                datasets: labels.map((m) => splittedData[m]),
            };
        }
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
                    ticks: {
                        display: omitXLabels?false:true,
                    },
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
                    position: legendPosition ? legendPosition : 'bottom',
                    align: legendAlign ? legendAlign : 'end',
                   
                },
                tooltip: {
                    intersect: false
                },
                staticVerticalLine: {
                    position: frameNum - startNeeded,
                    metricsNumber: 1,
                    color: staticVerticalLineColor ? staticVerticalLineColor : staticVerticalLineColor
                },
                dynamicVerticalLine: {
                    metricsNumber: 1,
                    color: dynamicVerticalLineColor ? dynamicVerticalLineColor : dynamicVerticalLineColor,
                    clickHandler: setFrameNumSignal,
                    startIndex: startNeeded,
                },
            },
        });

    }, [staticVerticalLineColor, dynamicVerticalLineColor, legendAlign, legendPosition, annotationForChart])


    async function getAnnotationData() {
        setGlobalInfo(null);
        if (labels?.length>0 && Number.isInteger(frameNum)) { 
            let annoDataForChart;
            const rangeNeeded = annotationChartRange;
            if (rangeNeeded >= 0) {
                const rangeStartNeeded = ((frameNum-rangeNeeded)<0) ? 0 : (frameNum-rangeNeeded);
                const rangeEndNeeded = ((frameNum+rangeNeeded)>(totalFrameCount-1)) ? (totalFrameCount-1) : (frameNum+rangeNeeded);
                const annoData = filterAnnotation(rangeStartNeeded, rangeEndNeeded, labels);
                const res = supplementData(rangeStartNeeded, rangeEndNeeded, annoData);

                annoDataForChart = {
                    framNum: frameNum,
                    range: [rangeStartNeeded, rangeEndNeeded],
                    data: res
                };
            }

            else {
                annoDataForChart = {
                frameNum: null,
                range: null,
                data: null
                }
            };
            
            setAnnotationForChart(annoDataForChart);
        }
    }   
    

    function filterAnnotation(startFrame: number, endFrame: number, labels: string[]) {
        const res: Annotation[] = [];
        for (let i = startFrame; i <= endFrame; i++) {
            const frameAnno = annotationRef.current[i]??[];  // Edits made to this line break AnnoChart. 
            // Specifically, checking to see if frameAnnotation is an array.
            //if annotationRef is an array of objects, return an object, not an array
            Object.values(frameAnno).forEach(anno => { // Edits made to this line also break AnnoChart.
                //Specifically, getting rid of Object.values.
                // if the above is actually an array of objects, then you can't forEach over an object.
                if (anno){
                    if (labels.some((label: string) => label === anno.label)) {
                        res.push(anno);
                    }
                }
            })
        }
        return res;
    }

    function supplementData(startFrame: number, endFrame: number, retrievedData: Annotation[]) {
        let trackRes = 0;
        const annoArr = [];
        for (let i = startFrame; i <= endFrame; i++) {
            if (!retrievedData || retrievedData.length===0) {
                annoArr.push(null);
            } else if (retrievedData[trackRes]?.frameNum === i) {
                annoArr.push(retrievedData[trackRes]);
                trackRes++;
            } else {
                const trackResNum = retrievedData[trackRes];
                if (trackResNum!== undefined && trackResNum !== null){
                    if (trackResNum.frameNum > i) {
                        annoArr.push(null);
                    } else if (trackResNum.frameNum < i) {
                        trackRes++;
                        i--;
                    }
                }
            } 
        }
        return annoArr;
    }



    return (
        <>
            <div id='annotationChart' style={{position: 'relative', width: width ?? '100%', height: height ?? '100%'}}> 
                <Bar ref={chartRef} 
                options={options} 
                data={dataToDisplay}
                id='annotationChart'
                />
            </div>
        </>
    )
}