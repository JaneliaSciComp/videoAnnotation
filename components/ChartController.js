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
 *      hideRange: boolean. Hide the range input.
 *      halfRange: int. Allow developer to set half range value when hideRange is true. Required and only available when hideRange is true.
 *      defaultHalfRange: int. Default value for half range input. Should only be used when hideRange is false.
 */
export default function ChartController(props) {
    
    const [menuProps, setMenuProps] = useState();
    const [selectedMetrics, setSelectedMetrics] = useState([]);

    const totalFrameCount = useStates().videoMetaRef.current.totalFrameCount;
    const additionalDataRange = useStates().additionalDataRange;
    const setAdditionalDataRange = useStateSetters().setAdditionalDataRange;
    const resetChart = useStates().resetChart;
    const setResetChart = useStateSetters().setResetChart;
    const additionalDataNameToRetrieve = useStates().additionalDataNameToRetrieve;
    const setAdditionalDataNameToRetrieve = useStateSetters().setAdditionalDataNameToRetrieve;
    const videoAdditionalFieldsConfig = useStates().videoAdditionalFieldsConfig;

    
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
            onSelect: metricsSelectHandler,
            onDeselect: metricsSelectHandler,
        };

        setMenuProps(menuPropsObj);
    }, [props.metrics])

    useEffect(() => {
        const newRange = {};
        if (props.hideRange) {
            if (Number.isInteger(props.halfRange) && props.halfRange>=0) {
                console.log('halfRange set', props.halfRange);
                Object.keys(videoAdditionalFieldsConfig).forEach(name => {
                    if (videoAdditionalFieldsConfig[name]?.loadIn==='chart') {
                        newRange[name] = props.halfRange;
                    } else if (videoAdditionalFieldsConfig[name]?.loadIn==='canvas') {
                        newRange[name] = additionalDataRange[name];
                    }
                })
                
            } else {
                throw new Error("When hideRange is true, halfRange must be set to be a non-negative integer.");
            }
            if (props.defaultHalfRange) {
                throw new Error("When hideRange is true, defaultHalfRange should not be used. Please use halfRange instead.");
            }
        } else {
            if (Number.isInteger(props.defaultHalfRange) && props.defaultHalfRange>=0) {
                Object.keys(videoAdditionalFieldsConfig).forEach(name => {
                    if (videoAdditionalFieldsConfig[name]?.loadIn==='chart') {
                        newRange[name] = props.defaultHalfRange;
                    } else if (videoAdditionalFieldsConfig[name]?.loadIn==='canvas') {
                        newRange[name] = additionalDataRange[name];
                    }
                })
            } else {
                Object.keys(videoAdditionalFieldsConfig).forEach(name => {
                    if (videoAdditionalFieldsConfig[name]?.loadIn==='chart') {
                        newRange[name] = defaultAdditionalDataRange;
                    } else if (videoAdditionalFieldsConfig[name]?.loadIn==='canvas') {
                        newRange[name] = additionalDataRange[name];
                    }
                })
            }
        }
        setAdditionalDataRange(oldObj => newRange);

    }, [videoAdditionalFieldsConfig])
    


    function metricsSelectHandler(e) {
        const currentSelectedMetrics = e.selectedKeys.map(keyStr => props.metrics[parseInt(keyStr)]);

        let nameToRetrieve = additionalDataNameToRetrieve.filter(name => videoAdditionalFieldsConfig[name].loadIn && videoAdditionalFieldsConfig[name].loadIn!=='chart');
        nameToRetrieve = nameToRetrieve.concat(currentSelectedMetrics);
        setAdditionalDataNameToRetrieve(nameToRetrieve);

        props.setChartMetrics(currentSelectedMetrics);
        setSelectedMetrics(currentSelectedMetrics);
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
        const type = chartTypeItems[parseInt(e.key)].label;
        props.setChartType(type);
    }

    function rangeChangeHandler(newValue) {
        if (Number.isInteger(newValue) && newValue>=0) {

            const newRange = {...additionalDataRange};
            props.metrics.forEach(m => {
                newRange[m] = newValue;
            })
            setAdditionalDataRange(oldObj => newRange);
        }
    }


    return (
        <Row className={'d-flex ' + (props.vertical?'flex-column':('justify-content-'+(props.align?props.align:'start')))}>
            {props.hideRange ? null :
                <Col xs='auto' className='mb-1'>
                    <Row className={'d-flex '}> 
                        <Col xs='auto' className='pe-0'>
                            <span>Half Range</span>
                        </Col>
                        <Col xs='auto'>
                            <InputNumber  
                                min={0}
                                max={totalFrameCount ? totalFrameCount : null}
                                defaultValue={props.defaultHalfRange ?? defaultAdditionalDataRange}
                                onChange={rangeChangeHandler}
                                size="small"
                                />
                        </Col>
                    </Row>
                </Col>
            }
            <Col xs='auto' className='mb-1'>
                <Row className={'d-flex '}>
                    <Col xs='auto' className='pe-0'>
                        <span>Metrics</span>
                    </Col>
                    <Col xs='auto'>
                        <Dropdown.Button 
                            size='small'
                            menu={menuProps} 
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
                            trigger={['click']}>
                            {props.chartType}
                        </Dropdown.Button>
                    </Col>
                </Row>
            </Col>
        </Row>
        
    )
}