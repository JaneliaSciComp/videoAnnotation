import React, {useState, useEffect, useRef, Fragment} from 'react';
import styles from '../styles/Controller.module.css';
import BtnGroupController from './BtnGroupController';
import { Button, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';


const BTNGROUPNUM_MAX=50


export default function Design(props) {
    /**
     * Produce btnGroup data: 
        {
            {groupIndex1: [
                {index: 0, 
                 btnType: 'bbox',
                 label: 'fly',
                 color: '#FFFFFF'
                },
                {index: 1, ...},
                ...
            ]}
            {groupIndex2: ...},
            ...
        }
    
        props:
            data: Required. The generated data, structure as above, will be append to it. 
            setData: Required. The setter of data. Will be called in the Create btn click handler to append data.
            onAddBtnClick: When the Add btn is clicked, it will add a btnGroupController. Developer can also add extra function by defining this api. 
                It will be called after the prebuilt function.
            onCreateBtnClick: When the Create btn is clicked, it will append the btn data to the data property by calling setData. 
                Developer can also add extra function by defining this api. It will be called after the appending function.
                Takes the data as the argument.
     */
    const [data, setData] = useState({});
    const [children, setChildren] = useState([]);

    useEffect(() => {
        // initialize a group when comp mount
        if (Object.keys(data).length==0) {
            addGroup();
        }
      }, []
    )
    
    useEffect(() => {
        renderChildren();
      }, [data]
    )

    function renderChildren() {
        const indices = Object.keys(data);
        const res = indices.map(index => 
                <BtnGroupController
                    key={index}
                    index={index}
                    data={data}
                    setData={setData}
                    groupTypePlaceHolder='Group Type'
                    btnTypePlaceHolder='Btn type'
                    enableDelete
                    onDelete={onDelete}
                    // onGroupTypeChange={onGroupTypeChange}
                    // onBtnTypeChange={onBtnTypeChange}
                    // onBtnNumChange={onBtnNumChange}
                    // onDownBtnClick={onDownBtnClick}
                    />
            ); 
        setChildren(res);
    }

    function addGroup() {
        const index = Date.now().toString();
        setData({...data, [index]: []});
    }

    function onAddBtnClick() {
        addGroup();

        if (props.onAddBtnClick) {
            props.onAddBtnClick();
        }
    }

    function onCreateBtnClick() {
        console.log(data);
        if (!props.data || !props.setData) {
            throw SyntaxError('Property Data and setData are required');
        }
        props.setData({...props.data, ...data});
        
        if (props.onCreateBtnClick) {
            props.onCreateBtnClick({...data});
        }
    }

    function onDelete(target) {
        const dataCopy = {...data};
        delete(dataCopy[target.index]);
        setData(dataCopy);
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
            <Space direction='vertical'>
                {children}
            </Space>
            <br />
            <Space className='my-3 d-flex justify-content-center' wrap>
                {/* icon={<PlusOutlined />} */}
                <Button onClick={onAddBtnClick}>Add</Button>
                <Button type="primary" onClick={onCreateBtnClick}>Create</Button>
            </Space>
        </div>
    )
}