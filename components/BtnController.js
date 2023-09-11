import React, {useState, useEffect, useRef, Fragment} from 'react';
import styles from '../styles/Controller.module.css';
import { Select, Button, Input, ColorPicker } from 'antd';
import { DownOutlined, DeleteOutlined} from '@ant-design/icons';
// import {Button} from 'react-bootstrap';

export default function BtnController(props) {
    /*
        To an annotating btn.
        Props: 
            // key: integer. Required. To distinguish from other btnController
            groupType: 'category'/'shape'. Optional. When specified, the btnType list will be generated accordingly; otherwise, use general list.
            btnType: 'bbox'. Optional. When specified, the default value of the btnType select will be set.
            color: 'red'. Optional.
            typeSelectPlaceHolder: 'Btn type'
            labelPlaceHolder: 'mouse'
            disableTypeSelect: boolean. False by default, true when specified. Whether to disable type selcet.
            disableLabelInput: boolean. False by default, true when specified. Whether to disable label input.
            disableColorPicker: boolean. False by default, true when specified. Whether to disable color picker.
            disableDelete: boolean. False by default, true when specified. Whether to include the delete btn.
            onTypeChange: function
            onLabelChange: function
            onColorChange: function
            deleteBtnClickHander: function
    */

    const btnOptions = {
        category: [
            {value: 'category', label: 'Category'}
        ],
        shape: [
            {value: 'keyPoint', label: 'Key Point'},
            {value: 'bbox', label: 'Bounding Box'},
            {value: 'polygon', label: 'Polygon'},
        ],
        general: [
            {value: 'category', label: 'Category'},
            {value: 'keyPoint', label: 'Key Point'},
            {value: 'bbox', label: 'Bounding Box'},
            {value: 'polygon', label: 'Polygon'},
        ]
    }


    function labelChangeHandler(newValue) {
        console.log('label', newValue);
    }


    function colorChangeHandler(newValue) {
        console.log('color', newValue);
    }


    return (
        <div className='px-0'>
                <Select className={styles.btnSelect}
                    value={props.btnType}
                    onChange={props.onTypeChange}
                    options={props.groupType?btnOptions[props.groupType]:btnOptions.general}
                    placeholder={props.typeSelectPlaceHolder}
                    disabled={props.disableTypeSelect?props.disableTypeSelect:false}
                    />
                <Input className={styles.labelText}
                    addonBefore="Label"
                    onChange={props.onLabelChange}
                    placeholder={props.labelPlaceHolder}
                    disabled = {props.disableLabelInput?props.disableLabelInput:false}
                    />
                <ColorPicker className={styles.colorPicker}
                    // className={videoStyles.playFpsInput} 
                    value={props.color}
                    onChange={props.onColorChange}
                    disable = {props.disableColorPicker?props.disableColorPicker:false}
                    // size="small"
                    />
                {props.disableDelete ?
                    null : 
                    <Button className={styles.deleteBtn} 
                    // shape='circle'
                    type='text'
                    icon={<DeleteOutlined />} 
                    onClick={props.deleteBtnClickHander}
                    // size='small'
                    />
                }

            </div>
    )
}