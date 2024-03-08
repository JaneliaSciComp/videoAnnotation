import React, {useState, useEffect, useRef} from 'react';
import styles from '../styles/Chart.module.css';
import Chart from './Chart';
import ChartController from './ChartController';
import {Row, Col} from 'react-bootstrap';


/**
 * Combination of ChartController and Chart. 
 * Host data for ChartController and Chart, so that don't need to bother Workspace.
 * 
 * props:
 *  // metrics: ['length', 'width', ...]. Will be passed to child ChartController to generate dorpdown menus
 *  data: data for chart
 *      {
            length: {
                data: nums,
                (optional) borderColor: '#F5222D', //'rgb(255, 99, 132)',
                (optional) backgroundColor: '#F5222D80' //'rgba(255, 99, 132, 0.5)',
            },
            width: {
                data: nums.map(n => n+10), 
                (optional) borderColor: '#3DDCF9', //'rgb(22, 119, 255)',
                (optional) backgroundColor: '#3DDCF980' //'rgba(22, 119, 255, 0.5)',
            }
        }
    *  horizontal: boolean. Arrange components horizontally or vertically. If horizontally, then children of Controller will be aligned vertically.
    *  controllerAlign: 'start'/'end'/'center'/'between'/'around'/'evenly'. 'left' by default. How to horizontally align controller components, if horizontal is false.
    *  staticVerticalLineColor: 'rgb()', '#xxxxxx', 'red'. The color of the static vertical Line
    dynamicVerticalLineColor:  'rgb()', '#xxxxxx', 'red'. The color of the dynamic vertical Line
    zoomSpeed: number. Speed for zooming on y axis. 0.01 by default.
*/
export default function ChartCombo(props) {
    
    const [chartMetrics, setChartMetrics] = useState([]); // metrics for Chart to display
    // const [start, setStart] = useState(0);
    // const [end, setEnd] = useState(0);
    const [chartType, setChartType] = useState('Line');
    const [range, setRange] = useState(1);
    

    return (
        <Row className={'d-flex ' + (props.horizontal?'justify-content-start':'flex-column')}
            style={{height:'100%'}}>
            <Col sm='auto'>
                <ChartController 
                    metrics={Object.keys(props.data)} 
                    vertical={props.horizontal ? true : false}
                    align={props.controllerAlign}
                    setChartMetrics={setChartMetrics} 
                    range={range}
                    setRange={setRange}
                    chartType={chartType}
                    setChartType={setChartType}
                    />
            </Col>
            <Col sm='' style={{'maxWidth': props.horizontal?'calc(100% - 11em)':'', 
                                height: props.horizontal?'100%' : 'calc(100% - 2em)'}}>
                <Chart 
                    type={chartType}
                    metrics={chartMetrics} 
                    // frameRange={[start, end]} 
                    range={range}
                    data={props.data}
                    staticVerticalLineColor={props.staticVerticalLineColor}
                    dynamicVerticalLineColor={props.dynamicVerticalLineColor}
                    zoomSpeed={props.zoomSpeed}
                    />
            </Col>
        </Row>
    )
}
