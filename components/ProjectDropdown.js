import React, {useState, useEffect, useRef} from 'react';
import { useStateSetters, useStates } from './AppContext'; 
import { Dropdown, Button, Modal } from 'antd';
import ProjectManager from '../components/ProjectManager.js';



export default function ProjectDropdown(props) {
    /**
     *  props:
     *      //serverType: 'local' / 'remote'
     */

    const [managerOpen, setManagerOpen] = useState(false);
    const [managerStatus, setManagerStatus] = useState(); //'new' / 'edit'

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
          label: 'Load Annotation',
          key: '3',
        },
    ];

    function onClick(e) {
        const label = items[e.key].label;
        switch (label) {
            case 'New':
                Modal.confirm({
                    title: 'Alert',
                    content: 'The current project configuration data will be removed!',
                    onOk: okClickHandler,
                    onCancel: cancelClickHandler,
                    // footer: (_, { OkBtn, CancelBtn }) => (
                    //   <>
                    //     <CancelBtn />
                    //     <OkBtn />
                    //   </>
                    // ),
                  });
                break;
            case 'Open':

                break;
            case 'Edit':
                setManagerStatus('edit');
                setManagerOpen(true);
                break;
            case 'Load Annotation':

                break;
        }
    }

    function okClickHandler() {
        setManagerStatus('new');
        setManagerOpen(true);
    }

    function cancelClickHandler() {
        setManagerOpen(false);
    }

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

        </>
        
    )
}

