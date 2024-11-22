import React, {useState, useEffect, useRef} from 'react';
import {Dropdown, InputNumber} from 'antd';
import {Row, Col} from 'react-bootstrap';
import { useStateSetters, useStates } from './AppContext'; 
import {defaultAdditionalDataRange} from '../utils/utils';


/**
 *  props:
 *      vertical: boolean. Arrange the components vertically or horizontally.
 *      align: 'start'/'end'/'center'/'between'/'around'/'evenly'. 'start' by default. How to horizontally align componentes, if vertical is false.
 *      hideRange: boolean. Hide the range input.
 *      halfRange: int. Allow developer to set half range value when hideRange is true. Required and only available when hideRange is true.
 *      defaultHalfRange: int. Default value for half range input. Should only be used when hideRange is false.
 */
export default function CanvasAdditionalDataController(props) {
    const [metrics, setMetrics] = useState([]);
    const [menuProps, setMenuProps] = useState();
    const [selectedMetrics, setSelectedMetrics] = useState([]);
    const [open, setOpen] = useState(false);

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
            setResetChart(() => false);
        }
    }, [resetChart])

    useEffect(() => {
        const metricsForCanvas = Object.keys(videoAdditionalFieldsConfig).filter(name => videoAdditionalFieldsConfig[name].loadIn==='canvas');
        setMetrics(metricsForCanvas);

        const items = metricsForCanvas.map((item, i) => {
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

        const newRange = {};
        if (props.hideRange) {
            if (Number.isInteger(props.halfRange) && props.halfRange>=0) {
                Object.keys(videoAdditionalFieldsConfig).forEach(name => {
                    if (videoAdditionalFieldsConfig[name]?.loadIn==='canvas') {
                        newRange[name] = props.halfRange;
                    } else if (videoAdditionalFieldsConfig[name]?.loadIn==='chart') {
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
                    if (videoAdditionalFieldsConfig[name]?.loadIn==='canvas') {
                        newRange[name] = props.defaultHalfRange;
                    } else if (videoAdditionalFieldsConfig[name]?.loadIn==='chart') {
                        newRange[name] = additionalDataRange[name];
                    }
                })
            } else {
                Object.keys(videoAdditionalFieldsConfig).forEach(name => {
                    if (videoAdditionalFieldsConfig[name]?.loadIn==='canvas') {
                        newRange[name] = defaultAdditionalDataRange;
                    } else if (videoAdditionalFieldsConfig[name]?.loadIn==='chart') {
                        newRange[name] = additionalDataRange[name];
                    }
                })
            }
        }
        setAdditionalDataRange(oldObj => newRange);
    }, [videoAdditionalFieldsConfig]) 
    
    useEffect(() => {
        if (menuProps) {
            menuProps.onSelect = metricsSelectHandler;
            menuProps.onDeselect = metricsSelectHandler;
        }
    }, [additionalDataNameToRetrieve])

    function metricsSelectHandler(e) {
        const metricsForCanvas = Object.keys(videoAdditionalFieldsConfig).filter(name => videoAdditionalFieldsConfig[name].loadIn==='canvas');
        const currentSelectedMetrics = e.selectedKeys.map(keyStr => metricsForCanvas[parseInt(keyStr)]);

        let nameToRetrieve = additionalDataNameToRetrieve.filter(name => videoAdditionalFieldsConfig[name].loadIn && videoAdditionalFieldsConfig[name].loadIn!=='canvas');
        nameToRetrieve = nameToRetrieve.concat(currentSelectedMetrics);
        setAdditionalDataNameToRetrieve(nameToRetrieve);
        setSelectedMetrics(currentSelectedMetrics);

    }


    function rangeChangeHandler(newValue) {
        if (Number.isInteger(newValue) && newValue>=0) {
            const newRange = {...additionalDataRange};
            metrics.forEach(m => {
                newRange[m] = newValue;
            })
            setAdditionalDataRange(newRange);
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
                        <span>Data</span>
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
        </Row>
        
    )
}