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
     */

    const [managerOpen, setManagerOpen] = useState(false);
    const [managerStatus, setManagerStatus] = useState(); //'new' / 'edit'
    const [uploaderOpen, setUploaderOpen] = useState(false);

    const projectConfigDataRef = useStates().projectConfigDataRef;
    const setBtnConfigData = useStateSetters().setBtnConfigData;

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
        // {
        //   label: 'Load Annotation',
        //   key: '3',
        // },
    ];

    function onClick(e) {
        const label = items[e.key].label;
        switch (label) {
            case 'New':
                if (Object.keys(projectConfigDataRef.current).length) {
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
            // case 'Load Annotation':

            //     break;
        }
    }

    function confirmOkClickHandler() {
        // projectConfigDataRef.current = {};
        // setBtnConfigData({});
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

