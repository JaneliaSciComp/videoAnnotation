import React, {useState, useEffect, useRef, Fragment} from 'react';
import styles from '../styles/Controller.module.css';
import { Select, Button, Input, ColorPicker, Space } from 'antd';
import { DeleteOutlined} from '@ant-design/icons';
// import {Button} from 'react-bootstrap';

export default function BtnController(props) {
    /*
        To an annotating btn.
        Props: 
            index: integer. Required when has btnGroupController as parent. To distinguish from other btnController
            // data: object. {key: int, groupType: str, btnType: str, label: str, color: str}
            groupType: 'category'/'shape'. Optional. When specified, the btnType list will be generated accordingly; otherwise, use general list.
            btnType: 'bbox'. Optional. When specified, the default value of the btnType select will be set.
            color: 'red'. Optional.
            label: 'mouse'. Optional.
            typeSelectPlaceHolder: 'Btn type'
            labelPlaceHolder: 'mouse'
            disableTypeSelect: boolean. False by default, true when specified. Whether to disable type selcet.
            disableLabelInput: boolean. False by default, true when specified. Whether to disable label input.
            disableColorPicker: boolean. False by default, true when specified. Whether to disable color picker.
            enableDelete: boolean. False by default, true when specified. Whether to include the delete btn.
            onBtnTypeChange: Callback when btn type changes
            onLabelEnter: Callback when use press enter in label input
            onColorChange: Callback when colorPicker changes
            onDelete: Callback when delete btn clicked
    */
    console.log('btnController render', props.index);

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


    function onBtnTypeChange(value, opt) {
        console.log('BtnType', value, opt);
        // no need to use if (props.onLabelChange), because the developer has to use props to set up the callback
        const target = {
            index: props.index,
            value: value,
            label: opt.label
        };
        props.onBtnTypeChange(target);
    }


    function onLabelChange(e) {
        // console.log('label', e);
        // no need to use if (props.onLabelChange), because the developer has to use props to set up the callback
        const target = {
            index: props.index,
            value: e.target.value,
        };
        props.onLabelChange(target);
    }


    function onColorChange(value) {
        // console.log('color', value.metaColor.originalInput); //metaColor: {originalInput: '#000000A6', r: float, g:float, b:float, a:float, ...}
        const target = {
            index: props.index,
            value: value.metaColor.originalInput,
        };
        props.onColorChange(target);
    }


    function onDelete() {
        const target = {
            index: props.index,
        };
        props.onDelete(target);
    }


    return (
        <div className='d-inline-flex'>
            <Space.Compact block className='px-0'>
                <Select className={styles.btnSelect}
                    value={props.btnType}
                    onChange={onBtnTypeChange}
                    options={props.groupType?btnOptions[props.groupType]:btnOptions.general}
                    placeholder={props.typeSelectPlaceHolder}
                    disabled={props.disableTypeSelect?props.disableTypeSelect:false}
                    />
                <Input className={styles.labelText}
                    // addonBefore="Label"
                    allowClear
                    value={props.label}
                    // onPressEnter={onLabelEnter}
                    onChange={onLabelChange}
                    placeholder={props.labelPlaceHolder}
                    disabled = {props.disableLabelInput?props.disableLabelInput:false}
                    />
                <ColorPicker className={styles.colorPicker}
                    // className={videoStyles.playFpsInput} 
                    value={props.color}
                    onChange={onColorChange}
                    disable = {props.disableColorPicker?props.disableColorPicker:false}
                    // size="small"
                    presets={[
                        { label: 'Recommended',
                          colors: [
                            '#000000',
                            '#000000E0',
                            '#000000A6',
                            '#00000073',
                            '#00000040',
                            '#00000026',
                            '#0000001A',
                            '#00000012',
                            '#0000000A',
                            '#00000005',
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
                            '#F5222D4D',
                            '#FA8C164D',
                            '#FADB144D',
                            '#8BBB114D',
                            '#52C41A4D',
                            '#13A8A84D',
                            '#1677FF4D',
                            '#2F54EB4D',
                            '#722ED14D',
                            '#EB2F964D',
                          ],
                        },
                    ]}
                    />
            </Space.Compact>
            {props.enableDelete ?
                <Button className={styles.deleteBtn} 
                // shape='circle'
                type='text'
                icon={<DeleteOutlined />} 
                onClick={onDelete}
                // size='small'
                />
                :null
            }
        </div>
    )
}