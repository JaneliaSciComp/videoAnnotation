import React, {useState, useEffect, useRef} from 'react';
import {Dropdown, InputNumber} from 'antd';
import {Row, Col} from 'react-bootstrap';
import { useStateSetters, useStates } from './AppContext'; 
import {defaultAdditionalDataRange} from '../utils/utils';


/**
 *  props:
 *      metrics: ['length', 'width', ...]. Array of metrics for dropdown menu, generated from videoAdditionalFieldsConfig
 *      //range: int. Frame range to display.
 *      //setRange: setter of range.
 *      setChartMetrics: setter of chartMetrics. 
 *      chartType: 'Line' or 'Bar'.
 *      setChartType: setter of chartType
 *      vertical: boolean. Arrange the components vertically or horizontally.
 *      align: 'start'/'end'/'center'/'between'/'around'/'evenly'. 'start' by default. How to horizontally align componentes, if vertical is false.
 */
export default function ChartController(props) {
    
    const [menuProps, setMenuProps] = useState();
    const [selectedMetrics, setSelectedMetrics] = useState([]);

    //context
    const totalFrameCount = useStates().videoMetaRef.current.totalFrameCount;
    const additionalDataRange = useStates().additionalDataRange;
    const setAdditionalDataRange = useStateSetters().setAdditionalDataRange;
    const resetChart = useStates().resetChart;
    const setResetChart = useStateSetters().setResetChart;
    const additionalDataNameToRetrieve = useStates().additionalDataNameToRetrieve;
    const setAdditionalDataNameToRetrieve = useStateSetters().setAdditionalDataNameToRetrieve;
    const videoAdditionalFieldsConfig = useStates().videoAdditionalFieldsConfig;

    // console.log('chartController render', props.metrics, additionalDataRange);
    
    useEffect(() => {
        if (resetChart) {
            setSelectedMetrics([]);
            props.setChartMetrics([]);
            setResetChart(() => false);
        }
    }, [resetChart])

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
    }, [props.metrics])
    

    // function menuClickHandler(e) {
    //     const metric = items[e.key].label;
    //     console.log(e);
    //     props.setChartMetric(metric);
    // }

    function metricsSelectHandler(e) {
        // console.log('select metrics',e);
        const selectedMetrics = e.selectedKeys.map(keyStr => props.metrics[parseInt(keyStr)]);
        // console.log(selectedMetrics);

        // update additionalDataNameToRetrieve
        // will cause additionalData to change, then parent useEffect is called
        // then sibling Chart is rerendered. 
        const selectedMetricsSet = new Set(selectedMetrics);
        const nameToRetrieveForChart = props.metrics.filter(name => selectedMetricsSet.has(name));
        let nameToRetrieve = additionalDataNameToRetrieve.filter(name => videoAdditionalFieldsConfig[name].loadIn && videoAdditionalFieldsConfig[name].loadIn!=='chart');
        nameToRetrieve = nameToRetrieve.concat(nameToRetrieveForChart);
        setAdditionalDataNameToRetrieve(nameToRetrieve);

        props.setChartMetrics(selectedMetrics); //sibling Chart rerender again
        setSelectedMetrics(selectedMetrics);
    }


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

    
    function rangeChangeHandler(newValue) {
        // console.log('chartController range new value', newValue, additionalDataRange);
        if (typeof newValue === 'number' 
        && Number.isInteger(newValue) 
        ) {
            // props.setRange(newValue);

            // const halfRange = Math.floor(newValue/2);
            const newRange = {...additionalDataRange};
            props.metrics.forEach(m => {
                newRange[m] = newValue;
            })
            setAdditionalDataRange(newRange);
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
                            min={0}
                            max={totalFrameCount ? totalFrameCount : null}
                            // defaultValue={40}
                            defaultValue={props.metrics.length>0?(additionalDataRange[props.metrics[0]]*2) : defaultAdditionalDataRange}
                            // value={props.metrics.length>0?(additionalDataRange[props.metrics[0]]*2) : null}
                            // value={props.range}
                            onChange={rangeChangeHandler}
                            size="small"
                            />
                    </Col>
                </Row>
            </Col>
            <Col xs='auto' className='mb-1'>
                <Row className={'d-flex '}>
                    <Col xs='auto' className='pe-0'>
                        <span>Metrics</span>
                    </Col>
                    <Col xs='auto'>
                        <Dropdown.Button 
                            size='small'
                            menu={menuProps} 
                            //   onClick={handleButtonClick}
                            trigger={['click']}>
                            {selectedMetrics.length==0 ? 'Choose' : selectedMetrics.join(',')}
                        </Dropdown.Button>
                    </Col>
                </Row>
            </Col>

            <Col xs='auto' className='mb-1'>
                <Row className={'d-flex '}>
                    <Col xs='auto' className='pe-0'>
                        <span>Type</span>
                    </Col>
                    <Col xs='auto'>
                        <Dropdown.Button 
                            size='small'
                            menu={chartTypeProps} 
                            // onClick={handleButtonClick}
                            trigger={['click']}>
                            {props.chartType}
                        </Dropdown.Button>
                    </Col>
                </Row>
            </Col>
        </Row>
        
    )
}