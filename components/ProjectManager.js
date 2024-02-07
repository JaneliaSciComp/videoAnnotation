import React, {useState, useEffect, useRef} from 'react';
import { useStateSetters, useStates } from './AppContext'; 
import BtnConfiguration from './BtnConfiguration';
import { Modal, Space } from 'antd';


export default function ProjectManager(props) {
    /**
     *  props:
     *      open: boolean. Whether to open the modal window
     *      setOpen: setter of open. In order to give controll to ProjectManager's internal buttons.
     */


    function okClickHandler() {
        props.setOpen(false);
    }

    function cancelClickHandler() {
        props.setOpen(false);
    }

    return (
        <>
            <Modal 
                title="Project Manager" 
                open={props.open} 
                onOk={okClickHandler} 
                onCancel={cancelClickHandler}
                style={{height: '70%', overflowY: 'auto'}}
                >
                <BtnConfiguration />
            </Modal>
        </>
    )
}