import React, { useState, useEffect, useRef } from 'react';
import styles from '../styles/Controller.module.css';
import { Checkbox, Tag, ColorPicker, Button, Row, Col, Space } from 'antd';

export default function SkeletonEdgeController(props) {
    /**
        To configure a skeleton edge group.
        Produce edge group data: 
            {skeletonIndex: {
                color: '#000000',
                edges: [
                    set(2, 5, ...), // can be empty set or undefined/null
                    set(...), 
                    ...
                ]
                
            }} 
            
        Props: 
            index: unique skeletonIndex. Required. to match the index of btn groups, to distinguish from other skeleton (if multiple skeletons). 
            data: Required. The generated data, structure as above, will be append to it
            setData: Required. The setter of data. Use as [data, setData]=useState()
            vertices: 
                [
                    {label: 'head', value: 0},
                    ...
                ]
            color: '#1677FF'. Optional.
            disableColorPicker: boolean. False by default, true when specified. Whether to disable color picker.

            onColorChange: Callback when colorPicker changes. Takes one argument: target {index: int, index property of this object, value: str, the value of this color picker}
            onDoneBtnClick: When the Done btn is clicked, it will append the edge data to the data property by calling setData. 
                Developer can also add extra function by defining this api. It will be called after the appending function.
                Takes the edge data as the argument.


            disableGroupTypeSelect: boolean. False by default, true when specified. Whether to disable groupType selcet.
            disableBtnTypeSelect: boolean. False by default, true when specified. Whether to disable btnType select.
            disableBtnNumInput: boolean. False by default, true when specified. Whether to disable btn num input.
            // enableGenerateBtn: boolean. False by defualt, true when specified. Whether to include the generate btn
            enableDelete: boolean. False by default, true when specified. Whether to include the delete btn.
            onGroupTypeChange: Callback when group type select changes
            onBtnTypeChange: Callback when btn type select changes
            onBtnNumChange: Callback when btn num input changes
            onDownBtnClick: When the down btn is clicked, it will generate the btnController children. 
                Developer can also add extra function by defining this api. It will be called after the generating function.
                Takes one argument: target
                    {
                        index: getSelfIndex(),
                        groupType: groupType,
                        btnType: btnType,
                        btnNum: btnNum
                    };
            onDelete: Callback when delete btn clicked. Takes one argument: target {index: int}
     
        Ref:
            edgeDataRef: dynamically change when checkbox or last/next btn is clicked. To prevent too frequent change on props.data
                [
                    set(vertex3, vertex5, ...), // can be empty set or undefined/null
                    set(...), 
                    ...
                ]
            color: dynamically change when user pick new value
    */
        
    const [currentVertex, setCurrentVertex] = useState(0);
    const [checkedValues, setCheckedValues] = useState();
    const edgeDataRef = useRef([]);
    const colorRef = useRef(); 
    // const prevVertex = useRef();
    // const [error, setError] = useState();
    

    console.log('edgeGroupController render');

    useEffect(()=>{
        if (!props.data || !props.setData) {
            throw Error('Property data and setData are required, cannot be null or undefined');
        }
        if (!props.index) {
            setIndex(Date.now().toString());
        }
      },[]
    )

    useEffect(() => {
        if (edgeDataRef.current[currentVertex]) {
            setCheckedValues(Array.from(edgeDataRef.current[currentVertex]));
        } else {
            setCheckedValues(null);
        }
      
      }, [currentVertex]
    )

    function onCheckBoxChange(newCheckedValues) {
        console.log('checked = ', newCheckedValues);
        setCheckedValues(newCheckedValues);
        const existingEdges = edgeDataRef.current[currentVertex] ? edgeDataRef.current[currentVertex] : new Set();
        let neighbor, neighborEdges;
        if (existingEdges.size < newCheckedValues.length) { //user checked a new value, add edge to this new neighbor's data
            neighbor = newCheckedValues.filter(v => !existingEdges.has(v))[0];
            neighborEdges = new Set(edgeDataRef.current[neighbor]);
            neighborEdges.add(currentVertex);
        } else { // user unchecked a value, delete the edge from this neighbor's data
            const newCheckedValuesSet = new Set(newCheckedValues);
            neighbor = Array.from(existingEdges).filter(v => !newCheckedValuesSet.has(v))[0];
            neighborEdges = new Set(edgeDataRef.current[neighbor]);
            neighborEdges.delete(currentVertex);
        }

        const newEdgeData = [...edgeDataRef.current];
        newEdgeData[neighbor] = neighborEdges;
        newEdgeData[currentVertex] = new Set(newCheckedValues);
       
        edgeDataRef.current = newEdgeData;
    };

    function onLastBtnClick() {
        if (currentVertex > 0) {
            setCurrentVertex(currentVertex - 1);
        }
    }
    
    function onNextBtnClick() {
        if (currentVertex < props.vertices.length - 1) {
            setCurrentVertex(currentVertex + 1);
        }
    }

    function onColorChange(value) {
        colorRef.current = value.metaColor.originalInput;

        const target = {
            index: props.index,
            value: value.metaColor.originalInput,
        };

        if (props.onColorChange) {
            props.onColorChange(target);
        }
    }

    function onDoneBtnClick() {
        const data = {
            [props.index]: {
                color: colorRef.current,
                edges: [...edgeDataRef.current],
            }
        }
        console.log(data);
        props.setData({...props.data, data});
        
        if (props.onDoneBtnClick) {
            props.onDoneBtnClick({...data});
        }
    }


    return (
        <div className='my-2'>
            <div className='my-2 d-flex align-items-center'>
                <span className='mx-2'>Add Edge</span> 
                <ColorPicker 
                    onChange={onColorChange}
                    defaultValue={props.color ? props.color : '#1677FF'}
                    disabled = {props.disableColorPicker}
                    size="small"
                    presets={[
                        { label: 'Recommended',
                        colors: [
                            '#F5222D',
                            '#FA8C16',
                            '#FADB14',
                            '#8BBB11',
                            '#52C41A',
                            '#13A8A8',
                            '#1677FF',
                            '#2F54EB',
                            '#722ED1',
                            '#EB2F96',
                        ],
                        },
                    ]}
                    />
            </div>
            {/* <p className='mx-2'>Add Edge</p>  */}
            <br />
            <Row className='d-flex justify-content-center'>
                <Button onClick={onLastBtnClick} size='small' className='mx-2'>Last</Button>
                <Button onClick={onNextBtnClick} size='small' className='mx-2'>Next</Button>
            </Row>
            <br />
            <Row >
                <Col span={12} className='d-flex justify-content-center align-items-center'>
                    <Tag className={styles.edgeTag}>{props.vertices[currentVertex].label}</Tag>
                </Col>
                <Col span={12}>
                    <Checkbox.Group 
                        options={props.vertices.filter(v => v.value !== currentVertex)} 
                        value={checkedValues}
                        onChange={onCheckBoxChange} />
                </Col> 
            </Row>
            <br />
            <Row className='my-2 d-flex justify-content-center'>
                <Button type="primary" onClick={onDoneBtnClick} size='small'>Done</Button>
            </Row>

            {/* <Space.Compact block className='my-3 d-flex justify-content-center'>
                <ColorPicker className={styles.edgeColorPicker}
                        onChange={onColorChange}
                        defaultValue='#1677FF'
                        disabled = {props.disableColorPicker}
                        size="small"
                        presets={[
                            { label: 'Recommended',
                            colors: [
                                '#F5222D',
                                '#FA8C16',
                                '#FADB14',
                                '#8BBB11',
                                '#52C41A',
                                '#13A8A8',
                                '#1677FF',
                                '#2F54EB',
                                '#722ED1',
                                '#EB2F96',
                            ],
                            },
                        ]}
                        />
                <Button onClick={onLastBtnClick} size='small'>Last</Button>
                <Button onClick={onNextBtnClick} size='small'>Next</Button>
                <Button type="primary" onClick={onDoneBtnClick} size='small'>Done</Button>
            </Space.Compact> */}
            
        </div>
    )
}