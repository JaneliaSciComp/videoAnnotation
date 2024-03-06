import React, {useState, useEffect} from 'react';
import { InboxOutlined } from '@ant-design/icons';
import { Button, message, Upload, Modal } from 'antd';
import styles from '../styles/Button.module.css';
import { useStates, useStateSetters } from './AppContext';


/**
 *  props:
 *      type: required, 'annotation' or 'configuration'
 *      onLoad: call back after the file is successfully loaded, with the file obj as argument. Will be called after natural behavior.
 *      //modalOpen: only useful when put inside a modal window. The "open" prop of the parent window. Used to close the parent modal window after uploading the file or click ok or cancel btn on the confirm window
 *      setModalOpen: only useful when put inside a modal window. setter of modalOpen.
 */
export default function JsonUploader(props) {
    
    const [info, setInfo] = useState('Click or drag file to this area to upload');

    const setUploader = useStateSetters().setUploader;
    const projectConfigDataRef = useStates().projectConfigDataRef;

    const { Dragger } = Upload;

    useEffect(() => {
        if (!props.type || (props.type !== 'annotation' && props.type !== 'configuration')) {
            throw Error('Type property is required, either annotation or configuration');
        }
    }, [])


    function changeHandler(e) {
        // console.log(e);
        // if (e.file.status !== 'uploading') {
        //   console.log(e.file, e.fileList);
        // }
        if (e.file.status === 'done') {
            uploadFile(e.file);
        } else if (e.file.status === 'error') {
            message.error(`${e.file.name} file upload failed.`);
            setInfo(`${e.file.name} file upload failed.`);
        }
    }

    // function onReaderLoad(e){
    //     // console.log(e.target.result);
    //     const obj = JSON.parse(e.target.result);
    //     console.log(obj);
    // }

    // function dropHandler(e) { //drop will trigger onChange, so this func is not necessary
    //     console.log('Dropped files', e.dataTransfer.files[0]);
    // }

    function uploadFile(file) {
        message.success(`${file.name} file uploaded successfully`);
        setInfo(`${file.name} file uploaded successfully`);
        if (projectConfigDataRef.current?.projectName || (projectConfigDataRef.current?.btnConfigData && Object.keys(projectConfigDataRef.current.btnConfigData).length>0)) { // The btnConfigData field is initialized as not null or undefined 
            Modal.confirm({
                title: 'Alert',
                content: 'The current project configuration data including annotation buttons will be removed!',
                onOk: ()=>confirmOkHandler(file),
                onCancel: confirmCancelHandler,
            });
        } else {
            if (props.setModalOpen) {
                props.setModalOpen(false);
            }
            setUploader({
                type: props.type,
                file: file
            });
        }

        if (props.onLoad) {
            props.onLoad(file);
        }
    }

    function confirmOkHandler(file) {
        if (props.setModalOpen) {
            props.setModalOpen(false);
        }
        
        setUploader({
            type: props.type,
            file: file
        });
    }

    function confirmCancelHandler() {
        if (props.setModalOpen) {
            props.setModalOpen(false);
        }
    }

    return (
        <div style={{width: '100%'}}>
            <Dragger 
                id='jsonFile'
                name='jsonFile' 
                type='file' 
                accept='json'
                showUploadList={false}
                onChange={changeHandler}
                // onDrop={dropHandler}
                >
                    <p className="ant-upload-drag-icon">
                        <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">{info}</p>
                    {/* <Button className='d-flex align-items-center' icon={<UploadOutlined />}>Upload {props.type}</Button> */}
            </Dragger>
        </div>
        
    )
}