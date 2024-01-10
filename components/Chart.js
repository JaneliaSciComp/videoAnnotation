import React, {useState, useEffect, useRef} from 'react';
import styles from '../styles/Chart.module.css';
import { predefinedColors, staticVerticalLineColor, dynamicVerticalLineColor } from '../utils/utils';
import { useStateSetters, useStates } from './AppContext'; 
import { 
    Line,
    Bar,
    getElementAtEvent,
    getElementsAtEvent,
    getDatasetAtEvent
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
    // Title,
  } from 'chart.js';

  
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Tooltip,
    // Title,
    Legend,
);

// plugins
const staticVerticalLine = {
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

const dynamicVerticalLine = {
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

ChartJS.register(
    staticVerticalLine,
    dynamicVerticalLine
)


export default function MyChart(props) {
    /**
     *  props:
     *      type: 'Line'/'Bar'.
     *      metrics: [metric1, metric2, ...], metrics to display on chart. should match datasetNames. 
    //  *      dataSource: 'local' or 'backend'. 
    //  *          If 'backend', change of metric should trigger fetching data from backend.
    //  *          If 'local', props.data should provide data to display.
    //  *      frameRange: [start, end]. [0, 10] means [0, 1,..., 9,10]
            range: frame range to display. 
                The first and the last frame are calculated based on range and current frameNum.
                The current frameNum should be the center of range. If the calculated first/last frame is out of bound,
                then use frame 1 or the final frame.
            data: data to display in chart. 
                Format:
                {
                    datasetName1: {
                                    data: [num1, num2, ...], // frameRange will extract the items from this array. Its length should be bigger than frameRange, and should fill up missing data
                                    //borderColor: 'rgb(255, 99, 132)',
                                    //backgroundColor: 'rgba(255, 99, 132, 0.5)',
                                },
                    datasetName2: {
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
            */

    const chartRef = useRef();
    // const [frameNumsToDisplay, setFrameNumsToDisplay] = useState([]);
    const [dataToDisplay, setDataToDisplay] = useState(
        {
            labels: [],  
            datasets: [{}]
        }
    );
    const [options, setOptions] = useState({});

    //context
    const setFrameNumSignal = useStateSetters().setFrameNumSignal;
    const frameNum = useStates().frameNum;
    const totalFrameCount = useStates().totalFrameCount;


    useEffect(() => {
        // console.log(props);
        const frameNums = [];
        // for (let i = props.frameRange[0]+1; i <= props.frameRange[1]+1; i++) {
        //     frameNums.push(i.toString());
        // }

        const [start, end] = getStartEndNum();
        // console.log(frameRange);
        for (let i = start+1; i <= end+1; i++) {
                frameNums.push(i.toString());
        }

        const colorsCopy = [...predefinedColors];
        colorsCopy.shift(); // remove the first color '#000000' 
        const data = {
            labels: frameNums,
            datasets: props.metrics.map((m, i) => {
                const dataset = props.data[m];
                // console.log(m, dataset);
                return {
                    label: m,
                    // data: dataset?.data.slice(props.frameRange[0], props.frameRange[1]+1),
                    data: dataset?.data.slice(start, end+1),
                    borderColor: dataset.borderColor ? dataset.borderColor : colorsCopy[i % colorsCopy.length], //'#F5222D' / 'rgb(255, 99, 132)',
                    backgroundColor: dataset.backgroundColor ? dataset.backgroundColor : (colorsCopy[i % colorsCopy.length]+'80'), //'#F5222D' / 'rgba(255, 99, 132, 0.5)',
                    categoryPercentage: 0.95, 
                    barPercentage: 1,  
                }
            }),
        };
        // console.log(data);
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
                        display: props.xGrid ? props.xGrid : false,
                        drawTicks: false,
                    }
                },
                y: {
                    border: {
                        display: true
                    },
                    grid: {
                        display: props.yGrid ? props.yGrid : true,
                        drawTicks: false,
                    }
                },
            },
            plugins: {
                legend: {
                    display: props.metrics?.length > 1 ? true : false,
                    position: props.legendPosition ? props.legendPosition : 'bottom',
                    align: props.legendAlign ? props.legendAlign : 'end',
                    // labels: {
                    //     color: 'rgb(255, 99, 132)'
                    // }
                },
            //   title: {
            //     display: true,
            //     text: 'Chart.js Line Chart',
            //   },
                tooltip: {
                    intersect: false
                },
                staticVerticalLine: {
                    position: frameNum - start,
                    metricsNumber: props.metrics.length,
                    color: props.staticVerticalLineColor ? props.staticVerticalLine : staticVerticalLineColor
                },
                dynamicVerticalLine: {
                    metricsNumber: props.metrics.length,
                    color: props.dynamicVerticalLineColor ? props.dynamicVerticalLineColor : dynamicVerticalLineColor
                }
            },
        });

    }, [props, frameNum])

    // console.log('chart', data);

    
    function clickHandler(e) {
        // console.log(getElementAtEvent(chartRef.current, e));
        const elem = getElementAtEvent(chartRef.current, e)[0];
        if (elem) {
            const frameNumStr = dataToDisplay.labels[elem.index];
            setFrameNumSignal(parseInt(frameNumStr));
        }   
    }

    // function mouseMoveHandler(e) {  
    //     const elem = getElementsAtEvent(chartRef.current, e);
    //     const datasets = getDatasetAtEvent(chartRef.current, e);
    //     console.log('mousemove', elem, datasets); 
    // }

    function generateChart() {
        switch (props.type) {
            case 'Line':
                return <Line ref={chartRef} 
                        options={options} 
                        data={dataToDisplay} 
                        onClick={clickHandler}
                        // onMouseMove={mouseMoveHandler}
                        />
                break;
            case 'Bar':
                return <Bar ref={chartRef} 
                        options={options} 
                        data={dataToDisplay} 
                        onClick={clickHandler}
                        />
        }
    }


    function getStartEndNum() {
        let start, end; // start and end are both included frames, 0-based
        if (props.range >= totalFrameCount) {
            start = 0;
            end = totalFrameCount - 1;
        } else {
            start = frameNum+1 - Math.ceil(props.range/2);
            if (start < 0) { // start out of bound
                start = 0;
                end = start + props.range - 1;
                end = (end <= totalFrameCount-1) ? end : (totalFrameCount-1);
            } else {
                end = start + props.range - 1;
                if (end >= totalFrameCount) { // end out of bound
                    end = totalFrameCount - 1;
                    start = end - props.range + 1;
                    start = start >= 0 ? start : 0;
                }
            }
        }
        
        return [start, end]
    }


    return (
        <div style={{width: props.width ? props.width:'100%', height: props.height ? props.height:'100%'}}>
            {/* <canvas ref={canvasRef} width={800} height={150}/> */}
            
            {/* <Line ref={chartRef} 
                options={options} 
                data={dataToDisplay} 
                onClick={clickHandler}
                /> */}
            {generateChart()}
        </div>
    )
}