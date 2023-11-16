import React, {useState, useEffect, useRef} from 'react';
import styles from '../styles/Chart.module.css';
import { useStateSetters } from './AppContext';
import { 
    Line,
    getElementAtEvent
 } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    // Legend,
    // Title,
  } from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    // Title,
    // Legend
);


export default function Chart(props) {
    const chartRef = useRef();

    //context
    const setFrameNumSignal = useStateSetters().setFrameNumSignal;


    const frameNums = [];
    for (let i = 1; i <= 20; i++) {
        frameNums.push(i.toString());
    }
    const nums = [71,56,24,56,26,42,10,82,82,47,77,29,54,40,54,91,96,15,90,23];

    const data = {
        labels: frameNums,
        datasets: [
          {
            label: 'Dataset 1',
            data: nums,
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
          }
        ],
    };

    // console.log('chart', data);


    const options = {
        responsive: false,
        // plugins: {
        //   legend: {
        //     position: 'top' as const,
        //   },
        //   title: {
        //     display: true,
        //     text: 'Chart.js Line Chart',
        //   },
        // },
    };


    function clickHandler(e) {
        // console.log(getElementAtEvent(chartRef.current, e));
        const elem = getElementAtEvent(chartRef.current, e)[0];
        if (elem) {
            setFrameNumSignal(elem.index+1);
        }
        
    }


    return (
        <div className={styles.chartContainer}
            style={{width: '800', height: '150'}}>
            {/* <canvas ref={canvasRef} width={800} height={150}/> */}
            <Line ref={chartRef} 
                options={options} 
                data={data} 
                onClick={clickHandler}
                />
        </div>
    )
}