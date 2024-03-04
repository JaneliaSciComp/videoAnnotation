import React, {useState, useEffect, useRef} from 'react';
import { useStateSetters, useStates } from './AppContext'; 
import BtnConfiguration from './BtnConfiguration';
import { Modal, Form, Input, Button } from 'antd';


export default function ProjectManager(props) {
    /**
     *  props:
     *      open: boolean. Whether to open the modal window
     *      setOpen: setter of open. In order to give controll to ProjectManager's internal buttons.
     *      // serverType: 'local' / 'remote'
     *      status: 'new' / 'edit'
     *      
     *      For reference, projectConfigDataRef: 
     *          {
     *              projectName: str,
     *              // projectDirectory: (no need. user still has to upload/save files mannually) Only for local server. '/user/project1', a str pointing to a local folder where all annotation and config data are stored.
     *              description: str, optional
     *              btnConfigData: {}
     *          }
     */
    
    const [okDisable, setOkDisable] = useState(true);
    const [btnConfigStatus, setBtnConfigStatus] = useState();
    // const [reloadBtnConfig, setReloadBtnConfig] = useState(false);

    const projectConfigDataRef = useStates().projectConfigDataRef;
    const btnConfigData = useStates().btnConfigData;
    const setConfirmConfig = useStateSetters().setConfirmConfig;
    
    const [form] = Form.useForm();
    // const projectName = Form.useWatch('projectName', form);
    // const description = Form.useWatch('description', form);

    useEffect(() => {
        if (props.open) {
            if (props.status === 'new') {
                form.setFieldsValue({ 
                    projectName: null,
                    description: null
                });
                setOkDisable(true);
                setBtnConfigStatus('new');
            } else if (props.status === 'edit') {
                // display existing config data in modal
                form.setFieldsValue({ 
                    projectName: projectConfigDataRef.current.projectName,
                    description: projectConfigDataRef.current.description
                });
                setOkDisable(false);
                setBtnConfigStatus('edit');
            }
        }
          
    }, [props.open])

    useEffect(() => {
        // btnConfigStatus is changed when click on Cancel or Ok btns.
        // to ensure btnConfiguration's prop changes first before the modal is removed from page. Otherwise, it's prop won't change
        if (!btnConfigStatus) {
            props.setOpen(false);
        }
    }, [btnConfigStatus])
    

    function okClickHandler() {
        const {projectName, description} = form.getFieldsValue();
        // console.log('ok', projectName, description);
        projectConfigDataRef.current =  {
            projectName: projectName,
            description: description,
            // btnConfigData: {...btnConfigData}
        }

        setConfirmConfig(true);
        setBtnConfigStatus(null);
        // props.setOpen(false);
    }


    function cancelClickHandler() {
        console.log('cancel');
        setBtnConfigStatus(null);
        // props.setOpen(false);
    }

    function onProjectNameChange(e) {
        // console.log('projectName', e, projectName);
        if (e.target.value?.length > 0) {
            form.setFieldsValue({ projectName: e.target.value });
            setOkDisable(false);
        } else {
            setOkDisable(true);
        }

        const target = {
            value: e.target.value,
        };

        if (props.onProjectNameChange) {
            props.onProjectNameChange(target);
        }
    }

    function onDescriptionChange(e) {
        // console.log('description', e.target.value);
        if (e.target.value?.length > 0) {
            form.setFieldsValue({ description: e.target.value });
        }

        const target = {
            value: e.target.value,
        };

        if (props.onDescriptionChange) {
            props.onDescriptionChange(target);
        }
    }

    return (
        <>
            <Modal 
                title={props.status?.charAt(0).toUpperCase() + props.status?.slice(1) + " Project"}
                open={props.open} 
                onOk={okClickHandler} 
                onCancel={cancelClickHandler}
                style={{overflowX: 'auto'}}
                footer={[ 
                    <Button key={0} onClick={cancelClickHandler}>Cancel</Button>,
                    <Button key={1} type='primary' onClick={okClickHandler} disabled={okDisable}>Ok</Button>
                ]}
        
                >
                <Form form={form} className='mt-5' size='small'>
                    <Form.Item 
                        name='projectName' 
                        label="Project Name" 
                        rules={[
                            {
                              required: true,
                              message: 'The name is required.',
                            },
                            // {
                            //   pattern: /^[a-zA-Z0-9]+$/,
                            //   message: 'Name can only include letters and numbers.',
                            // },
                          ]}
                        validateFirst={true}
                        // labelAlign="left"
                        >
                        <Input 
                            // value={projectName} 
                            onChange={onProjectNameChange}
                            allowClear/>
                    </Form.Item>
                    {/* {props.serverType==='local' ? 
                        <Form.Item label="Project Directory" required>
                            <Input placeholder=''/>
                        </Form.Item>
                        : null
                    } */}
                    <Form.Item name='description' label="Description">
                        <Input.TextArea 
                            // value={description} 
                            onChange={onDescriptionChange}
                            allowClear/>
                    
                    </Form.Item>
                </Form>
                <BtnConfiguration 
                    status={btnConfigStatus} 
                    hideCreateBtn 
                    />
            </Modal>
        </>
    )
}