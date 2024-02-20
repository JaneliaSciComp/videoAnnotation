import React, {useState, useEffect, useRef} from 'react';
import { useStateSetters, useStates } from './AppContext'; 
import { Dropdown, Button, Modal } from 'antd';
import ProjectManager from '../components/ProjectManager.js';
import ModalJsonUploader from './ModalJsonUploader.js';



export default function ProjectDropdown(props) {
    /**
     *  props:
     *      //serverType: 'local' / 'remote'
     *      //uploaderOkClickHandler: will be called after natural behavior of uploading and updating projectConfigData.
     *      //uploaderCancelClickHandler: will be called after natural behavior of closing the uploader modal window
     *      onProjectNameChange: will be called after natural onProjectNameChange behavior in ProjectManager
     *      onDescriptionChange: will be called after natural onDescriptionChange behavior in ProjectManager
     */

    const [managerOpen, setManagerOpen] = useState(false);
    const [managerStatus, setManagerStatus] = useState(); //'new' / 'edit'
    const [uploaderOpen, setUploaderOpen] = useState(false);

    const projectConfigDataRef = useStates().projectConfigDataRef;
    const setBtnConfigData = useStateSetters().setBtnConfigData;
    const setSaveConfig = useStateSetters().setSaveConfig;

    const items = [
        {
          label: 'New',
          key: '0',
        },
        {
          label: 'Open',
          key: '1',
        },
        {
          label: 'Edit',
          key: '2',
        },
        {
          label: 'Save',
          key: '3',
        },
    ];

    function onClick(e) {
        const label = items[e.key].label;
        switch (label) {
            case 'New':
                if (projectConfigDataRef.current?.projectName || (projectConfigDataRef.current?.btnConfigData && Object.keys(projectConfigDataRef.current.btnConfigData).length>0)) { // The btnConfigData field is initialized as not null or undefined 
                    confirm();
                } else {
                    setManagerStatus('new');
                    setManagerOpen(true);
                }
                break;
            case 'Open':
                setUploaderOpen(true);
                break;
            case 'Edit':
                setManagerStatus('edit');
                setManagerOpen(true);
                break;
            case 'Save':
                if (projectConfigDataRef.current?.projectName || (projectConfigDataRef.current?.btnConfigData && Object.keys(projectConfigDataRef.current.btnConfigData).length>0)) {
                    setSaveConfig(true);
                }
                break;
        }
    }

    function confirmOkClickHandler() {
        projectConfigDataRef.current = {};
        // setBtnConfigData({}); // put in BtnConfiguration, to make sure first emtpy btnConfigData, then create new btnGroup
        setManagerStatus('new');
        setManagerOpen(true);
    }

    function cancelClickHandler() {
        setManagerOpen(false);
        setUploaderOpen(false);
    }

    function confirm() {
        Modal.confirm({
            title: 'Alert',
            content: 'The current project configuration data including annotation buttons will be removed!',
            onOk: confirmOkClickHandler,
            onCancel: cancelClickHandler,
        });
    }

    // function uploaderOkClickHandler() {
    //     confirm('open');
    // }

    // function uploaderCancelClickHandler() {
    //     setUploaderOpen(false);

    //     if (props.uploaderCancelClickHandler) {
    //         props.uploaderCancelClickHandler();
    //     }
    // }

    return (
        <>
            <Dropdown
                menu={{
                    items,
                    onClick,
                }}
                trigger={['click']}
                >
                <a style={{width: '6em', textDecoration: 'none', cursor: 'pointer'}} onClick={(e) => e.preventDefault()}>
                    Project
                </a>
            </Dropdown>

            <ProjectManager
                // serverType={props.serverType} 
                status={managerStatus} 
                open={managerOpen} 
                setOpen={setManagerOpen} 
                // onProjectNameChange={props.onProjectNameChange}
                // onDescriptionChange={props.onDescriptionChange}
                />
            
            <ModalJsonUploader 
                type='configuration'
                open={uploaderOpen}
                setOpen={setUploaderOpen}
                // onOk={props.uploaderOkClickHandler} 
                // onCancel={uploaderCancelClickHandler}
                />

        </>
        
    )
}

