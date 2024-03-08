import React, {useState, useEffect, useRef, Fragment} from 'react';
import styles from '../styles/Controller.module.css';
import { Select, Button, Input, ColorPicker, Space } from 'antd';
import { DeleteOutlined} from '@ant-design/icons';
// import {Button} from 'react-bootstrap';
import {predefinedColors, btnTypeOptions, crowdSelectOptions} from '../utils/utils.js';


/** 
    To configure an annotating btn. 
    Produce btn data: 
        {index: 0,
            btnType: 'bbox',
            label: 'fly',
            color: '#FFFFFF',
            disableCrowdRadio: false, // only available when btnType='brush'
        },
    Props: 
        index: integer. Required when define the event listeners. To distinguish from other btnController
        // data: object. {key: int, groupType: str, btnType: str, label: str, color: str}
        groupType: 'category'/'shape'. Optional. When specified, the btnType list will be generated accordingly; otherwise, use general list.
        btnType: 'bbox'. Optional. //When specified, the default value of the btnType select will be set.
        color: 'red'. Optional.
        label: 'mouse'. Optional.
        typeSelectPlaceHolder: 'Btn type'
        labelPlaceHolder: 'mouse'
        disableTypeSelect: boolean. False by default, true when specified. Whether to disable type select.
        disableLabelInput: boolean. False by default, true when specified. Whether to disable label input.
        disableColorPicker: boolean. False by default, true when specified. Whether to disable color picker.
        enableDelete: boolean. False by default, true when specified. Whether to include the delete btn.
        onBtnTypeChange: Callback when btn type changes. Takes one argument: target {index: int, index property of this object, value: str, the value of this btnType select, label: str, the label of this btnType selcet}
        onLabelEnter: Callback when label input changes. Takes one argument: target {index: int, index property of this object, value: str, the value of this label input}
        onColorChange: Callback when colorPicker changes. Takes one argument: target {index: int, index property of this object, value: str, the value of this color picker}
        onDelete: Callback when delete btn clicked. Takes one argument: target {index: int, index property of this object}
        // Below props are only for crowd select. Crowd select only visible when btnType='brush', so these props only useful when btnType='brush'
        hasCrowdOption: 'yes' or 'no'. //When specified, the default value of the crowd select will be set. 
        disableCrowdSelect: boolean.  False by default, true when specified. Whether to disable crowd select.
*/
export default function BtnController(props) {
    
    // console.log('btnController render', props.index);


    function onBtnTypeChange(value, opt) {
        // console.log('BtnType', value, opt);
        // no need to use if (props.onLabelChange), because the developer has to use props to set up the callback
        const target = {
            index: props.index,
            value: value,
            label: opt.label
        };
        
        if (props.onBtnTypeChange) {
            props.onBtnTypeChange(target);
        } 
    }


    function onLabelChange(e) {
        // console.log('label', e);
        // no need to use if (props.onLabelChange), because the developer has to use props to set up the callback
        const target = {
            index: props.index,
            value: e.target.value,
        };

        if (props.onLabelChange) {
            props.onLabelChange(target);
        }
    }


    function onColorChange(value) {
        // console.log('color', value.metaColor.originalInput); //metaColor: {originalInput: '#000000A6', r: float, g:float, b:float, a:float, ...}
        const target = {
            index: props.index,
            value: value.metaColor.originalInput,
        };

        if (props.onColorChange) {
            props.onColorChange(target);
        }
    }

    
    function onCrowdChange(value, opt) {
        console.log('crowd', value, opt);
        // no need to use if (props.onLabelChange), because the developer has to use props to set up the callback
        const target = {
            index: props.index,
            value: value,
            // label: opt.label
        };
        
        if (props.onCrowdChange) {
            props.onCrowdChange(target);
        } 
    }

    function onDelete() {
        const target = {
            index: props.index,
        };

        if (props.onDelete) {
            props.onDelete(target);
        }
    }


    return (
        <div className='d-inline-flex'>
            <Space.Compact block className='px-0'>
                <Select className={styles.btnSelect}
                    value={props.btnType ? props.btnType : null}
                    onChange={onBtnTypeChange}
                    options={props.groupType?btnTypeOptions[props.groupType]:btnTypeOptions.general}
                    placeholder={props.typeSelectPlaceHolder}
                    disabled={props.disableTypeSelect}
                    size='small'
                    />
                <Input className={styles.labelText}
                    // addonBefore="Label"
                    allowClear
                    value={props.label ? props.label : null}
                    // onPressEnter={onLabelEnter}
                    onChange={onLabelChange}
                    placeholder={props.labelPlaceHolder}
                    disabled = {props.disableLabelInput}
                    size='small'
                    />
                {props.btnType==='brush' ?
                    <Select className={styles.crowdSelect}
                        value={props.hasCrowdOption}
                        onChange={onCrowdChange}
                        options={crowdSelectOptions}
                        placeholder='Crowd'
                        disabled={props.disableCrowdSelect}
                        size='small'
                        /> 
                    : null
                }
                
                <ColorPicker className={styles.colorPicker}
                    // className={videoStyles.playFpsInput} 
                    value={props.color ? props.color : '#1677FF'}
                    onChange={onColorChange}
                    disabled = {props.disableColorPicker}
                    size="small"
                    presets={[
                        { label: 'Recommended',
                          colors: predefinedColors,
                        },
                    ]}
                    />
            </Space.Compact>
            {props.enableDelete ?
                <Button className={styles.deleteBtn} 
                // shape='circle'
                tabIndex={-1}
                type='text'
                icon={<DeleteOutlined />} 
                onClick={onDelete}
                size='small'
                />
                :null
            }
        </div>
    )
}