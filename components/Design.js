import React, {useState, useEffect, useRef, Fragment} from 'react';
import styles from '../styles/Controller.module.css';
import BtnGroupController from './BtnGroupController';
import { Button, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';


const BTNGROUPNUM_MAX=50


export default function Design(props) {
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
        const ids = Object.keys(data);
        const res = ids.map(id => 
                <BtnGroupController
                    id={id} 
                    key={id}
                    data={data}
                    setData={setData}
                    groupTypePlaceHolder='Group Type'
                    btnTypePlaceHolder='Btn type'
                    enableDelete
                    onDelete={onDelete}
                    onGroupTypeChange={onGroupTypeChange}
                    onBtnTypeChange={onBtnTypeChange}
                    onBtnNumChange={onBtnNumChange}
                    />
            ); 
        setChildren(res);
    }

    function addGroup() {
        const id = Date.now().toString();
        setData({...data, [id]: []});
    }

    function addBtnHandler() {
        addGroup();
    }

    function createBtnHandler() {
        console.log(data);
    }

    function onDelete(target) {
        const dataCopy = {...data};
        delete(dataCopy[target.id]);
        setData(dataCopy);
    }

    function onGroupTypeChange(target) {
        console.log('groupType', target);
    }

    function onBtnTypeChange(target) {
        console.log('btnType', target);
    }

    function onBtnNumChange(target) {
        console.log('btnNum', target);
    }

    return (
        <div className={styles.designContainer}>
            <p className='my-2'>Customize Annotation Buttons</p>
            <Space direction='vertical'>
                {/* <BtnGroupController 
                    data={data}
                    setData={setData}
                    groupTypePlaceHolder='Group Type'
                    btnTypePlaceHolder='Btn type'
                    enableDelete
                    onDelete={onDelete}
                    /> */}
                {children}
            </Space>
            <br />
            <Space className='my-3 d-flex justify-content-center' wrap>
                {/* icon={<PlusOutlined />} */}
                <Button onClick={addBtnHandler}>Add</Button>
                <Button type="primary" onClick={createBtnHandler}>Create</Button>
            </Space>
        </div>
    )
}