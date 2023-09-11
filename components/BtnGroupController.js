import React, {useState, useEffect, useRef, Fragment} from 'react';
import styles from '../styles/Controller.module.css';
import BtnController from './BtnController';
import { Select, InputNumber, Button } from 'antd';
import { DownOutlined, DeleteOutlined} from '@ant-design/icons';
// import {Button} from 'react-bootstrap';

const BTNNUM_MAX=50

export default function BtnGroupController(props) {
    const [groupType, setGroupType] = useState();
    const [btnType, setBtnType] = useState();
    const [btnNum, setBtnNum] = useState(1);
    const [children, setChildren] = useState();

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


    function groupTypechangeHandler(newValue) {
        // console.log(newValue);
        // console.log(btnOptions[newValue]);
        setGroupType(newValue);
        setBtnType(btnOptions[newValue][0]['value']);
    }

    function btnTypeChangeHandler(newValue) {
        setBtnType(newValue);
    }

    function numChangeHandler(newValue) {
        if (typeof newValue === 'number' 
        && Number.isInteger(newValue) 
        && newValue>=1 
        && newValue<=BTNNUM_MAX) {
            setBtnNum(newValue);
        }
    }

    function generateBtnClickHandler() {
        if (groupType && btnType && btnNum) {
            const res = renderChildren();
            setChildren(res);
        } 
    }

    function deleteBtnClickHandler() {

    }


    function renderChildren() {
        let res = [];
        for (let i = 0; i < props.btnNum; i++) {
            res.push(
                <BtnController 
                    key={i} 
                    groupType={groupType}
                    btnType={btnType}
                    typeSelectPlaceHolder='Btn type'
                    labelPlaceHolder='mouse'
                    disableTypeSelect
                    // onLabelChange={} 
                    // onColorChange={} 
                    // deleteBtnClickHander={}
                    />); 
        }
        return res;
    }


    return (
        <Fragment>
            <div className='px-0'>
                <Select className={styles.groupSelect}
                    // defaultValue={btnGroupOptions[0].value}
                    onChange={groupTypechangeHandler}
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
                    min={1}
                    max={BTNNUM_MAX}
                    value={btnNum}
                    onChange={numChangeHandler}
                    // size="small"
                    />
                <Button className={styles.generateBtn} 
                    // shape='circle'
                    type='text'
                    icon={<DownOutlined />}
                    onClick={generateBtnClickHandler} 
                    // size='small'
                    />
                <Button className={styles.deleteBtn} 
                    // shape='circle'
                    type='text'
                    icon={<DeleteOutlined />} 
                    onClick={deleteBtnClickHandler}
                    // size='small'
                    />
            </div>
            {children ?
                <div>
                    {children}
                </div>
                :null
            }
            
        </Fragment>
    )
}