import React, {useState, useEffect, useRef, Fragment} from 'react';
import styles from '../styles/Controller.module.css';
import BtnController from './BtnController';
import { Select, InputNumber, Button, Space } from 'antd';
import { DownOutlined, DeleteOutlined} from '@ant-design/icons';
// import {Button} from 'react-bootstrap';

const BTNNUM_MAX=50

export default function BtnGroupController(props) {
    const [groupType, setGroupType] = useState();
    const [btnType, setBtnType] = useState();
    const [btnNum, setBtnNum] = useState(0);
    const [children, setChildren] = useState([]);
    const [childrenData, setChildrenData] = useState([]);
    const prevBtnNumRef = useRef(0);
    const prevBtnTypeRef = useRef();

    console.log('btnGroupController render');

    const btnGroupOptions = [
        {value: 'shape', label: 'Shape'},
        {value: 'category', label: 'Category'},
    ]

    const btnOptions = {
        category: [
            {value: 'category', label: 'Category'}
        ],
        shape: [
            {value: 'keyPoint', label: 'Key Point'},
            {value: 'bbox', label: 'Bounding Box'},
            {value: 'polygon', label: 'Polygon'},
        ]
    }


    useEffect(() => {
        // to update callback's scope when childrenData changes
        // console.log('useEffect called');
        if (groupType && btnType) {
            renderChildren();
        }
      }, [childrenData]
    )


    function groupTypeChangeHandler(newValue) {
        // console.log(newValue);
        // console.log(btnOptions[newValue]);
        setGroupType(newValue);
        setBtnType(btnOptions[newValue][0]['value']);
    }

    function btnTypeChangeHandler(newValue, opt) {
        console.log(opt);
        setBtnType(newValue);
    }

    function numChangeHandler(newValue) {
        if (typeof newValue === 'number' 
        && Number.isInteger(newValue) 
        && newValue>=0 
        && newValue<=BTNNUM_MAX) {
            setBtnNum(newValue);
        }
    }

    function downBtnClickHandler() {
        if (groupType && btnType) {
            if (btnNum > prevBtnNumRef.current) {
                const newData = createChildrenData(prevBtnNumRef.current, btnNum);
                setChildrenData([...childrenData, ...newData]);
            } else if (btnNum < prevBtnNumRef.current) {
                const newData = [...childrenData].slice(0, btnNum);
                setChildrenData(newData);
            } else {
                if (btnType !== prevBtnTypeRef.current) {
                    const newData = createChildrenData(0, btnNum);
                    setChildrenData(newData);
                }
            }
            prevBtnNumRef.current = btnNum;
            prevBtnTypeRef.current = btnType;
        } else {
            setChildrenData([]);
        }
    }

    function createChildrenData(startIndex, endIndex) {
        const newData=[];
        for (let i = startIndex; i < endIndex; i++) {
            const data = {
                index: i,
                groupType: groupType,
                btnType: btnType,
            };
            newData.push(data);
        }
        return newData;
    }


    function renderChildren() {
        console.log('renderChildren called');
        let res = [];
        for (let i = 0; i < childrenData.length; i++) {
            res.push(
                <BtnController 
                    key={i}
                    index={i} 
                    // data={childrenData[i]}
                    groupType={childrenData[i].groupType}
                    btnType={childrenData[i].btnType}
                    color={childrenData[i].color}
                    label={childrenData[i].label}
                    typeSelectPlaceHolder='Btn type'
                    labelPlaceHolder="Label: e.g. 'mouse'"
                    disableTypeSelect
                    enableDelete
                    // onTypeChange={onChildTypeChange}
                    onLabelChange={onChildLabelChange}
                    onColorChange={onChildColorChange}
                    onDelete={onChildDelete}
                    />); 
        }
        setChildren(res);
    }


    function onDelete() {
        
    }

    
    function onChildLabelChange(target) {
        // console.log('parent ',target);
        const data = {...childrenData[target.index]};
        console.log('label', children[target.index]);
        data.label = target.value;
        // console.log(data);
        const dataArray = [...childrenData];
        dataArray[target.index] = data;
        setChildrenData(dataArray);
    } 

    function onChildColorChange(target) {
        const data = {...childrenData[target.index]};
        // console.log('color', childrenData);
        data.color = target.value;
        // console.log(data);
        const dataArray = [...childrenData];
        dataArray[target.index] = data;
        setChildrenData(dataArray);
    }

    function onChildDelete(target) {
        setBtnNum(btnNum-1);
        prevBtnNumRef.current = prevBtnNumRef.current>0 ? prevBtnNumRef.current-1 : 0;
        const newChildrenData = [...childrenData];
        newChildrenData.splice(target.index, 1);
        newChildrenData.forEach((item,i) => {item.index=i});
        setChildrenData(newChildrenData);
    }


    return (
        <div className='my-1'>
            <div className='my-2 d-inline-flex'>
                <Space.Compact block className='px-0'>
                    <Select className={styles.groupSelect}
                        // defaultValue={btnGroupOptions[0].value}
                        onChange={groupTypeChangeHandler}
                        options={btnGroupOptions}
                        placeholder='Group type'
                        />
                    <Select className={styles.btnSelect}
                        value={btnType}
                        onChange={btnTypeChangeHandler}
                        options={btnOptions[groupType]}
                        placeholder='Btn type'
                        />
                    <InputNumber className={styles.numInput}
                        // className={videoStyles.playFpsInput} 
                        min={0}
                        max={BTNNUM_MAX}
                        value={btnNum}
                        onChange={numChangeHandler}
                        // size="small"
                        />
                    
                </Space.Compact>
                <Button className={styles.generateBtn} 
                    // shape='circle'
                    type='text'
                    icon={<DownOutlined />}
                    onClick={downBtnClickHandler} 
                    // size='small'
                    />
                <Button className={styles.deleteBtn} 
                    // shape='circle'
                    type='text'
                    icon={<DeleteOutlined />} 
                    onClick={onDelete}
                    // size='small'
                    />
            </div>
            <div className='ms-3'>
                {children ?
                    <Space direction='vertical'>
                        {children}
                    </Space>
                    
                    : null
                }
            </div>
        </div>
    )
}