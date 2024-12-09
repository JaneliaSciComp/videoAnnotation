import React, {useState, useEffect, useRef} from 'react';
import { staticVerticalLineColor, dynamicVerticalLineColor, staticVerticalLine, dynamicVerticalLine } from '../utils/utils';
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
            setAnnotationForChart(oldValue => {return {framNum: null, range: null, data: null}});
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
                getAnnotationData();
            } else {
                getAnnotationData();
            }
        } 
    }, [intervalErasing])


    

    useEffect(() => {
        if (!props.labels?.length>0) return;

        let initialLables = props.omitXLables ? [] : [1,2,3,4,5,6,7,8,9,10];
        let data = {labels: initialLables, datasets: [{}]};
        let startNeeded=0, endNeeded=0, start=0, end=0;
        if (props.labels?.length>0 && annotationForChart.range ) {
            const frameNums = [];
            startNeeded = (frameNum-annotationChartRange>0) ? (frameNum-annotationChartRange) : 0;
            endNeeded = (frameNum+annotationChartRange<totalFrameCount-1) ? (frameNum+annotationChartRange) : (totalFrameCount-1);
            if (!props.omitXLables) {
                for (let i = startNeeded+1; i <= endNeeded+1; i++) {
                    frameNums.push(i.toString());
                }
            }
            
            start = 0;
            end = endNeeded - startNeeded;
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
                    clickHandler: setFrameNumSignal,
                    startIndex: startNeeded,
                },
            },
        });

    }, [props, annotationForChart])


    async function getAnnotationData() {
        setGlobalInfo(null);
        if (props.labels?.length>0 && Number.isInteger(frameNum)) { 
            let annoDataForChart;
            const rangeNeeded = annotationChartRange;
            if (rangeNeeded >= 0) {
                const rangeStartNeeded = ((frameNum-rangeNeeded)<0) ? 0 : (frameNum-rangeNeeded);
                const rangeEndNeeded = ((frameNum+rangeNeeded)>(totalFrameCount-1)) ? (totalFrameCount-1) : (frameNum+rangeNeeded);
                const annoData = filterAnnotation(rangeStartNeeded, rangeEndNeeded, props.labels);
                const res = supplementData(rangeStartNeeded, rangeEndNeeded, annoData);

                annoDataForChart = {
                    framNum: frameNum,
                    range: [rangeStartNeeded, rangeEndNeeded],
                    data: res
                };
            }
            
            setAnnotationForChart(oldValue => annoDataForChart);
        }
    }   
    

    function filterAnnotation(startFrame, endFrame, labels) {
        const res = [];
        for (let i = startFrame; i <= endFrame; i++) {
            const frameAnno = annotationRef.current[i]??{};
            Object.values(frameAnno).forEach(anno => {
                if (labels.some(label => label === anno.label)) {
                    res.push(anno);
                }
            })
        }
        return res;
    }

    function supplementData(startFrame, endFrame, retrivedData) {
        let trackRes = 0;
        const annoArr = [];
        for (let i = startFrame; i <= endFrame; i++) {
            if (!retrivedData || retrivedData.length===0) {
                annoArr.push(null);
            } else if (retrivedData[trackRes]?.frameNum === i) {
                annoArr.push(retrivedData[trackRes]);
                trackRes++;
            } else if (retrivedData[trackRes]?.frameNum > i) {
                annoArr.push(null);
            } else if (retrivedData[trackRes]?.frameNum < i) {
                trackRes++;
                i--;
            }
        }
        return annoArr;
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
            <div id='annotationChart' style={{position: 'relative', width: props.width ?? '100%', height: props.height ?? '100%'}}> 
                {generateChart()}
            </div>
            {}
        </>
    )
}