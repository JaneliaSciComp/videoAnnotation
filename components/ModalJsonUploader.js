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
    
    // const [askConfirm, setAskConfirm] = useState(false); // trigger modal confirm in JsonUploader


    // function okClickHandler() {
    //     // setAskConfirm(true);
    //     setOpen(false);

    //     if (props.onOk) {
    //         props.onOk();
    //     }
    // }

    function cancelClickHandler() {
        // setAskConfirm(false);
        props.setOpen(false);

        if (props.onCancel) {
            props.onCancel();
        }
    }

    return (
        <Modal 
            title={`Upload ${props.type==='annotation' ? 'annotation' : 'project configuration'} file (.json)`}
            open={props.open}
            // onOk={okClickHandler} 
            onCancel={cancelClickHandler}
            footer={() => null}
            >
            <div className='my-4 d-flex justify-content-center'>
                <div style={{width: '50%'}}>
                <JsonUploader 
                    type={props.type} 
                    // askConfirm={askConfirm} 
                    // setAskConfirm={setAskConfirm}
                    modalOpen={props.open}
                    setModalOpen={props.setOpen}
                    />
                </div>
            </div>
        </Modal>
    )
}