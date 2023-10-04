import React, { useState, useEffect, useRef } from 'react';
import styles from '../styles/Controller.module.css';
import { Checkbox, Tag, ColorPicker, Button, Row, Col, Space } from 'antd';

export default function SkeletonEdgeController(props) {
    /**
        To configure edges for skeleton group.
        Append edge data to skeleton btn group:
            {groupIndex: {
                groupType: 'skeleton',
                ...,
                edgeData: {
                    color: '#000000',
                    edges: [
                        set(2, 5, ...), // can be empty set or undefined/null
                        set(...), 
                        ...
                    ]}
                } 
            }
            
        Props: 
            index: unique skeletonIndex. Required. Used to identify btn groups to be appended to. 
            data: Required. The data holder to append the edge data, e.g. the data used by Design component
            setData: Required. The setter of data. Use as [data, setData]=useState()
            vertices: 
                [ 'head', 'right wing', 'left wing', 'tail' ]
            color: '#1677FF'. Optional.
            disableColorPicker: boolean. False by default, true when specified. Whether to disable color picker.

            onColorChange: Callback when colorPicker changes. Will be executed after the internal funtions seting the color state vlaue. Takes one argument: target {index: int, index property of this object, value: str, the value of this color picker}
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
    
    const [verticesOptions, setVerticesOptions] = useState();
    const [currentVertex, setCurrentVertex] = useState(0);
    const [checkedValues, setCheckedValues] = useState();
    const edgeDataRef = useRef([]);
    const [color, setColor] = useState();
    // const prevVertex = useRef();
    // const [error, setError] = useState();
    

    console.log('edgeGroupController render');

    useEffect(()=>{
        // console.log('[] useEffect called');
        if (!props.data || !props.setData) {
            throw Error('Property [data] and [setData] are required, cannot be null or undefined');
        }
        if (!props.index) {
            throw Error('Property [Index] and setData are required');
        }
      },[]
    )

    useEffect(() => {
        // generate input data for radioGroup when props.vertices changes
        // console.log('props.vertices useEffect called');
        if (props.vertices) {
            const options = props.vertices.map((item, i) => {
                return {
                        label: `${i+1}-${item}`,
                        value: i
                    }
            })
            // console.log(options);
            setVerticesOptions(options);
        }
        
      }, [props.vertices] 
    )

    useEffect(() => {
        //initialize color state based on props
        if (props.color) {
            setColor(props.color);
        } else {
            setColor('#1677FF');
        }
      }, [props.color]
    )

    useEffect(() => {
        // update ui when goes to another vertex
        if (edgeDataRef.current[currentVertex]) {
            setCheckedValues(Array.from(edgeDataRef.current[currentVertex]));
        } else {
            setCheckedValues(null);
        }
      
      }, [currentVertex]
    )

    function onCheckBoxChange(newCheckedValues) {
        // console.log('checked = ', newCheckedValues);
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
        if (currentVertex < verticesOptions.length - 1) {
            setCurrentVertex(currentVertex + 1);
        }
    }

    function onColorChange(value) {
        if (value) {
            setColor(value.metaColor.originalInput);
        }

        const target = {
            index: props.index,
            value: value.metaColor.originalInput,
        };

        if (props.onColorChange) {
            props.onColorChange(target);
        }
    }

    function onDoneBtnClick() {
        const btnGroupData = {...props.data[props.index]};
        btnGroupData.edgeData = {
                color: color,
                edges: [...edgeDataRef.current],
            }
        
        console.log(btnGroupData);
        props.setData({...props.data, [props.index]: btnGroupData});
        
        const target = {
            index: props.index,
            value: {
                color: color,
                edges: [...edgeDataRef.current],
            },
        };
        if (props.onDoneBtnClick) {
            props.onDoneBtnClick(target);
        }
    }


    return (
        <div className='my-2'>
            <div className='my-2 d-flex align-items-center'>
                <span className='mx-2'>Add Edge</span> 
                <ColorPicker 
                    onChange={onColorChange}
                    value={color}
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
            {verticesOptions ? // verticesOptions will be calculated (useEffect) after initial render, so avoid rendering before it's ready
                <Row >
                    <Col span={12} className='d-flex justify-content-center align-items-center'>
                        <Tag className={styles.edgeTag}>{verticesOptions[currentVertex].label}</Tag>
                    </Col>
                    <Col span={12}>
                        <Checkbox.Group 
                            options={verticesOptions.filter(v => v.value !== currentVertex)} 
                            value={checkedValues}
                            onChange={onCheckBoxChange} />
                    </Col> 
                </Row>
                : null
            }
            
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