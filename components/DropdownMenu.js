import React, {useState, useEffect, useRef} from 'react';
import { useStateSetters, useStates } from './AppContext'; 
import { Dropdown, Button, Modal } from 'antd';

/**
 * This component is meant to take a list of modal components, such as ProjectManager, ProjectList.
 * Can also take other entries like string, icon, etc.
 *  
 * props:
 *     name: str, the name of the dropdown button
 *     menu: [
 *      {
 *          label: str, 
 *          icon: react icon,
 *          disabled: boolean,
 *          //key: str,
 *          compName: str, // only required if use component from this library, e.g. 'ProjectManager' for <ProjectManager>
 *          component: component, // a react node, e.g. <ProjectList key='0' open={open} setOpen={setOpen} />. If it's a modal comp, the open/close behavior is handled automatically if the open and setOpen attributes are defined.  remember to pass a 'key' attribute
 *          //onClick: (target) => {}, //target: {label:, key:, }
 *          preventDefault: boolean, //there are default behaviors when click on some components of this lib, e.g. clicking on ProjectManager will trigger a modal window. Set this to true to prevent the default behavior when needed.
 * }, 
 *      ...]
 *    onClick: (e) => {}
 */
export default function DropdownMenu(props) {
    const projectId = useStates().projectId;
    const setSaveConfig = useStateSetters().setSaveConfig;
    const setSaveAnnotation = useStateSetters().setSaveAnnotation;

    const items = props.menu.map((item, i) => {
        return {
            label: item.label,
            key: i.toString(),
            icon: item.icon,
            disabled: item.disabled,
        }
    })
    // console.log(items);

    const components = []; 
    props.menu.forEach((item, i) => components[i] = item.component);

    const onClick = (e) => {
        const index = parseInt(e.key);
        const target = props.menu[index];
        const comp = components[index];
        // console.log(e, target, comp?.props);
        if (target && !target.preventDefault && comp) {
            if (target.compName === 'ProjectManager' && comp.props.status === 'new' && projectId) {
                confirm(comp);
            } else if (target.compName === 'SaveBtn') {
                if ( comp.props.type==='configuration') {
                    setSaveConfig(true);
                } else if (comp.props.type==='annotation') {
                    setSaveAnnotation(true);
                }
            } else {
                // console.log('open');
                if (comp?.props?.setOpen) {
                    comp.props.setOpen(true);
                }
            }                
        }

        e.key = index;
        if (props.onClick) {
            props.onClick(e);
        }
    }

    function confirmOkClickHandler(comp) {
        comp.props.setOpen(true);
    }

    function cancelClickHandler(comp) {
        comp.props.open=false;
    }

    function confirm(comp) {
        Modal.confirm({
            title: 'Alert',
            content: 'The current project configuration data including annotation buttons will be removed!',
            onOk: () => confirmOkClickHandler(comp),
            onCancel: () => cancelClickHandler(comp),
        });
    }

    return (
        <>
            <Dropdown
                menu={{
                    items,
                    onClick
                }}
                trigger={['click']}
                >
                <a style={{width: '6em', textDecoration: 'none', cursor: 'pointer'}} onClick={(e) => e.preventDefault()}>
                    {props.name}
                </a>
            </Dropdown>
            {components}
        </>
        
    )
}