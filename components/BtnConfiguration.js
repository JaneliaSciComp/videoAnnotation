import React, {useState, useEffect, useRef, Fragment} from 'react';
import styles from '../styles/Controller.module.css';
import BtnGroupController from './BtnGroupController';
import { Button, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import SkeletonEdgeController from './SkeletonEdgeController';
import { useStateSetters, useStates } from './AppContext';
import { deleteBtnGroup } from '../utils/requests';
import { createId } from '../utils/utils';

const BTNGROUPNUM_MAX=50


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
                [...],
                [...],
            ])
        }},
        {groupIndex2: ...},
        ...
    }

    props:
        // data: Required. The generated data, structure as above, will be append to it. 
        // setData: Required. The setter of data. Will be called in the Create btn click handler to append data.
        defaultGroupType: 'category'/'shape'/'skeleton'. Optional. When specified, all of the btnGroupController will have groupType set, and the btnType dropdown will be generated accordingly; otherwise, use general list.
        groupType: set groupType for each child btnGroupController
        defaultBtnType: set defaultGroupType for each child btnGroupController
        btnType: set btnType for each child btnGroupController
        defaultBtnNum: set defaultBtnNum for each child btnGroupController
        btnNum: set btnNum for each child btnGroupController
        disableGroupTypeSelect: disable child btnGroupController's groupTypeSelect
        disableBtnTypeSelect: disable child btnGroupController's btnTypeSelect
        disableBtnNumInput: disable child btnGroupController's btnNumInput
        onAddBtnClick: When the Add btn is clicked, it will add a btnGroupController. Developer can also add extra function by defining this api. 
            It will be called after the prebuilt function.
        onCreateBtnClick: When the Create btn is clicked, it will signal the child BtnGroupControllers to pass data to btnConfigData, then Workspace will create btns. 
            Developer can also add extra function by defining this api. It will be called after the appending function.
            Takes the data as the argument.
        hideCreateBtn: boolean. Useful when BtnConfiguration is nested in ProjectManager.
        status: 'new' / 'edit' / null. Required when btnConfiguration is used either solely (needs to have parent comp to update its value) or inside ProjectManager.
            If 'new', show empty window; if 'edit', load btnConfigData; null is just to enable change of status, otherwise if open it twice as 'new', useEffect won't be triggered.
        hidePlusBtn: whether to hide the + btn of adding btn group
        // reload: boolean. The parent use this to signal btnConfiguration to display BtnConfigData. Useful when BtnConfiguration is nested in ProjectManager.
        // setReload: setter of reload.
*/
export default function BtnConfiguration(props) {
    
    const [getData, setGetData] = useState({});
    const [info, setInfo] = useState();

    const btnConfigData = useStates().btnConfigData;
    const setBtnConfigData = useStateSetters().setBtnConfigData;    
    const confirmConfig = useStates().confirmConfig;
    const setConfirmConfig = useStateSetters().setConfirmConfig;

    
    useEffect(() => {
        setInfo(null);
        if (props.status === 'new') {
            setBtnConfigData({});
            addGroup('new');            
        } else if (props.status === 'edit') {
            if (Object.keys(btnConfigData).length > 0) {
                const newGetData = {};
                Object.keys(btnConfigData).forEach(index => newGetData[index]=false);
                setGetData(newGetData);
            }
        }
      }, [props.status]
    )

    useEffect(() => {
        if (confirmConfig) {
            onCreateBtnClick();
            setConfirmConfig(false);
        }
    }, [confirmConfig])
    

    function addGroup(useCase) {
        const index = createId();
        if (useCase === 'new') {
            setGetData({[index]:false});
        } else if (useCase === 'add') {
            setGetData({...getData, [index]:false});
        }
    }


    function onPlusBtnClick() {
        if (props.status) {
            addGroup('add');
        } 

        if (props.onPlusBtnClick) {
            props.onPlusBtnClick();
        }
    }


    async function onCreateBtnClick() {            
        await Promise.all(Object.keys(btnConfigData).map(async (btnGroupId) => {
            if (!getData.hasOwnProperty(btnGroupId)) {
                const res = await deleteBtnGroup(btnGroupId);
                if (res['error']) {
                    setInfo(res['error']);
                } else {
                    setInfo(null);
                    setBtnConfigData(data=>{
                        const dataCopy = {...data};
                        delete(dataCopy[btnGroupId]);
                        return dataCopy;
                    }); 
                }
            }
        }))
        
        const newGetData = {};
        for (let i in getData) {
            newGetData[i] = true;
        }
        setGetData(newGetData);
        props.setStatus(null);

        if (props.onCreateBtnClick) {
            props.onCreateBtnClick();
        }
    }

    function onDelete(target) {
        const getDataCopy = {...getData};
        delete(getDataCopy[target.index]);
        setGetData(getDataCopy);
    }


    return (
        <div className={styles.btnConfigContainer} 
                >
            <Space className='my-2 d-flex justify-content-left' wrap>
                <p className='my-2'>Customize Annotation Buttons</p>
                {(!props.hidePlusBtn) ?
                    <Button 
                        onClick={onPlusBtnClick} 
                        size='small' 
                        icon={<PlusOutlined />} 
                        >
                        {}
                    </Button>
                    :null
                }
            </Space>
            
            <Space direction='vertical'>
                {Object.keys(getData).map(index => 
                    (!btnConfigData.hasOwnProperty(index)) ? 
                        <BtnGroupController
                            key={index}
                            index={index}
                            groupTypePlaceHolder='Group Type'
                            btnTypePlaceHolder='Btn Type'
                            defaultGroupType={props.defaultGroupType}
                            groupType={props.groupType}
                            defaultBtnType={props.defualtBtnType}
                            btnType={props.btnType}
                            defaultBtnNum={props.defaultBtnNum}
                            btnNum={props.btnNum}
                            disableGroupTypeSelect={props.disableGroupTypeSelect}
                            disableBtnTypeSelect={props.disableBtnTypeSelect}
                            disableBtnNumInput={props.disableBtnNumInput}
                            enableDelete
                            onDelete={onDelete}
                            getData={getData}
                            setGetData={setGetData}
                            disableDoneBtn
                            status='new'
                            />
                        :
                        <BtnGroupController
                            key={index}
                            index={index}
                            groupType={btnConfigData[index].groupType}
                            btnType={btnConfigData[index].btnType}
                            btnNum={btnConfigData[index].btnNum}
                            disableGroupTypeSelect={props.disableGroupTypeSelect}
                            disableBtnTypeSelect={props.disableBtnTypeSelect}
                            disableBtnNumInput={props.disableBtnNumInput}
                            enableDelete
                            onDelete={onDelete}
                            getData={getData}
                            setGetData={setGetData}
                            disableDoneBtn
                            status='edit'
                            />
                    )
                }
            </Space>
            
            <br />
            {/* <Space>
                <SkeletonEdgeController 
                    vertices={edgesOptions}
                    data={skeletonData}
                    setData={setSkeletonData} 
                    index={'1'} />
            </Space> */}
            <br />
            {(props.hideCreateBtn || props.hidePlusBtn) ? null : 
                <Space className='my-3 d-flex justify-content-center' wrap>
                    {}
                    {}
                    <Button type="primary" onClick={onCreateBtnClick}>Create</Button>
                </Space>
            }
            <p>{info}</p>
        </div>
    )
}