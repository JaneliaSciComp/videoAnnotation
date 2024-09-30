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

    //context
    const totalFrameCount = useStates().videoMetaRef.current.totalFrameCount;
    const additionalDataRange = useStates().additionalDataRange;
    const setAdditionalDataRange = useStateSetters().setAdditionalDataRange;
    const resetChart = useStates().resetChart;
    const setResetChart = useStateSetters().setResetChart;
    const additionalDataNameToRetrieve = useStates().additionalDataNameToRetrieve;
    const setAdditionalDataNameToRetrieve = useStateSetters().setAdditionalDataNameToRetrieve;
    const videoAdditionalFieldsConfig = useStates().videoAdditionalFieldsConfig;
    const setAnnotationChartRange = useStateSetters().setAnnotationChartRange;

    // console.log('chartController render', props.metrics, additionalDataRange);
    
    useEffect(() => {
        if (resetChart) {
            setSelectedMetrics([]);
            props.setChartMetrics([]);
            setResetChart(() => false);
        }
    }, [resetChart])

    useEffect(() => {
        // console.log('props.metrics useEffect called');
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

    useEffect(() => {
        const newRange = {};
        let annotationRange;
        if (props.hideRange) {
            if (Number.isInteger(props.halfRange) && props.halfRange>=0) {
                // console.log('halfRange set', props.halfRange);
                Object.keys(videoAdditionalFieldsConfig).forEach(name => {
                    if (videoAdditionalFieldsConfig[name]?.loadIn==='chart') {
                        newRange[name] = props.halfRange;
                    } else if (videoAdditionalFieldsConfig[name]?.loadIn==='canvas') {
                        newRange[name] = additionalDataRange[name];
                    }
                })
                annotationRange = props.halfRange;
                
            } else {
                throw new Error("When hideRange is true, halfRange must be set to be a non-negative integer.");
            }
            if (props.defaultHalfRange) {
                throw new Error("When hideRange is true, defaultHalfRange should not be used. Please use halfRange instead.");
            }
        } else {
            if (Number.isInteger(props.defaultHalfRange) && props.defaultHalfRange>=0) {
                // console.log('defaultHalfRange set', props.defaultHalfRange);
                Object.keys(videoAdditionalFieldsConfig).forEach(name => {
                    if (videoAdditionalFieldsConfig[name]?.loadIn==='chart') {
                        newRange[name] = props.defaultHalfRange;
                    } else if (videoAdditionalFieldsConfig[name]?.loadIn==='canvas') {
                        newRange[name] = additionalDataRange[name];
                    }
                })
                annotationRange = props.defaultHalfRange;
            } else { // if defaultHalfRange is not set, use defaultAdditionalDataRange
                // console.log('defaultHalfRange not set, use defaultAdditionalDataRange');
                Object.keys(videoAdditionalFieldsConfig).forEach(name => {
                    if (videoAdditionalFieldsConfig[name]?.loadIn==='chart') {
                        newRange[name] = defaultAdditionalDataRange;
                    } else if (videoAdditionalFieldsConfig[name]?.loadIn==='canvas') {
                        newRange[name] = additionalDataRange[name];
                    }
                })
                annotationRange = defaultAdditionalDataRange;
            }
        }
        // console.log(newRange);
        setAdditionalDataRange(oldObj => newRange);
        setAnnotationChartRange(oldValue => annotationRange);
    }, [videoAdditionalFieldsConfig])
    

    // function menuClickHandler(e) {
    //     const metric = items[e.key].label;
    //     console.log(e);
    //     props.setChartMetric(metric);
    // }

    function metricsSelectHandler(e) {
        // console.log('select metrics',e);
        const currentSelectedMetrics = e.selectedKeys.map(keyStr => props.metrics[parseInt(keyStr)]);
        // console.log(selectedMetrics);

        // update additionalDataNameToRetrieve
        // will cause additionalData to change, then parent useEffect is called
        // then sibling Chart is rerendered. 
        let nameToRetrieve = additionalDataNameToRetrieve.filter(name => videoAdditionalFieldsConfig[name].loadIn && videoAdditionalFieldsConfig[name].loadIn!=='chart');
        // console.log(additionalDataNameToRetrieve, nameToRetrieve);
        nameToRetrieve = nameToRetrieve.concat(currentSelectedMetrics);
        // console.log('chart nameToRetrieve', currentSelectedMetrics, nameToRetrieve);
        setAdditionalDataNameToRetrieve(nameToRetrieve);

        props.setChartMetrics(currentSelectedMetrics); //sibling Chart rerender again
        setSelectedMetrics(currentSelectedMetrics);
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

    function rangeChangeHandler(newValue) {
        // console.log('chartController range new value', newValue, additionalDataRange);
        if (Number.isInteger(newValue) && newValue>=0) {
            // props.setRange(newValue);

            // const halfRange = Math.floor(newValue/2);
            const newRange = {...additionalDataRange};
            props.metrics.forEach(m => {
                newRange[m] = newValue;
            })
            // console.log('chartController rangeChangeHandler', newRange);
            setAdditionalDataRange(oldObj => newRange);

            setAnnotationChartRange(oldValue => newValue);
        }
    }


    //justify-content-center
    // + (props.vertical?'flex-column':('justify-content-'+(props.align?props.align:'start')))
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
                                // defaultValue={40}
                                defaultValue={props.defaultHalfRange ?? defaultAdditionalDataRange} //metrics.length>0?(additionalDataRange[metrics[0]]*2) : 
                                // value={props.metrics.length>0?(additionalDataRange[props.metrics[0]]*2) : null}
                                // value={props.range}
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