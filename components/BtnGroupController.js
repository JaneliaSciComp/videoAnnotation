import React, { useState, useEffect, useRef } from 'react';
import styles from '../styles/Controller.module.css';
import BtnController from './BtnController';
import SkeletonEdgeController from './SkeletonEdgeController';
import { Select, Input, InputNumber, Button, Space } from 'antd';
import { DownOutlined, DeleteOutlined} from '@ant-design/icons';
import { useStateSetters, useStates } from './AppContext';
import { btnGroupTypeOptions, btnTypeOptions, createId } from '../utils/utils';
import { postBtnGroup } from '../utils/requests';

const BTNNUM_MAX=50


/**
    To configure a annotating btn group.
    Produce btnGroup data: 
        {groupId: {
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
        // maxBtnNum: integer. Optional
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
        
        // below props are treated differently when placing this comp in BtnConfiguration comp or not
        enableDelete: True when specified. Whether to make the delete btn visible. Should not be specified when using this comp independently
        onDelete: Callback when delete btn clicked. Takes one argument: target {index: int}
        getData: boolean. monitored by useEffect. When change to true, pass interval btn group data to parent's(Design) config data context. Changed by Create btn in Design. Useless when Done btn is enabled.
        setGetData: setter of getData
        disableDoneBtn: make Done btn invisible when use this comp in BtnConfiguration comp
        onDoneBtnClick: When the Done btn is clicked, it will pass data into parent's configData. Developer can also add extra function by defining this api. 
            It will be called after the prebuilt function.
        // skeletonData: to pass to child SkeletonEdgeController to hold generated edge data if user choose 'skeleton'
        // setSkeletonData: skeletonData setter. To pass to child SkeletonEdgeController
        
        // below props are only for groupType='brush'
        // includeBrushTool: boolean. False by default, true when speicified. When true, include an extra brushToolController to configure BrushTool comp. When false, no BrushTool comp will be generated.
*/
export default function BtnGroupController(props) {
    
    const [groupData, setGroupData] = useState([]);
    const [index, setIndex] = useState();
    const [groupType, setGroupType] = useState();
    const [btnType, setBtnType] = useState();
    const [btnNum, setBtnNum] = useState(0);
    const [error, setError] = useState();
    const [children, setChildren] = useState([]);
    const prevBtnNumRef = useRef(0);
    const prevBtnTypeRef = useRef();
    const [addEdge, setAddEdge] = useState(false);
    const [disableEdgeBtn, setDisableEdgeBtn] = useState(true);
    const [dataAdded, setDataAdded] = useState(false);
    const [skeletonName, setSkeletonName] = useState();
    const [edgeData, setEdgeData] = useState();

    const btnConfigData = useStates().btnConfigData;
    const setBtnConfigData = useStateSetters().setBtnConfigData;
    const projectId = useStates().projectId;
    const setGlobalInfo = useStateSetters().setGlobalInfo;

    
    useEffect(()=>{
        if (!props.index) {
            if (props.status === 'new') {
                setIndex(createId());
            } else if (props.status === 'edit') {
                throw Error('Property index is required when status is edit');
            }
        }

        if (props.defaultGroupType) {
            setGroupType(() => props.defaultGroupType);
        }
        if (props.defaultBtnType) {
            setBtnType(() => props.defaultBtnType);
        }
        if (props.defaultBtnNum) {
            setBtnNum(() => props.defaultBtnNum);
        }

        if (props.groupType) {
            setGroupType(() => props.groupType);
        }
        if (props.btnType) {
            setBtnType(() => props.btnType);
        }
        if (props.btnNum) {
            setBtnNum(() => props.btnNum);
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
        const myIndex = getSelfIndex();
        if (myIndex && props.getData && props.getData[myIndex]) { 
            addDataToBtnConfigData();
            props.setGetData(collection => {
                const colCopy = {...collection};
                colCopy[myIndex] = false;
                return colCopy;
            });
        }
      }, [props.getData]
    )




    useEffect(() => {
        if ((skeletonName || groupData) && getSelfIndex()) {
            renderChildren();
        } 

      }, [groupData, disableEdgeBtn, skeletonName]
    )

    useEffect(() => {
        if (error) {
            setError(null);
        }
        if (dataAdded) {
            setDataAdded(false);
        }
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

    useEffect(()=>{
        if (props.defaultGroupType && btnTypeOptions[props.defaultGroupType]) {
            setBtnType(btnTypeOptions[props.defaultGroupType][0]['value']);
        }
        
    }, [props.defaultGroupType])

    function onGroupTypeChange(newValue, opt) {
        setGroupType(newValue);
        setBtnType(btnTypeOptions[newValue][0]['value']);

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
                data = createChildrenData(0, btnNum);
            } else {
                if (btnNum > prevBtnNumRef.current) {
                    const newData = createChildrenData(prevBtnNumRef.current, btnNum);
                    data = [...childrenData, ...newData];
                } else if (btnNum < prevBtnNumRef.current) {
                    data = [...childrenData].slice(0, btnNum);
                } else {
                    data = childrenData;
                }
            }
        } 
        
        prevBtnNumRef.current = btnNum;
        prevBtnTypeRef.current = btnType;

        setGroupData(data);

        if (props.onDownBtnClick) {
            const target = {
                index: getSelfIndex(),
                groupType: groupType,
                btnType: btnType,
                btnNum: btnNum,
                skeletonName: skeletonName,
            };
            props.onDownBtnClick(target);
        }        
    }

    function getData() {
        let data = groupData;
        if (!data) {
            data=[]
        }
        return groupData;
    }

    function getSelfIndex() {
        return props.index ? props.index : index; 
    }

    function createChildrenData(startIndex, endIndex) {
        const newData=[];
        for (let i = startIndex; i < endIndex; i++) {
            const data = {
                index: i,
                btnType: btnType,
                label: '',
                color: '#1677FF',
            };
            newData.push(data);
        }
        return newData;
    }


    function renderChildren() {
        const childrenData = getData();
        let res = [];

        if (childrenData[0]?.btnType === 'skeleton') {
            res.push(
                <Input key={childrenData.length+1} className={styles.labelText}
                    allowClear
                    placeholder="Label: e.g. 'mouse'"
                    value={skeletonName}
                    onChange={onSkeletonNameChange}
                    size='small'
                    />
            );
        }

        for (let i = 0; i < childrenData.length; i++) {
            res.push(
                <BtnController 
                    key={i}
                    index={i} 
                    btnType={childrenData[i].btnType}
                    color={childrenData[i].color}
                    label={childrenData[i].label}
                    typeSelectPlaceHolder='Btn type'
                    labelPlaceHolder={childrenData[i].btnType === 'skeleton' ? "Landmark: 'head'" : (childrenData[i].btnType === 'category' ? 'Label: chase' : 'Label: mouse')}
                    hasCrowdOption={childrenData[i].omitCrowdRadio ? 'no' : 'yes'}
                    disableTypeSelect
                    enableDelete
                    onLabelChange={onChildLabelChange}
                    onColorChange={onChildColorChange}
                    onCrowdChange={onChildCrowdChange}
                    onDelete={onChildDelete}
                    />); 
        }
        if (childrenData[0] && childrenData[0].btnType === 'skeleton') {
            res.push(
                <Button 
                    key={childrenData.length} 
                    onClick={onAddEdgeBtnClick} 
                    disabled={disableEdgeBtn}
                    size='small'
                    >
                    Add Edge
                </Button>
            
                    );
        }

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
        const childrenData = getData();
        const data = {...childrenData[target.index]};
        data.label = target.value;
        
        const childrenDataCopy = [...childrenData];
        childrenDataCopy[target.index] = data;
        setGroupData(childrenDataCopy);
    } 

    function onChildColorChange(target) {
        const childrenData = getData();
        const data = {...childrenData[target.index]};
        data.color = target.value;
        const childrenDataCopy = [...childrenData];
        childrenDataCopy[target.index] = data;
        setGroupData(childrenDataCopy);
    }

    function onChildCrowdChange(target) {
        const childrenData = getData();
        const data = {...childrenData[target.index]};
        data.omitCrowdRadio = target.value==='yes'?false : true;
        const childrenDataCopy = [...childrenData];
        childrenDataCopy[target.index] = data;
        setGroupData(childrenDataCopy);
    }

    function onChildDelete(target) {
        setBtnNum(btnNum-1);
        prevBtnNumRef.current = prevBtnNumRef.current>0 ? prevBtnNumRef.current-1 : 0;
        const newChildrenData = [...getData().filter(item=>item.index!==target.index)];
        newChildrenData.forEach((item,i) => {item.index=i});
        setGroupData(newChildrenData);
    }

    function onAddEdgeBtnClick() {
        setAddEdge(true);
    }

    function checkLabels() {
        const childData = getData();
        let childWithLabel = 0;
            for (const child of childData) {
                if (typeof child.label === 'string' && child.label!=='') {
                    childWithLabel++;
                }
            }
        if (childWithLabel===childData.length) {
            return true;
        } else {
            return false;
        }
    }

    function generateSkeletonVerticesData() {
        return getData().map(item => item.label);
    }

    function onDoneBtnClick() {
        addDataToBtnConfigData();
        setDataAdded(true);

        const target= {
            groupType: groupType,
            btnType: btnType,
            btnNum: btnNum,
            childData: [...groupData],
            skeletonName: skeletonName,
        };
        
        if (props.onDoneBtnClick) {
            props.onDoneBtnClick(target);
        }
    }

    function onSkeletonNameChange(e) {
        setSkeletonName(e.target.value);

    } 


    async function addDataToBtnConfigData() {
        const index = getSelfIndex();
        const labelsValid = checkLabels(); 
        
        if (labelsValid && groupData?.length) {
            const newData = {
                groupType: groupType,
                btnType: btnType,
                btnNum: btnNum,
                childData: [...groupData],
                projectId: projectId
            };
            if (edgeData) {
                newData.edgeData = {...edgeData};
            }
            if (groupType === 'skeleton') {
                newData.skeletonName = skeletonName ? skeletonName : 'skeleton';
            }

            const btnGroupObj = {...newData};
            btnGroupObj.btnGroupId = index;
            const res = await postBtnGroup(btnGroupObj)
            if (res['error']) {
                setGlobalInfo(res['error']);
                return
            }
            setGlobalInfo(null);
            setBtnConfigData(data => {
                const dataCopy = {...data}
                dataCopy[index] = newData
                return dataCopy
            } );
        } else {
            setError('Labels should not be empty!');
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
                        defaultValue={props.defualtBtnNum}
                        value={btnNum}
                        onChange={onBtnNumChange}
                        size="small"
                        disabled={props.disableBtnNumInput}
                        />
                </Space.Compact>

                    <Button className={styles.generateBtn} 
                        tabIndex={-1}
                        type='text'
                        icon={<DownOutlined />}
                        onClick={onDownBtnClick} 
                        size='small'
                        />
                    {/* :null
                } */}
                {props.enableDelete ?
                    <Button className={styles.deleteBtn} 
                        tabIndex={-1}
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
                        status={props.status}
                        setEdgeData={setEdgeData}
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