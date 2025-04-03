import React, {useState, useEffect, useRef} from 'react';
//import { useStateSetters, useStates } from './AppContext'; 
import JsonUploader from './JsonUploader';
import { Modal, Upload } from 'antd';
import { InboxOutlined } from '@ant-design/icons';



/**
 *  props:
 *      type: required, 'annotation' or 'configuration'
 *      open: boolean. Whether to open the modal window
 *      setModalOpen: setter of open.
 */
export default function AnnotationUploader(props) {
    const [info, setInfo] = useState('Click or drag file to this area to upload');
    const [uploader, setUploader] = useState();
    const { Dragger } = Upload;

    /*
    function cancelClickHandler() {
        props.setModalOpen(false);

        if (props.onCancel) {
            props.onCancel();
        }
    }
        */

    // From workspace.js line 250 --> use to figure out uploadFile()
    /*
    useEffect(() => {
        console.log("This was called");
        if (uploader?.type && uploader?.file) {
            saveAnnotationAndUpdateStates(true); 
            const reader = new FileReader();
            reader.onload = (e) => onReaderLoad(e, uploader.type);
            reader.readAsText(uploader.file.originFileObj);
        }
    
    }, [uploader])
    */

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
        console.log("Logging the file: ", file);
        const reader = new FileReader;

        reader.onload = (event) => {
            try {
                const jsonData = JSON.parse(event.target.result);
                console.log("Contents: ", jsonData);
                props.setNotes(jsonData);
            }
            catch(error){
                console.log("Problem with json contents");
            }

        }
        reader.readAsText(file.originFileObj);
    }
  
    
    return (
        <div className='my-4 d-flex justify-content-center'>
            <div style={{width: '100%'}}>
            <Dragger 
                id='jsonFile'
                name='jsonFile' 
                type='file' 
                accept=".json,application/json"
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
            </div>
    )
        
}
    

   