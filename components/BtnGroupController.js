import React, { useState, useEffect, useRef } from 'react';
import styles from '../styles/Controller.module.css';
import BtnController from './BtnController';
import SkeletonEdgeController from './SkeletonEdgeController';
import { Select, Input, InputNumber, Button, Space } from 'antd';
import { DownOutlined, DeleteOutlined} from '@ant-design/icons';
// import {Button} from 'react-bootstrap';
import { useStateSetters, useStates } from './AppContext';
import { btnGroupTypeOptions, btnTypeOptions } from '../utils/utils';

const BTNNUM_MAX=50


/**
    To configure a annotating btn group.
    Produce btnGroup data: 
        {groupIndex: {
            // groupIndex:  , // even though this seems redundent, user doesn't need to handle it, so it's ok.
            groupType: 'shape',
            btnType: 'bbox',
            btnNum: 2,
            childData: [
                {index: 0, 
                btnType: 'bbox',
                label: 'fly',
                color: '#FFFFFF'
                },
                {index: 1, ...},
                ...
            ]}
        }
    Props: 
        index: unique index, to indicate the order of btn groups If not provided, then set up index state.  //Required. //when specify onDelete. To distinguish from other btnGroupController
        defaultGroupType: 'category'/'shape'/'skeleton'. Optional. When specified, the btnType dropdown will be generated accordingly; otherwise, use general list.
        groupType: 'category'/'shape'/'skeleton'. Optional. When specified, the value of the btnType select will be set, and the btnType dropdown will be generated accordingly; otherwise, use general list.
        defaultBtnType: 'bbox'. Optional. When specified, the default value of the btnType select will be set.
        btnType: 'bbox'. Optional. When specified, the value of the btnType select will be set.
        defaultBtnNum: integer. Optional.
        btnNum: integer. Optional.
        maxBtnNum: integer. Optional
        //!!!!! The data and setData cannot be replaced by an internal state or ref, because there is no btn to trigger passing internal data to props
        // data:  Required. Used with setData. To hold btn data generated by the controller
        // setData: function. Required. The setter of data. Use as [data, setData]=useState()
        groupTypePlaceHolder: 'Group type'
        btnTypePlaceHolder: 'Btn type'
        disableGroupTypeSelect: boolean. False by default, true when specified. Whether to disable groupType selcet.
        disableBtnTypeSelect: boolean. False by default, true when specified. Whether to disable btnType select.
        disableBtnNumInput: boolean. False by default, true when specified. Whether to disable btn num input.
        // enableGenerateBtn: boolean. False by defualt, true when specified. Whether to include the generate btn
        
        onGroupTypeChange: Callback when group type select changes
        onBtnTypeChange: Callback when btn type select changes
        onBtnNumChange: Callback when btn num input changes
        onDownBtnClick: When the Down btn is clicked, it will generate the btnController children. 
            Developer can also add extra function by defining this api. It will be called after the generating function.
            Takes one argument: target
                {
                    index: getSelfIndex(),
                    groupType: groupType,
                    btnType: btnType,
                    btnNum: btnNum
                };
        onDoneBtnClick: When the Done btn is clicked, it will add data to BtnConfigContext. 
            Developer can also add extra function by defining this api. It will be called after the built-in function.
            Takes one argument: target
                {index: {
                    groupType: groupType,
                    btnType: btnType,
                    btnNum: btnNum,
                    childData: [...groupData]
                }};
        
        // below props be treated differently when placing this comp in a Desgin comp or not
        enableDelete: True when specified. Whether to make the delete btn visible. Should not be specified when using this comp independently
        onDelete: Callback when delete btn clicked. Takes one argument: target {index: int}
        getData: boolean. monitored by useEffect. When change to true, pass interval btn group data to parent's(Design) config data context. Changed by Create btn in Design. Useless when Done btn is enabled.
        setGetData: setter of getData
        disableDoneBtn: make Done btn invisible when use this comp in Design comp
        onDoneBtnClick: When the Done btn is clicked, it will pass data into parent's configData. Developer can also add extra function by defining this api. 
            It will be called after the prebuilt function.
        // skeletonData: to pass to child SkeletonEdgeController to hold generated edge data if user choose 'skeleton'
        // setSkeletonData: skeletonData setter. To pass to child SkeletonEdgeController
        
        // below props are only for groupType='brush'
        // includeBrushTool: boolean. False by default, true when speicified. When true, include an extra brushToolController to configure BrushTool comp. When false, no BrushTool comp will be generated.
*/
export default function BtnGroupController(props) {
    
    const [groupData, setGroupData] = useState([]); // cannot be replaced by ref, ref cannot trigger useEffect immediately
    const [index, setIndex] = useState();
    const [groupType, setGroupType] = useState();
    const [btnType, setBtnType] = useState();
    const [btnNum, setBtnNum] = useState(0);
    const [error, setError] = useState();
    const [children, setChildren] = useState([]);
    // const [childrenData, setChildrenData] = useState([]);
    const prevBtnNumRef = useRef(0);
    const prevBtnTypeRef = useRef();
    const [addEdge, setAddEdge] = useState(false);
    const [disableEdgeBtn, setDisableEdgeBtn] = useState(true);
    const [dataAdded, setDataAdded] = useState(false);
    const [skeletonName, setSkeletonName] = useState();

    //get context
    const btnConfigData = useStates().btnConfigData;
    const setBtnConfigData = useStateSetters().setBtnConfigData;

    // console.log('btnGroupController render');
    
    useEffect(()=>{
        // if (!props.data || !props.setData) {
        //     throw Error('Property data and setData are required, cannot be null or undefined');
        // }
        if (!props.index) {
            setIndex(Date.now().toString());
        }

        if (props.groupType) {
            setGroupType(props.groupType);
        }
        if (props.btnType) {
            setBtnType(props.btnType);
        }
        if (props.btnNum) {
            setBtnNum(props.btnNum);
        }
      },[]
    )


    useEffect(() => {
        if (props.status==='edit') {
            if (btnConfigData[props.index].childData) {
                setGroupData([...btnConfigData[props.index].childData]);
            }
            if (btnConfigData[props.index].groupType==='skeleton') {
                setAddEdge(true);
                setSkeletonName(btnConfigData[props.index].skeletonName);
            }
        } else if (props.status==='new') {
            setGroupData([]);
            setAddEdge(false);
            setSkeletonName(null);
        }
    }, [props.status])


    useEffect(()=>{
        //when Design set getData to true, add the groupData to btnConfigData
        const myIndex = getSelfIndex();
        console.log(myIndex, btnConfigData, props.getData);
        if (myIndex && props.getData && props.getData[myIndex]) { 
            // const labelsValid = checkLabels(); 
            // if (labelsValid) {
            //     setBtnConfigData({...btnConfigData, [index]: {
            //         // groupIndex: getSelfIndex(),
            //         groupType: groupType,
            //         btnType: btnType,
            //         btnNum: btnNum,
            //         childData: [...groupData]}
            //     });
            //     setError(null);
            // } else {
            //     setError('Labels cannot be empty!');
            // }
            addDataToBtnConfigData();
            props.setGetData({...props.getData, [myIndex]: false});
        }
      }, [props.getData]
    )



    // useEffect(() => {
    //     // to update callback's scope when data changes
    //     // rerender addEdge btn when disableEdgeBtn state changes
    //     // console.log('useEffect called');
    //     if (props.data && getSelfIndex()) { // avoid calling when component just mounted
    //         renderChildren(); //update callback's scope
    //     } 

    //   }, [props.data, disableEdgeBtn]
    // )
    useEffect(() => {
        // to update callback's scope when data changes
        // rerender addEdge btn when disableEdgeBtn state changes
        // console.log('useEffect called');
        if ((skeletonName || groupData) && getSelfIndex()) { // avoid calling when component just mounted
            renderChildren(); //update callback's scope
        } 

      }, [groupData, disableEdgeBtn, skeletonName]
    )

    // useEffect(() => {
    //     // when child label change, check if all children have label, if yes, enable add edge
    //     if (props.data && getSelfIndex() && props.data[getSelfIndex()].groupType === 'skeleton') {
    //         checkLabels(); 
    //     }
    // }, [props.data])
    useEffect(() => {
        // when groupData changes, remove error info, remove dataAdded info
        if (error) {
            setError(null);
        }
        if (dataAdded) {
            setDataAdded(false);
        }
        // when child label change, check if all children have label. If yes, enable addEdge btn
        if (groupData && getSelfIndex() && groupType === 'skeleton') {
            const labelsValid = checkLabels();
            if (labelsValid) {
                setDisableEdgeBtn(false);
            } else {
                setDisableEdgeBtn(true);
                setAddEdge(false);
            }
            
        } 
    }, [groupData])


    function onGroupTypeChange(newValue, opt) {
        // console.log(newValue);
        // console.log(btnOptions[newValue]);
        setGroupType(newValue);
        setBtnType(btnTypeOptions[newValue][0]['value']);

        // if user has defined custom callback
        if (props.onGroupTypeChange) {
            const target = {
                index: getSelfIndex(),
                value: newValue,
                label: opt.label
            };
            props.onGroupTypeChange(target);
        }
    }

    function onBtnTypeChange(newValue, opt) {
        setBtnType(newValue);

        // if user has defined custom callback
        if (props.onBtnTypeChange) {
            const target = {
                index: getSelfIndex(),
                value: newValue,
                label: opt.label
            };
            props.onBtnTypeChange(target);
        }
    }

    function onBtnNumChange(newValue) {
        const max = props.maxBtnNum ? props.maxBtnNum : BTNNUM_MAX;
        if (typeof newValue === 'number' 
        && Number.isInteger(newValue) 
        && newValue>=0 
        && newValue<=max) {
            setBtnNum(newValue);
            setError(null);
            // if user has defined custom callback
            if (props.onBtnNumChange) {
                const target = {
                    index: getSelfIndex(),
                    value: newValue,
                };
                props.onBtnNumChange(target);
            }
        } else {
            setBtnNum(prevBtnNumRef.current);
            setError(`Btn num should be integer no more than ${max}!`);
        }
    }

    function onDownBtnClick() {
        const index = getSelfIndex();
        const childrenData = getData();
        let data = [];
        if (groupType && btnType) {
            if (btnType !== prevBtnTypeRef.current) {
                console.log(btnType, prevBtnTypeRef.current);
                data = createChildrenData(0, btnNum);
            } else {
                if (btnNum > prevBtnNumRef.current) {
                    // console.log('>');
                    const newData = createChildrenData(prevBtnNumRef.current, btnNum);
                    data = [...childrenData, ...newData];
                } else if (btnNum < prevBtnNumRef.current) {
                    // console.log('<');
                    data = [...childrenData].slice(0, btnNum);
                } else {
                    // console.log('=');
                    data = childrenData;
                }
            }
        } 
        
        prevBtnNumRef.current = btnNum;
        prevBtnTypeRef.current = btnType;

        // props.setData({...props.data, [index]: {
        //     // groupIndex: getSelfIndex(),
        //     groupType: groupType,
        //     btnType: btnType,
        //     btnNum: btnNum,
        //     childData: data
        // }});
        setGroupData(data);

        if (props.onDownBtnClick) {
            const target = {
                index: getSelfIndex(),
                groupType: groupType,
                btnType: btnType,
                btnNum: btnNum
            };
            props.onDownBtnClick(target);
        }        
    }

    // function getData() {
    //     const index = getSelfIndex();
    //     let data = props.data[index].childData;
    //     if (!data) {
    //         data=[]
    //     }
    //     return data; //arr
    // }
    function getData() {
        // const index = getSelfIndex();
        let data = groupData;
        if (!data) {
            data=[]
        }
        return groupData; //TODO: this func can be deleted
    }

    function getSelfIndex() {
        console.log()
        return props.index ? props.index : index; 
    }

    function createChildrenData(startIndex, endIndex) {
        const newData=[];
        for (let i = startIndex; i < endIndex; i++) {
            const data = {
                index: i,
                // groupType: groupType,
                btnType: btnType,
                label: '',
                color: '#1677FF',
            };
            newData.push(data);
        }
        return newData;
    }


    function renderChildren() {
        // console.log('renderChildren called');
        const childrenData = getData();
        // console.log(childrenData);
        let res = [];

        if (childrenData[0]?.btnType === 'skeleton') {
            // console.log(childrenData[0].btnType=== 'skeleton');
            res.push(
                <Input key={childrenData.length+1} className={styles.labelText}
                    // addonBefore="Label"
                    allowClear
                    placeholder="Label: e.g. 'mouse'"
                    value={skeletonName}
                    onChange={onSkeletonNameChange}
                    size='small'
                    // count={{ //for antd ≥5.10
                    //     show: true,
                    //     max: 20,
                    //     // exceedFormatter: (txt, { max }) => txt.slice(0, max),
                    // }}
                    />
            );
        }

        for (let i = 0; i < childrenData.length; i++) {
            res.push(
                <BtnController 
                    key={i}
                    index={i} 
                    // data={childrenData[i]}
                    // groupType={childrenData[i].groupType}
                    btnType={childrenData[i].btnType}
                    color={childrenData[i].color}
                    label={childrenData[i].label}
                    typeSelectPlaceHolder='Btn type'
                    labelPlaceHolder={childrenData[i].btnType === 'skeleton' ? "Landmark: 'head'" : "Label: 'mouse'"}
                    disableTypeSelect
                    enableDelete
                    // onTypeChange={onChildTypeChange}
                    onLabelChange={onChildLabelChange}
                    onColorChange={onChildColorChange}
                    onCrowdChange={onChildCrowdChange}
                    onDelete={onChildDelete}
                    />); 
        }
        // console.log(childrenData[0], childrenData[0].btnType === 'skeleton');
        if (childrenData[0] && childrenData[0].btnType === 'skeleton') {
            // console.log(childrenData[0].btnType=== 'skeleton');
            res.push(
                <Button 
                    key={childrenData.length} 
                    onClick={onAddEdgeBtnClick} 
                    disabled={disableEdgeBtn}
                    size='small'
                    >
                    Add Edge
                </Button>
            
            // <SkeletonEdgeController 
            //             index={getSelfIndex()}
            //             vertices={generateSkeletonVerticesData()}
            //             data={props.skeletonData}
            //             setData={props.setSkeletonData} 
            //              />
                    );
        }

        // console.log(res);
        setChildren(res);
    }


    function onDelete() {
        const target = {
            index: getSelfIndex(),
        }

        if (props.onDelete) {
            props.onDelete(target);
        }
    }

    
    function onChildLabelChange(target) {
        // console.log('parent ',target);
        // const index = getSelfIndex();
        const childrenData = getData();
        const data = {...childrenData[target.index]}; //btn data
        // console.log('label', children[target.index]);
        data.label = target.value;
        // console.log(data);
        
        // childrenData[target.index] = data; // to replace all code below
        const childrenDataCopy = [...childrenData];
        childrenDataCopy[target.index] = data;
        // props.setData({...props.data, [index]: {
        //     // groupIndex: getSelfIndex(),
        //     groupType: groupType,
        //     btnType: btnType,
        //     btnNum: btnNum,
        //     childData: childrenDataCopy
        // } });
        setGroupData(childrenDataCopy);
    } 

    function onChildColorChange(target) {
        // const index = getSelfIndex();
        const childrenData = getData();
        const data = {...childrenData[target.index]};
        // console.log('color', childrenData);
        data.color = target.value;
        // console.log(data);
        const childrenDataCopy = [...childrenData];
        childrenDataCopy[target.index] = data;
        // props.setData({...props.data, [index]: {
        //     // groupIndex: getSelfIndex(),
        //     groupType: groupType,
        //     btnType: btnType,
        //     btnNum: btnNum,
        //     childData: childrenDataCopy
        // } });
        setGroupData(childrenDataCopy);
    }

    function onChildCrowdChange(target) {
        // const index = getSelfIndex();
        const childrenData = getData();
        const data = {...childrenData[target.index]};
        // console.log('color', childrenData);
        data.omitCrowdRadio = target.value==='yes'?false : true;
        // console.log(data);
        const childrenDataCopy = [...childrenData];
        childrenDataCopy[target.index] = data;
        setGroupData(childrenDataCopy);
    }

    function onChildDelete(target) {
        setBtnNum(btnNum-1);
        prevBtnNumRef.current = prevBtnNumRef.current>0 ? prevBtnNumRef.current-1 : 0;
        // const index = getSelfIndex();
        const newChildrenData = [...getData().filter(item=>item.index!==target.index)];
        // newChildrenData.splice(target.index, 1);
        newChildrenData.forEach((item,i) => {item.index=i});
        // props.setData({...props.data, [index]: newChildrenData});
        // props.setData({...props.data, [index]: {
        //     // groupIndex: getSelfIndex(),
        //     groupType: groupType,
        //     btnType: btnType,
        //     btnNum: btnNum,
        //     childData: newChildrenData
        // } });
        setGroupData(newChildrenData);
    }

    function onAddEdgeBtnClick() {
        setAddEdge(true);
    }

    function checkLabels() {
        const childData = getData();
        // console.log(childData);
        let childWithLabel = 0;
        // if (childData) {
            for (const child of childData) {
                // console.log(child, child.label, typeof child.label === 'string', child.label!=='');
                if (typeof child.label === 'string' && child.label!=='') {
                    childWithLabel++;
                }
            }
        // }
        // console.log(childWithLabel, childWithLabel==childData.length);
        if (childWithLabel===childData.length) {
            return true;
            // setDisableEdgeBtn(false);
        } else {
            return false;
            // setDisableEdgeBtn(true);
            // setAddEdge(false);
        }
    }

    function generateSkeletonVerticesData() {
        // console.log(getData());
        return getData().map(item => item.label);
    }

    function onDoneBtnClick() {
        addDataToBtnConfigData();
        setDataAdded(true);

        const target= {[index]: {
            groupType: groupType,
            btnType: btnType,
            btnNum: btnNum,
            childData: [...groupData]}};
        
        if (props.onDoneBtnClick) {
            props.onDoneBtnClick(target);
        }
    }

    function onSkeletonNameChange(e) {
        setSkeletonName(e.target.value);

    } 


    function addDataToBtnConfigData() {
        const index = getSelfIndex();
        const labelsValid = checkLabels(); 
        console.log(index, 'pass data');
        
        if (labelsValid && groupData?.length) {
            const newData = {
                groupType: groupType,
                btnType: btnType,
                btnNum: btnNum,
                childData: [...groupData]
            };
            let edgeData;
            if (btnConfigData[index]) {
                edgeData = btnConfigData[index].edgeData; //if already set edge data for skeleton
            }
            if (edgeData) {
                newData.edgeData = {...edgeData};
            }
            if (groupType === 'skeleton') {
                newData.skeletonName = skeletonName;
            }
            console.log(newData);
            setBtnConfigData({...btnConfigData, [index]: newData });
            setError(null);
        } else {
            setError('Labels cannot be empty!');
        }
    }


    return (
        <div className={props.bordered?styles.btnGroupControllerContainerBordered : styles.btnGroupControllerContainer} >
            <div className=' d-inline-flex'>
                <Space.Compact block className='px-0'>
                    <Select className={styles.groupSelect}
                        defaultValue={props.defaultGroupType}
                        value={groupType}
                        onChange={onGroupTypeChange}
                        options={btnGroupTypeOptions}
                        placeholder={props.groupTypePlaceHolder}
                        disabled={props.disableGroupTypeSelect}
                        size='small'
                        />
                    <Select className={styles.btnSelect}
                        defaultValue={props.defaultBtnType}
                        value={btnType}
                        onChange={onBtnTypeChange}
                        options={groupType ? btnTypeOptions[groupType] : []}
                        placeholder={props.btnTypePlaceHolder}
                        disabled={props.disableBtnTypeSelect}
                        size='small'
                        />
                    <InputNumber className={styles.numInput}
                        // className={videoStyles.playFpsInput} 
                        // min={0}
                        // max={props.maxBtnNum ? props.maxBtnNum : BTNNUM_MAX}
                        defaultValue={props.defualtBtnNum}
                        value={btnNum}
                        onChange={onBtnNumChange}
                        size="small"
                        disabled={props.disableBtnNumInput}
                        />
                </Space.Compact>

                {/* {props.enableDelete ? */}
                    <Button className={styles.generateBtn} 
                        // shape='circle'
                        type='text'
                        icon={<DownOutlined />}
                        onClick={onDownBtnClick} 
                        size='small'
                        />
                    {/* :null
                } */}
                {props.enableDelete ?
                    <Button className={styles.deleteBtn} 
                        // shape='circle'
                        type='text'
                        icon={<DeleteOutlined />} 
                        onClick={onDelete}
                        size='small'
                        />
                    :null
                }
            </div>
            {error ?
                <p className={styles.errorInfo}>{error}</p>
                : null
            }
            <div className='ms-3 my-2'>
                {children ?
                    <Space direction='vertical'>
                        {children}
                    </Space>
                    : null
                }
                {addEdge ?
                    <div className='my-3 mx-2'> 
                    <SkeletonEdgeController 
                        index={getSelfIndex()}
                        vertices={generateSkeletonVerticesData()}
                        // data={props.data}
                        // setData={props.setData}
                        setAddEdge={setAddEdge}
                        status={props.status}
                        />
                    </div>
                    :null   
                }
            </div>
            {!props.disableDoneBtn ?
                <div className='my-2 d-flex flex-column align-items-center'>
                    <div className='my-2'>
                        <Button type="primary" onClick={onDoneBtnClick} size='small'>Done</Button>
                    </div>
                    {/* {dataAdded ? 
                        <div className='my-2'>
                            <p>Btn group configuration saved</p>
                        </div>
                        :null
                    } */}
                </div> : null
            }
        </div>
    )
}