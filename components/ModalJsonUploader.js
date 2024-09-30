import React, {useState, useEffect, useRef} from 'react';
import { useStateSetters, useStates } from './AppContext'; 
import JsonUploader from './JsonUploader';
import { Modal } from 'antd';



/**
 *  props:
 *      type: required, 'annotation' or 'configuration'
 *      open: boolean. Whether to open the modal window
 *      setOpen: setter of open. In order to give controll to ProjectManager's internal buttons.
 */
export default function ModalJsonUploader(props) {

    function cancelClickHandler() {
        props.setOpen(false);

        if (props.onCancel) {
            props.onCancel();
        }
    }

    return (
        <Modal 
            title={`Upload ${props.type==='annotation' ? 'annotation' : 'project configuration'} file (.json)`}
            open={props.open}
            onCancel={cancelClickHandler}
            footer={() => null}
            >
            <div className='my-4 d-flex justify-content-center'>
                <div style={{width: '50%'}}>
                <JsonUploader 
                    type={props.type} 
                    modalOpen={props.open}
                    setModalOpen={props.setOpen}
                    />
                </div>
            </div>
        </Modal>
    )
}