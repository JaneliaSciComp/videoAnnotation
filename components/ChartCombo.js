import React, {useState, useEffect, useRef} from 'react';
import styles from '../styles/Chart.module.css';
import Chart from './Chart';
import ChartController from './ChartController';
import {Row, Col} from 'react-bootstrap';
import { useStates } from './AppContext'; 


/**
 * Combination of ChartController and Chart. 
 * Host data for ChartController and Chart, so that doesn't need to bother Workspace.
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
 *  hideRange: boolean. Hide the range input.
 *  halfRange: int. Allow developer to set half range value when hideRange is true. Required and only available when hideRange is true.
 *  defaultHalfRange: int. Default value for half range input. Should only be used when hideRange is false.

*/
export default function ChartCombo(props) {
    
    const [chartMetrics, setChartMetrics] = useState([]); // metrics to actually display, set by chartController
    // const [start, setStart] = useState(0);
    // const [end, setEnd] = useState(0);
    const [chartType, setChartType] = useState('Line');
    // const [range, setRange] = useState(1);
    const [data, setData] = useState({}); // data source for chart. Generated from props.data or context state addtionalData

    // context
    const additionalData = useStates().additionalData;
    const videoAdditionalFieldsConfig = useStates().videoAdditionalFieldsConfig;
    
    useEffect(() => {
        // setChartMetrics([]);
        // console.log('charCombo additionalData');
        if (props.data) {
            setData({...props.data});
        } else {
            const additionalDataForChart = {};
            Object.keys(additionalData).forEach((name) => {
                if ((videoAdditionalFieldsConfig[name].loadIn === 'chart') && (additionalData[name] !== 'error')) {
                    additionalDataForChart[name] = {...additionalData[name]};                    
                }
            })
            // console.log(additionalDataForChart);
            setData(additionalDataForChart);
        }
    }, [props.data, additionalData])
    

    return (
        <Row className={'d-flex ' + (props.horizontal?'justify-content-start':'flex-column')}
            style={{height:'100%'}}>
            <Col sm='auto'>
                <ChartController 
                    metrics={Object.keys(videoAdditionalFieldsConfig).filter(name=>videoAdditionalFieldsConfig[name].loadIn==='chart')} 
                    vertical={props.horizontal ? true : false}
                    align={props.controllerAlign}
                    setChartMetrics={setChartMetrics} 
                    // range={range}
                    // setRange={setRange}
                    chartType={chartType}
                    setChartType={setChartType}
                    hideRange={props.hideRange}
                    halfRange={props.halfRange}
                    defaultHalfRange={props.defaultHalfRange}
                    />
            </Col>
            <Col sm='' style={{'maxWidth': props.horizontal?'calc(100% - 11em)':'', 
                                height: props.horizontal?'100%' : 'calc(100% - 2em)'}}>
                <Chart 
                    type={chartType}
                    metrics={chartMetrics} 
                    // range={range}
                    data={data}
                    staticVerticalLineColor={props.staticVerticalLineColor}
                    dynamicVerticalLineColor={props.dynamicVerticalLineColor}
                    zoomSpeed={props.zoomSpeed}
                    />
            </Col>
        </Row>
    )
}
