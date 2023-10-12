import React, {useState, useEffect, useRef, Fragment} from 'react';
import styles from '../styles/Controller.module.css';
import BtnGroupController from './BtnGroupController';
import { Button, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import SkeletonEdgeController from './SkeletonEdgeController';
import { useStateSetters, useStates } from './AppContext';



const BTNGROUPNUM_MAX=50


export default function Design(props) {
    /**
     * Produce btnGroup data: 
        {
            {groupIndex1: { //The first three are used by <BtnGroup> not <Canvas>
                groupType: 'shape',
                btnType: 'bbox',
                btnNum: 2,
                childData: [ // used by both <BtnGroup> and <Canvas>
                    {index: 0, 
                    btnType: 'bbox',
                    label: 'fly',
                    color: '#FFFFFF'
                    },
                    {index: 1, ...},
                    ...
                ],
                (edgeData: [  //only for skeleton group
                    Set(),
                    ...
                ])
            }},
            {groupIndex2: ...},
            ...
        }
    
        props:
            // data: Required. The generated data, structure as above, will be append to it. 
            // setData: Required. The setter of data. Will be called in the Create btn click handler to append data.
            onAddBtnClick: When the Add btn is clicked, it will add a btnGroupController. Developer can also add extra function by defining this api. 
                It will be called after the prebuilt function.
            onCreateBtnClick: When the Create btn is clicked, it will append the btn data to the data property by calling setData. 
                Developer can also add extra function by defining this api. It will be called after the appending function.
                Takes the data as the argument.
     */
    // const [data, setData] = useState({}); //To prevent too many rerenders of parent comp. feel like it's not useful, as the btnGroupController can directly modify Workspace's btnConfigData, and Design can do that too.
    // const [children, setChildren] = useState([]);
    // const [skeletonData, setSkeletonData] = useState({});
    const [getData, setGetData] = useState(false);

    // get context
    const btnConfigData = useStates().btnConfigData;
    const setBtnConfigData = useStateSetters().setBtnConfigData;    

    // useEffect(() => {
    //     // initialize a group when comp mount
    //     if (Object.keys(data).length===0) {
    //         addGroup();
    //     }
    //   }, []
    // )
    useEffect(() => {
        // initialize a group when comp mount
        if (Object.keys(btnConfigData).length===0) {
            addGroup();
        }
      }, []
    )
    
    // useEffect(() => {
    //     renderChildren();
    //   }, [data]
    // )

    // function renderChildren() {
    //     const res = Object.keys(data).map(index => 
    //             <BtnGroupController
    //                 key={index}
    //                 index={index}
    //                 // data={data}
    //                 // setData={setData}
    //                 groupTypePlaceHolder='Group Type'
    //                 btnTypePlaceHolder='Btn type'
    //                 enableDelete
    //                 onDelete={onDelete}
    //                 // onGroupTypeChange={onGroupTypeChange}
    //                 // onBtnTypeChange={onBtnTypeChange}
    //                 // onBtnNumChange={onBtnNumChange}
    //                 // onDownBtnClick={onDownBtnClick}
    //                 // skeletonData={skeletonData}
    //                 // setSkeletonData={setSkeletonData}
    //                 />
    //         ); 
    //     setChildren(res);
    // }


    // function addGroup() {
    //     const index = Date.now().toString();
    //     setData({...data, [index]: {}});
    // }
    function addGroup() {
        const index = Date.now().toString();
        setBtnConfigData({...btnConfigData, [index]: {}});
    }


    function onAddBtnClick() {
        addGroup();

        if (props.onAddBtnClick) {
            props.onAddBtnClick();
        }
    }


    function onCreateBtnClick() {
        console.log(btnConfigData);
        // setBtnConfigData({...btnConfigData, ...data});
        setGetData(true);

        if (props.onCreateBtnClick) {
            props.onCreateBtnClick({...btnConfigData});
        }
    }

    function onDelete(target) {
        const dataCopy = {...btnConfigData};
        delete(dataCopy[target.index]);
        setBtnConfigData(dataCopy);
    }

    // function onGroupTypeChange(target) {
    //     console.log('groupType', target);
    // }

    // function onBtnTypeChange(target) {
    //     console.log('btnType', target);
    // }

    // function onBtnNumChange(target) {
    //     console.log('btnNum', target);
    // }

    // function onDownBtnClick(target) {
    //     console.log('downBtn', target);
    // }


    return (
        <div className={styles.designContainer}>
            <p className='my-2'>Customize Annotation Buttons</p>
            {/* <ConfigProvider configData={data} configDataSetter={setData}> */}
                <Space direction='vertical'>
                    {/* {children} */}
                    {Object.keys(btnConfigData).map(index => 
                        <BtnGroupController
                            key={index}
                            index={index}
                            // data={data}
                            // setData={setData}
                            groupTypePlaceHolder='Group Type'
                            btnTypePlaceHolder='Btn type'
                            enableDelete
                            onDelete={onDelete}
                            getData={getData}
                            disableDoneBtn
                            // onGroupTypeChange={onGroupTypeChange}
                            // onBtnTypeChange={onBtnTypeChange}
                            // onBtnNumChange={onBtnNumChange}
                            // onDownBtnClick={onDownBtnClick}
                            // skeletonData={skeletonData}
                            // setSkeletonData={setSkeletonData}
                            />
                    )}
                </Space>
            {/* </ConfigProvider> */}
            
            <br />
            {/* <Space>
                <SkeletonEdgeController 
                    vertices={edgesOptions}
                    data={skeletonData}
                    setData={setSkeletonData} 
                    index={'1'} />
            </Space> */}
            <br />
            <Space className='my-3 d-flex justify-content-center' wrap>
                {/* icon={<PlusOutlined />} */}
                <Button onClick={onAddBtnClick}>Add</Button>
                <Button type="primary" onClick={onCreateBtnClick}>Create</Button>
            </Space>
        </div>
    )
}