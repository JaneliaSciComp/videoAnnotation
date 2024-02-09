import React, {useState, useEffect, useRef} from 'react';
import { useStateSetters, useStates } from './AppContext'; 
import { Dropdown } from 'antd';
import ProjectManager from '../components/ProjectManager.js';



export default function ProjectDropdown(props) {
    const [managerOpen, setManagerOpen] = useState(false);
    const [managerType, setManagerType] = useState();

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
                setManagerType('new');
                setManagerOpen(true);
                break;
            case 'Open':

                break;
            case 'Edit':

                break;
            case 'Load Annotation':

                break;
        }
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
                type={managerType} 
                open={managerOpen} 
                setOpen={setManagerOpen} 
                />

        </>
        
    )
}

