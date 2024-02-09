import React, {useState, useEffect, useRef} from 'react';
import { useStateSetters, useStates } from './AppContext'; 
import BtnConfiguration from './BtnConfiguration';
import { Modal, Space } from 'antd';


export default function ProjectManager(props) {
    /**
     *  props:
     *      open: boolean. Whether to open the modal window
     *      setOpen: setter of open. In order to give controll to ProjectManager's internal buttons.
     *      type: 'new' / 'edit'
     *      configData: 
     *          {
     *              projectName: str,
     *              description: str, optional
     *              projectDirectory: Only for local server. '/user/project1', a str pointing to a local folder where all annotation and config data are stored.
     *              
     *          }
     */


    function okClickHandler() {
        props.setOpen(false);
    }

    function cancelClickHandler() {
        props.setOpen(false);
    }

    function btnConfigCreateHandler() {
        props.setOpen(false);
    }

    return (
        <>
            {props.type === 'new' ? 
                <Modal 
                    title={props.type?.charAt(0).toUpperCase() +props.type?.slice(1) + " Project"}
                    open={props.open} 
                    onOk={okClickHandler} 
                    onCancel={cancelClickHandler}
                    style={{overflowX: 'auto'}}
                    footer={(_, { OkBtn, CancelBtn }) => null}
                    >
                    <BtnConfiguration onCreateBtnClick={btnConfigCreateHandler} />
                </Modal>
                :
                <Modal >

                </Modal>
            }
        </>
    )
}