import React, { useState, useEffect, useRef } from 'react';
import styles from '../styles/Controller.module.css';
import { Checkbox, Tag, ColorPicker, Button, Row, Col, Space } from 'antd';
import { useStateSetters, useStates } from './AppContext';
import {predefinedColors} from '../utils/utils.js';


export default function SkeletonEdgeController(props) {
    /**
        To configure edges for skeleton group.
        Append edge data to skeleton btn group:
            {groupIndex: {
                groupType: 'skeleton',
                ...,
                edgeData: {  # extra entry for skeleton, other types of annotation do not have
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
    const [edgeAdded, setEdgeAdded] = useState();
    // const prevVertex = useRef();
    // const [error, setError] = useState();

    //get context
    const btnConfigData = useStates().btnConfigData;
    const setBtnConfigData = useStateSetters().setBtnConfigData;
    

    // console.log('edgeGroupController render');

    useEffect(()=>{
        // console.log('[] useEffect called');
        if (!props.index) {
            throw Error('Property Index is required');
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
        const btnGroupData = {...btnConfigData[props.index]};
        console.log(btnGroupData, edgeDataRef.current);
        if (edgeDataRef.current?.length) {
            btnGroupData.edgeData = {
                color: color,
                edges: [...edgeDataRef.current],
            }
            // console.log(btnGroupData);
            setBtnConfigData({...btnConfigData, [props.index]: btnGroupData});
            // props.setAddEdge(false);
            setEdgeAdded(true);
        } 
        // else if (btnGroupData.edgeData) { //if user already added some edge, and want to reset it to be no edge.
        //     console.log('edge reset');
        //     delete(btnGroupData[edgeData]);
        //     setBtnConfigData({...btnConfigData, [props.index]: btnGroupData});
        //     setEdgeAdded(true);
        // }
        

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
            {/* <div className='my-2 d-flex align-items-center'>
                <span className='mx-2'>Add Edge</span> 
                <ColorPicker 
                    onChange={onColorChange}
                    value={color}
                    disabled = {props.disableColorPicker}
                    size="small"
                    presets={[
                        { label: 'Recommended',
                        colors: predefinedColors,
                        },
                    ]}
                    />
            </div> 
            <br /> */}
            <Row className='d-flex justify-content-center'>
                <ColorPicker 
                    className='me-3'
                    onChange={onColorChange}
                    value={color}
                    disabled = {props.disableColorPicker}
                    size="small"
                    presets={[
                        { label: 'Recommended',
                        colors: predefinedColors,
                        },
                    ]}
                    />
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
            <Row className='my-1 d-flex justify-content-center'>
                <Button type="primary" onClick={onDoneBtnClick} size='small'>Done</Button>
            </Row>
            {edgeAdded ? 
                <Row className='d-flex justify-content-center'>
                    <p>Edge info Added</p>
                </Row>
                :null
            }
            
        </div>
    )
}