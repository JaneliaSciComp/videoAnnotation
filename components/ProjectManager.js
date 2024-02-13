import React, {useState, useEffect, useRef} from 'react';
import { useStateSetters, useStates } from './AppContext'; 
import BtnConfiguration from './BtnConfiguration';
import { Modal, Form, Input, Space } from 'antd';


export default function ProjectManager(props) {
    /**
     *  props:
     *      open: boolean. Whether to open the modal window
     *      setOpen: setter of open. In order to give controll to ProjectManager's internal buttons.
     *      // serverType: 'local' / 'remote'
     *      status: 'new' / 'edit'
     *      configData: 
     *          {
     *              projectName: str,
     *              // projectDirectory: (no need. user still has to upload/save files mannually) Only for local server. '/user/project1', a str pointing to a local folder where all annotation and config data are stored.
     *              description: str, optional
     *          }
     */

    const projectConfigDataRef = useStates().projectConfigDataRef;
    const btnConfigData = useStates().btnConfigData;
    
    const [form] = Form.useForm();
    const projectName = Form.useWatch('projectName', form);
    const description = Form.useWatch('description', form);

    useEffect(() => {
        if (props.open) {
            if (props.status === 'new') {
                form.setFieldsValue({ 
                    projectName: null,
                    description: null
                });
            } else if (props.status === 'edit') {
                // display existing config data in modal
            }
        }
          
    }, [props.open])
    

    function okClickHandler() {
        props.setOpen(false);
        projectConfigDataRef.current =  {
            projectName: projectName,
            description: description,
            btnConfigData: {...btnConfigData}
        }
        console.log(projectConfigDataRef.current);
    }

    function cancelClickHandler() {
        props.setOpen(false);
    }

    function btnConfigCreateHandler() {
        props.setOpen(false);
    }

    return (
        <>
            <Modal 
                title={props.status?.charAt(0).toUpperCase() + props.status?.slice(1) + " Project"}
                open={props.open} 
                onOk={okClickHandler} 
                onCancel={cancelClickHandler}
                style={{overflowX: 'auto'}}
                // footer={(_, { OkBtn, CancelBtn }) => null}
                >
                <Form form={form} className='mt-5' size='small'>
                    <Form.Item name='projectName' label="Project Name" required>
                        <Input value={projectName} allowClear/>
                    </Form.Item>
                    {/* {props.serverType==='local' ? 
                        <Form.Item label="Project Directory" required>
                            <Input placeholder=''/>
                        </Form.Item>
                        : null
                    } */}
                    <Form.Item name='description' label="Description">
                        <Input.TextArea value={description} allowClear/>
                    </Form.Item>
                </Form>
                <BtnConfiguration status={props.status} onCreateBtnClick={btnConfigCreateHandler} />
            </Modal>
        </>
    )
}