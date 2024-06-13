import React, {useState, useEffect} from 'react';
import { InboxOutlined } from '@ant-design/icons';
import { Button, message, Upload, Modal } from 'antd';
import styles from '../styles/Button.module.css';
import { useStates, useStateSetters } from './AppContext';


/**
 *  props:
 *      type: required, 'annotation' or 'configuration'
 *      onLoad: called after the file is successfully loaded, with the file obj as argument. Will be called after inherent behavior.
 *      //modalOpen: only useful when put inside a modal window. The "open" prop of the parent window. Used to close the parent modal window after uploading the file or click ok or cancel btn on the confirm window
 *      setModalOpen: only useful when put inside a modal window. setter of modalOpen.
 */
export default function JsonUploader(props) {
    
    const [info, setInfo] = useState('Click or drag file to this area to upload');

    const setUploader = useStateSetters().setUploader;

    const { Dragger } = Upload;

    useEffect(() => {
        if (!props.type || (props.type !== 'annotation' && props.type !== 'configuration')) {
            throw Error('Type property is required, either annotation or configuration');
        }
    }, [])


    function changeHandler(e) {
        if (e.file.status === 'done') {
            uploadFile(e.file);
        } else if (e.file.status === 'error') {
            setInfo(`${e.file.name} file upload failed.`);
        }
    }



    function uploadFile(file) {
            if (props.setModalOpen) {
                props.setModalOpen(false);
            }
            setUploader({
                type: props.type,
                file: file
            });


        if (props.onLoad) {
            props.onLoad(file);
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
                beforeUpload={()=>{setInfo('Click or drag file to this area to upload')}}
                onChange={changeHandler}
                >
                    <p className="ant-upload-drag-icon">
                        <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">{info}</p>
                    {}
            </Dragger>
        </div>
        
    )
}