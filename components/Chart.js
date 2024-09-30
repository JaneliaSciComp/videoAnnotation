import React, {useState, useEffect, useRef} from 'react';
import styles from '../styles/Chart.module.css';
import { predefinedColors, staticVerticalLineColor, dynamicVerticalLineColor } from '../utils/utils';
import { useStateSetters, useStates } from './AppContext'; 
import Zoom from 'chartjs-plugin-zoom';
import { 
    Line,
    Bar,
 } from 'react-chartjs-2';
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
    Zoom,
);

const staticVerticalLine = {
    id: 'staticVerticalLine',
    afterDraw: function(chart, args, options) {
        if ( (options.position>=0)
          && chart?.getDatasetMeta() 
          && chart.getDatasetMeta(0)?.data?.length
          && (chart.getDatasetMeta(0)?.data?.length > options.position)) {
            const data = chart.getDatasetMeta(0).data; 
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

const dynamicVerticalLine = {
    id: 'dynamicVerticalLine',
    afterDraw: function(chart, args, options) {
        if (chart.tooltip._active?.length) {
            const activePoint = chart.tooltip._active[0];
            const ctx = chart.ctx;
            let singleElemWidth = activePoint.element.width;
            singleElemWidth = singleElemWidth ? singleElemWidth : 0;
            const  width = singleElemWidth * options.metricsNumber;
            const x = activePoint.element.x - singleElemWidth/2 * (activePoint.datasetIndex*2+1) + width/2;
            const topY = chart.scales.y.top;
            const bottomY = chart.scales.y.bottom;
            ctxDrawLine(ctx, x, topY, bottomY, options.color, width);
        }
    },

    afterEvent: function(chart, args, options) {
        if (args?.event?.type === 'click' && chart.tooltip._active?.length) {
            const activePoint = chart.tooltip._active[0];
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
    ctx.strokeStyle = color;
    ctx.stroke();
    ctx.restore();
}

ChartJS.register(
    staticVerticalLine,
    dynamicVerticalLine
)

const MIN_OFFSET = 5;
const MAX_OFFSET = 5;


/**
 *  props:
 *      type: 'Line'/'Bar'.
 *      metrics: [metric1, metric2, ...], metrics to display on chart. should match datasetNames. 
//  *      dataSource: 'local' or 'backend'. 
//  *          If 'backend', change of metric should trigger fetching data from backend.
//  *          If 'local', props.data should provide data to display.
//  *      frameRange: [start, end]. [0, 10] means [0, 1,..., 9,10]
        // range: frame range to display. (replaced by additionalDataRange, not useful anymore )
        //     The start and the end frame nums are calculated based on range and current frameNum.
        //     The current frameNum should be the center of range. 
        //     If the calculated start/end frame is out of bound, then use frame 1 or the final frame.
            
        data: data to display in chart. 
            Format:
            {
                datasetName1: {
                                range: [startIndex, endIndex], //inclusively
                                data: [num1, num2, ...], // frameRange will extract the items from this array. Its length should be bigger than frameRange, and should fill up missing data
                                //borderColor: 'rgb(255, 99, 132)',
                                //backgroundColor: 'rgba(255, 99, 132, 0.5)',
                            },
                datasetName2: {
                                range: [startIndex, endIndex], 
                                data: [num1, num2, ...], 
                            }

            }
        
        width: str. '100%'/'200px'/'50vw'..., default is 100%. Set the width of the chart.
        height: str. '100%'/'200px'/'50vh'..., default is 100%. Set the height of the chart
        xGrid: boolean. False by default. Whether to display the vertical grid line.
        yGrid: boolean. True by default. Whether to display the horizontal grid line.
        legendPosition: 'top'/'left'/'bottom'/'right'/'chartArea'. 'bottom' by default. Position of legend.
        legendAlign: 'start'/'center'/'end'. 'end' by default. Horizontal position of legend.
        staticVerticalLineColor: 'rgb()', '#xxxxxx', 'red'. The color of the static vertical Line
        dynamicVerticalLineColor:  'rgb()', '#xxxxxx', 'red'. The color of the dynamic vertical Line
        zoomSpeed: number. Speed for zooming on y axis. 0.01 by default.
        */
export default function MyChart(props) {

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

    const setFrameNumSignal = useStateSetters().setFrameNumSignal;
    const frameNum = useStates().frameNum;
    const totalFrameCount = useStates().videoMetaRef.current.totalFrameCount;
    const additionalDataRange = useStates().additionalDataRange;
    const additionalData = useStates().additionalData;
    const intervalAnno = useStates().intervalAnno;
    const intervalErasing = useStates().intervalErasing;



    useEffect(() => {
        let data = {labels: [1,2,3,4,5,6,7,8,9,10], datasets: [{}]};
        let scaleLimits = [], startNeeded=0, endNeeded=0, start=0, end=0;
        if (props.metrics?.length>0 && Object.keys(props.data).length>0) {
            const frameNums = [];
            const range = additionalDataRange[props.metrics[0]];
            startNeeded = (frameNum-range>0) ? (frameNum-range) : 0;
            endNeeded = (frameNum+range<totalFrameCount) ? (frameNum+range) : (totalFrameCount-1);
            for (let i = startNeeded+1; i <= endNeeded+1; i++) {
                frameNums.push(i.toString());
            }

            const [startBuffered, endBuffered] = props.data[props.metrics[0]].range;
            start = startNeeded - startBuffered;
            end = start + (endNeeded - startNeeded);

            const colorsCopy = [...predefinedColors];
            colorsCopy.shift();
            data = {
                labels: frameNums,
                datasets: props.metrics.map((m, i) => {
                    const dataset = props.data[m];
                    scaleLimits.push(getScaleLimits(dataset?.data));
                    return {
                        label: m,
                        data: dataset?.data.slice(start, end+1),
                        borderColor: dataset?.borderColor ? dataset?.borderColor : colorsCopy[i % colorsCopy.length],
                        backgroundColor: dataset?.backgroundColor ? dataset?.backgroundColor : (colorsCopy[i % colorsCopy.length]+'80'),
                        categoryPercentage: 0.95, 
                        barPercentage: 1,  
                    }
                }),
            };
        }
        setDataToDisplay(data);


        const [min, max] = getScaleLimits(scaleLimits.flat());

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
                        display: props.xGrid ? props.xGrid : false,
                        drawTicks: false,
                    }
                },
                y: {
                    min: min - (props.type==='Line' ? MIN_OFFSET : 0),
                    max: max + (props.type==='Line' ? MAX_OFFSET : 0),
                    border: {
                        display: true
                    },
                    grid: {
                        display: props.yGrid ? props.yGrid : true,
                        drawTicks: false,
                    },
                    afterFit(scale) {
                        scale.paddingLeft = 50;
                    }
                },
            },
            plugins: {
                legend: {
                    display: props.metrics?.length > 1 ? true : false,
                    position: props.legendPosition ? props.legendPosition : 'bottom',
                    align: props.legendAlign ? props.legendAlign : 'end',
                },
                tooltip: {
                    intersect: false
                },
                staticVerticalLine: {
                    position: frameNum - startNeeded,
                    metricsNumber: props.metrics.length,
                    color: props.staticVerticalLineColor ? props.staticVerticalLine : staticVerticalLineColor
                },
                dynamicVerticalLine: {
                    metricsNumber: props.metrics.length,
                    color: props.dynamicVerticalLineColor ? props.dynamicVerticalLineColor : dynamicVerticalLineColor,
                    clickHandler: (intervalAnno.on || Object.values(intervalErasing).some(value=>value.on)) ? null : setFrameNumSignal,
                    startIndex: startNeeded
                },
                zoom: {
                    pan: {
                        enabled: true,
                        mode: 'y',
                        modifierKey: 'alt',
                    },
                    limits: {
                        y: {min: min, max: max}
                    },
                    zoom: {
                        wheel: {
                            enabled: true,
                            speed: props.zoomSpeed ? -props.zoomSpeed : -0.01
                        },
                        mode: 'y',
                    }
                }
            },
        });

    }, [props, frameNum, additionalDataRange])


    


    function generateChart() {
        switch (props.type) {
            case 'Line':
                return <Line ref={chartRef} 
                        options={options} 
                        data={dataToDisplay} 
                        />
                break;
            case 'Bar':
                return <Bar ref={chartRef} 
                        options={options} 
                        data={dataToDisplay} 
                        />
        }
    }

        

    function getScaleLimits(dataArr) {
        let min, max;
        if (dataArr?.length >= 2) {
            min = dataArr.reduce((res, current) => Math.min(res, current));
            max = dataArr.reduce((res, current) => Math.max(res, current));
        } else if (dataArr?.length === 1) {
            const num = dataArr[0];
            if (num > 0) {
                min = 0;
                max = num;
            } else if (num < 0) {
                min = num;
                max = 0;
            } else {
                min = 0;
                max = 10;
            }
        } else {
            min = 0;
            max = 10;
        }
        
        return [min, max];
    }


    return (
        <div id='chart' style={{width: props.width ?? '100%', height: props.height ?? '100%'}}>
            {}
            
            {/* <Line ref={chartRef} 
                options={options} 
                data={dataToDisplay} 
                onClick={clickHandler}
                /> */}
            {generateChart()}
        </div>
    )
}