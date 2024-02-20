import React, {useState, useEffect} from 'react';
import { InboxOutlined } from '@ant-design/icons';
import { Button, message, Upload, Modal } from 'antd';
import styles from '../styles/Button.module.css';
import { useStates, useStateSetters } from './AppContext';

//TODO: pass data to annotationRef and btnConfigData in Workspace

export default function JsonUploader(props) {
    /**
     *  props:
     *      type: required, 'annotation' or 'configuration'
     *      //askConfirm: boolean. Trigger modal confirm window.
     *      modalOpen: only useful when put inside a modal window. boolean. Whether to open the parent modal window
     *      setModalOpen: only useful when put inside a modal window. setter of modalOpen.
     */
    // const [info, setInfo] = useState();

    const setUploader = useStateSetters().setUploader;
    const projectConfigDataRef = useStates().projectConfigDataRef;

    const { Dragger } = Upload;

    useEffect(() => {
        if (!props.type || (props.type !== 'annotation' && props.type !== 'configuration')) {
            throw Error('Type property is required, either annotation or configuration');
        }
    }, [])

    // useEffect(() => {
    //     if (props.askConfirm && Object.keys(projectConfigDataRef.current).length) {
    //         Modal.confirm({
    //             title: 'Alert',
    //             content: 'The current project configuration data including annotation buttons will be removed!',
    //             onOk: confirmOkClickHandler,
    //             onCancel: cancelClickHandler,
    //         });
    //     }
        
    // }, [props.askConfirm])


    function changeHandler(e) {
        // console.log(e);
        // if (e.file.status !== 'uploading') {
        //   console.log(e.file, e.fileList);
        // }
        if (e.file.status === 'done') {
            uploadFile(e.file);
        } else if (e.file.status === 'error') {
            message.error(`${e.file.name} file upload failed.`);
            // setInfo(`${e.file.name} file upload failed.`);
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
        // setInfo(`${file.name} file uploaded successfully`);
        if (Object.keys(projectConfigDataRef.current).length>1) { // 1 is the btnConfigData field, it's initialized as not null or undefined 
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
        <div style={{width: '50%'}}>
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
                    <p className="ant-upload-text">Click or drag file to this area to upload</p>
                    {/* <Button className='d-flex align-items-center' icon={<UploadOutlined />}>Upload {props.type}</Button> */}
            </Dragger>
            {/* <p className="ant-upload-text">{info}</p> */}
        </div>
        
    )
}