import React, {useState, useEffect, useRef} from 'react';
import {Dropdown, InputNumber} from 'antd';
import {Row, Col} from 'react-bootstrap';
import { useStateSetters, useStates } from './AppContext'; 
import {defaultAdditionalDataRange} from '../utils/utils';


/**
 *  props:
 *      vertical: boolean. Arrange the components vertically or horizontally.
 *      align: 'start'/'end'/'center'/'between'/'around'/'evenly'. 'start' by default. How to horizontally align componentes, if vertical is false.
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
        console.log('additionalConfig useEffect called', videoAdditionalFieldsConfig);
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
    }, [videoAdditionalFieldsConfig])
    

    function metricsSelectHandler(e) {
        const metricsForCanvas = Object.keys(videoAdditionalFieldsConfig).filter(name => videoAdditionalFieldsConfig[name].loadIn==='canvas');
        const selectedMetrics = e.selectedKeys.map(keyStr => metricsForCanvas[parseInt(keyStr)]);

        const selectedMetricsSet = new Set(selectedMetrics);
        const nameToRetrieveForCanvas = metricsForCanvas.filter(name => selectedMetricsSet.has(name));
        let nameToRetrieve = additionalDataNameToRetrieve.filter(name => videoAdditionalFieldsConfig[name].loadIn && videoAdditionalFieldsConfig[name].loadIn!=='canvas');
        nameToRetrieve = nameToRetrieve.concat(nameToRetrieveForCanvas);
        setAdditionalDataNameToRetrieve(nameToRetrieve);
        setSelectedMetrics(selectedMetrics);

    }


    function rangeChangeHandler(newValue) {
        if (typeof newValue === 'number' 
        && Number.isInteger(newValue) 
        ) {
            const newRange = {...additionalDataRange};
            metrics.forEach(m => {
                newRange[m] = newValue;
            })
            setAdditionalDataRange(newRange);
        }
    }


    return (
        <Row className={'d-flex ' + (props.vertical?'flex-column':('justify-content-'+(props.align?props.align:'start')))}>
            <Col xs='auto' className='mb-1'>
                <Row className={'d-flex '}> 
                    <Col xs='auto' className='pe-0'>
                        <span>Range</span>
                    </Col>
                    <Col xs='auto'>
                        <InputNumber  
                            min={0}
                            max={totalFrameCount ? totalFrameCount : null}
                            defaultValue={metrics.length>0?(additionalDataRange[metrics[0]]*2) : defaultAdditionalDataRange}
                            onChange={rangeChangeHandler}
                            size="small"
                            />
                    </Col>
                </Row>
            </Col>
            <Col xs='auto' className='mb-1'>
                <Row className={'d-flex '}>
                    <Col xs='auto' className='pe-0'>
                        <span>Additional Data</span>
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