import React, {useState, useEffect, useRef} from 'react';
import styles from '../styles/Chart.module.css';
import Chart from './Chart';
import ChartController from './ChartController';
import {Row, Col} from 'react-bootstrap';
import { useStates } from './AppContext'; 
import { DownOutlined } from '@ant-design/icons';


/**
 * Combination of ChartController and Chart. 
 * Host data for ChartController and Chart, so that doesn't need to bother Workspace.
 * 
 * The current chartCombo comp only usable for addtionalData, 
 * becuase child Chart is defined to use additionalDataRange and related states to generate data (range)
 * If need another Chart to draw other data (ML related data), need to implement another comp.
 * This is also the reason still keep chartCombo instead of directly using ChartController and Chart.
 * If directly using ChartController and Chart, need to put the states in Workspace, and let ChartController change them, then update Chart
 * But if there are multiple charts, then they will update together. So it's good to keep these states under ChartCombo
 * 
 * props:
 *  // metrics: ['length', 'width', ...]. Will be passed to child ChartController to generate dorpdown menus
//  *  data: data for chart //not usable, because child Chart is defined to use additionalDataRange and related states to generate data (range) 
//  *      {
//             length: {
//                 data: nums,
//                 (optional) borderColor: '#F5222D', //'rgb(255, 99, 132)',
//                 (optional) backgroundColor: '#F5222D80' //'rgba(255, 99, 132, 0.5)',
//             },
//             width: {
//                 data: nums.map(n => n+10), 
//                 (optional) borderColor: '#3DDCF9', //'rgb(22, 119, 255)',
//                 (optional) backgroundColor: '#3DDCF980' //'rgba(22, 119, 255, 0.5)',
//             }
//         }
    // *  horizontal: boolean. Arrange components horizontally or vertically. If horizontally, then children of Controller will be aligned vertically.
    *  controllerAlign: 'start'/'end'/'center'/'between'/'around'/'evenly'. 'start' by default. How to horizontally align controller components, if horizontal is false.
    *  staticVerticalLineColor: 'rgb()', '#xxxxxx', 'red'. The color of the static vertical Line
    dynamicVerticalLineColor:  'rgb()', '#xxxxxx', 'red'. The color of the dynamic vertical Line
    zoomSpeed: number. Speed for zooming on y axis. 0.01 by default.
 *  hideRange: boolean. Hide the range input.
 *  halfRange: int. Allow developer to set half range value when hideRange is true. Required and only useful when hideRange is true.
 *  defaultHalfRange: int. Default value for half range input. Should only be used when hideRange is false.
    omitXLabels: boolean. Omit x labels.
*/
export default function AdditionalDataChart(props) {
    
    const [chartMetrics, setChartMetrics] = useState([]);
    const [chartType, setChartType] = useState('Line');
    const [data, setData] = useState({});
    const [hideController, setHideController] = useState(false);

    const additionalData = useStates().additionalData;
    const videoAdditionalFieldsConfig = useStates().videoAdditionalFieldsConfig;
    
    useEffect(() => {
            const additionalDataForChart = {};
            Object.keys(additionalData).forEach((name) => {
                if ((videoAdditionalFieldsConfig[name].loadIn === 'chart') && (additionalData[name] !== 'error')) {
                    additionalDataForChart[name] = {...additionalData[name]};                    
                }
            })
            setData(additionalDataForChart);
    }, [additionalData])
    
   

    return (
        <Row 
            className={'d-flex flex-column'}
            style={{width:'100%', height: '100%'}}
            >
            <Col sm='auto'>
                <Row >
                    <Col xs='auto' >
                        <DownOutlined onClick={()=>setHideController(!hideController)} style={{transform: hideController?'rotate(-90deg)':'rotate(0)'}}/>
                    </Col>
                    <Col>
                    {hideController ? null :
                        <ChartController 
                            metrics={Object.keys(videoAdditionalFieldsConfig).filter(name=>videoAdditionalFieldsConfig[name].loadIn==='chart')} 
                            align={props.controllerAlign}
                            setChartMetrics={setChartMetrics} 
                            chartType={chartType}
                            setChartType={setChartType}
                            hideRange={props.hideRange}
                            halfRange={props.halfRange}
                            defaultHalfRange={props.defaultHalfRange}
                            />
                    }
                    </Col>
                </Row>
            </Col>
            <Col sm='' style={{
                                width: '100%',
                                height: 'calc(100% - 2em)',
                                position: hideController?'relative': 'static',
                                top: hideController?'-1.5em':'0',
                                zIndex: hideController?'-1':'0',
                                }}>
                <Chart 
                    type={chartType}
                    metrics={chartMetrics} 
                    data={data}
                    staticVerticalLineColor={props.staticVerticalLineColor}
                    dynamicVerticalLineColor={props.dynamicVerticalLineColor}
                    zoomSpeed={props.zoomSpeed}
                    omitXLabels={props.omitXLabels}
                    />
            </Col>
        </Row>
    )
}
