import React, {useState, useEffect} from 'react';
import { UploadOutlined } from '@ant-design/icons';
import { Button, message, Upload } from 'antd';
import styles from '../styles/Button.module.css';
import { useStates, useStateSetters } from './AppContext';

//TODO: pass data to annotationRef and btnConfigData in Workspace

export default function JsonUploader(props) {
    /**
     *  props:
     *      type: required, 'annotation' or 'configuration'
     */

    const setUploader = useStateSetters().setUploader;

    useEffect(() => {
        if (!props.type || (props.type !== 'annotation' && props.type !== 'configuration')) {
            throw Error('Type property is required, either annotation or configuration');
        }
    }, [])


    function changeHandler(e) {
        console.log(e);
        // if (e.file.status !== 'uploading') {
        //   console.log(e.file, e.fileList);
        // }
        if (e.file.status === 'done') {
            message.success(`${e.file.name} file uploaded successfully`);
            setUploader({
                type: props.type,
                file: e.file
            });
            // const reader = new FileReader();
            // reader.onload = onReaderLoad;
            // reader.readAsText(e.file.originFileObj);
        } else if (e.file.status === 'error') {
            message.error(`${e.file.name} file upload failed.`);
        }
    }

    // function onReaderLoad(e){
    //     // console.log(e.target.result);
    //     const obj = JSON.parse(e.target.result);
    //     console.log(obj);
    // }

    return (
        <Upload 
          id='annoFile'
          name='annoFile' 
          type='file' 
          accept='json'
          onChange={changeHandler}>
            <Button icon={<UploadOutlined />}>Upload {props.type}</Button>
        </Upload>
    )
}