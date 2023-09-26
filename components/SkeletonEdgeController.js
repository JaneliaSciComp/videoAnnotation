import React, { useState, useEffect, useRef } from 'react';
import styles from '../styles/Controller.module.css';
import { Checkbox, Tag, ColorPicker, Button, Row, Col, Space } from 'antd';

export default function SkeletonEdgeController(props) {
    /**
        To configure a skeleton edge group.
        Produce edge group data: 
            {skeletonIndex: {
                color: '#000000',
                edges: {
                    0: set(2, 5, ...), // 0, 2, 5 are indices of vertices
                    2: set(...), 
                    ...
                }
                
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
     
        state:
            edgeData: dynamically change when checkbox or last/next btn is clicked. To prevent too frequent change on props.data
                {
                    vertex1: set(vertex3, vertex5, ...),
                    vertex2: set(...), 
                    ...
                }
    */
        
    const [currentVertex, setCurrentVertex] = useState(0);
    const [checkedValues, setCheckedValues] = useState();
    const [edgeData, setEdgeData] = useState()
    const color = useRef(); 
    // const prevVertex = useRef();
    // const [error, setError] = useState();
    

    console.log('edgeGroupController render');

    // useEffect(() => {
    //     // if (currentVertex !== prevVertex.current) {
    //         setCheckedValues(Array.from(data[props.vertices[currentVertex]]));
    //     // }
      
    //   }, [currentVertex]
    // )

    function onCheckBoxChange(newCheckedValues) {
        console.log('checked = ', newCheckedValues);
        // const currentEdges = new Set(data[currentVertex]);
        
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

    function onColorChange() {

    }

    function onDoneBtnClick() {

    }


    return (
        <div className='my-2'>
            {/* <div className='my-2 d-flex align-items-center'> */}
            <p className='mx-2'>Add Edge</p> 
            {/* </div> */}

            <Row className='my-3'>
                <Col span={12} className='d-flex justify-content-center align-items-center'>
                    <Tag>{props.vertices[currentVertex].label}</Tag>
                </Col>
                <Col span={12}>
                    <Checkbox.Group 
                        options={props.vertices} 
                        value={checkedValues}
                        onChange={onCheckBoxChange} />
                </Col> 
            </Row>

            <Space.Compact block className='my-3 d-flex justify-content-center'>
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
            </Space.Compact>
            
        </div>
    )
}