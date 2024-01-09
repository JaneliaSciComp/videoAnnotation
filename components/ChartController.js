import React, {useState, useEffect, useRef} from 'react';
import styles from '../styles/Chart.module.css';
import {Dropdown, InputNumber} from 'antd';
import {Row, Col} from 'react-bootstrap';
import { useStates } from './AppContext'; 


export default function ChartController(props) {
    /**
     *  props:
     *      metrics: ['length', 'width', ...]. Array of metrics for dropdown menu
     *      range: int. Frame range to display.
     *      setRange: setter of range.
     *      setChartMetrics: setter of chartMetrics. 
     *      chartType: 'Line' or 'Bar'.
     *      setChartType: setter of chartType
     *      vertical: boolean. Arrange the components vertically or horizontally.
     *      align: 'start'/'end'/'center'/'between'/'around'/'evenly'. 'start' by default. How to horizontally align componentes, if vertical is false.
     */
    const [menuProps, setMenuProps] = useState();
    const [selectedMetrics, setSelectedMetrics] = useState([]);

    //context
    const totalFrameCount = useStates().totalFrameCount;


    useEffect(() => {
        const items = props.metrics.map((item, i) => {
            return {
                label: item,
                key: i,
            }
        });

        const menuPropsObj = {
            items,
            selectable: true,
            multiple: true,
            // onClick: menuClickHandler,
            onSelect: metricsSelectHandler,
            onDeselect: metricsSelectHandler,
        };

        setMenuProps(menuPropsObj);
    }, [props])
    

    // function menuClickHandler(e) {
    //     const metric = items[e.key].label;
    //     console.log(e);
    //     props.setChartMetric(metric);
    // }

    function metricsSelectHandler(e) {
        // console.log('select',e);
        const selectedMetrics = e.selectedKeys.map(keyStr => props.metrics[parseInt(keyStr)]);
        // console.log(selectedMetrics);
        props.setChartMetrics(selectedMetrics);
        setSelectedMetrics(selectedMetrics);
    }

    // function menuDeselectHandler(e) {
    //     // console.log('deselect',e);
    //     const selectedMetrics = e.selectedKeys.map(keyStr => props.metrics[parseInt(keyStr)]);
    //     // console.log(selectedMetrics);
    //     props.setChartMetrics(selectedMetrics);
    //     setSelectedMetrics(selectedMetrics);
    // }

    const chartTypeItems = [
        {
            label: 'Line',
            key: 0,
        },
        {
            label: 'Bar',
            key: 1,
        },
    ]

    const chartTypeProps = {
        items: chartTypeItems,
        selectable: true,
        onSelect: typeSelectHandler,
    };

    function typeSelectHandler(e) {
        // console.log(e);
        const type = chartTypeItems[parseInt(e.key)].label;
        // console.log(type);
        props.setChartType(type);
    }

    // function startChangeHandler(newValue) {
    //     if (typeof newValue === 'number' 
    //     && Number.isInteger(newValue) 
    //     && newValue>=1 ) {
    //         // setStart(newValue - 1);
    //         props.setStart(newValue - 1);
    //     }
    // }

    // function endChangeHandler(newValue) {
    //     if (typeof newValue === 'number' 
    //     && Number.isInteger(newValue) 
    //     ) {
    //         // setEnd(newValue - 1);
    //         props.setEnd(newValue - 1);
    //     }
    // }

    function rangeChangeHandler(newValue) {
        if (typeof newValue === 'number' 
        && Number.isInteger(newValue) 
        ) {
            props.setRange(newValue);
        }
    }


    //justify-content-center
    // + (props.vertical?'flex-column':('justify-content-'+(props.align?props.align:'start')))
    return (
        <Row className={'d-flex ' + (props.vertical?'flex-column':('justify-content-'+(props.align?props.align:'start')))}>
            <Col xs='auto' className='mb-1'>
                <Row className={'d-flex '}> 
                    {/* <Col xs='auto' style={{'white-space': 'nowrap'}}>
                        <span >Frame Range</span>
                    </Col>
                    <Col xs='auto'>
                        <div className='d-inline'>
                        <InputNumber  
                            min={1}
                            max={props.end ? props.end+1 : undefined} //make sure it cannot go beyond end number
                            // defaultValue={1}
                            value={props.start+1}
                            onChange={startChangeHandler}
                            size="small"
                            />
                        <span className='mx-1'>-</span>
                        <InputNumber 
                            min={props.start ? props.start+1 : undefined}
                            // max={totalFrameCount}
                            value={props.end+1}
                            onChange={endChangeHandler}
                            size='small'
                            />
                        </div>
                    </Col> */}
                    <Col xs='auto' className='pe-0'>
                        <span>Range</span>
                    </Col>
                    <Col xs='auto'>
                        <InputNumber  
                            min={1}
                            max={totalFrameCount ? totalFrameCount : null}
                            // defaultValue={1}
                            value={props.range}
                            onChange={rangeChangeHandler}
                            size="small"
                            />
                    </Col>
                </Row>
            </Col>
            <Col xs='auto' className='mb-1'>
                <Dropdown.Button 
                    size='small'
                    menu={menuProps} 
                    //   onClick={handleButtonClick}
                    trigger={['click']}>
                    {selectedMetrics.join(',')}
                </Dropdown.Button>
            </Col>

            <Col xs='auto' className='mb-1'>
                <Dropdown.Button 
                    size='small'
                    menu={chartTypeProps} 
                    // onClick={handleButtonClick}
                    trigger={['click']}>
                    {props.chartType}
                </Dropdown.Button>
            </Col>
        </Row>
        
    )
}