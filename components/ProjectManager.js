import React, {useState, useEffect, useRef} from 'react';
import { useStateSetters, useStates } from './AppContext'; 
import BtnConfiguration from './BtnConfiguration';
import { Modal, Form, Input, Button } from 'antd';
import { postProject, editProject } from '../utils/requests';


/**
 *  props:
 *      open: boolean. Whether to open the modal window
 *      setOpen: setter of open. In order to give controll to ProjectManager's internal buttons.
 *      status: 'new' / 'edit'
 *      onSubmit: function. Callback function when user click on Ok button. It receives a single argument: e  {data: {projectId: …, projectName: …, description: …}} 
 *      onProjectNameChange: function. Callback function when user type in project name input field. It receives a single argument: e {value: 'typed value'}
 *      onDescriptionChange: function. Callback function when user type in project description input field. It receives a single argument: e {value: 'typed value'}
 * 
 *      // following props are passed to child BtnConfiguration
 *      groupType: set groupType for each child btnGroupController
        defaultBtnType: set defaultGroupType for each child btnGroupController
        btnType: set btnType for each child btnGroupController
        defaultBtnNum: set defaultBtnNum for each child btnGroupController
        btnNum: set btnNum for each child btnGroupController
        disableGroupTypeSelect: disable child btnGroupController's groupTypeSelect
        disableBtnTypeSelect: disable child btnGroupController's btnTypeSelect
        disableBtnNumInput: disable child btnGroupController's btnNumInput
        hidePlusBtn: whether to hide the + btn of adding btn group
 *      
 *     
 */
export default function ProjectManager(props) {
    
    const [okDisable, setOkDisable] = useState(true);
    const [btnConfigStatus, setBtnConfigStatus] = useState();
    const [info, setInfo] = useState();
    const [noProject, setNoProject] = useState(true);

    const setConfirmConfig = useStateSetters().setConfirmConfig;
    const projectId = useStates().projectId;
    const setProjectId = useStateSetters().setProjectId;
    const projectData = useStates().projectData;
    const setProjectData = useStateSetters().setProjectData;
    const setVideoData = useStateSetters().setVideoData;
    const setVideoId = useStateSetters().setVideoId;
    
    const [form] = Form.useForm();

    useEffect(() => {
        if (props.open) {
            if (props.status === 'new') {
                setInfo(null);
                const id = new Date().getTime().toString();
                setProjectId(id);
                setProjectData({});
                setVideoData({});
                setVideoId(null);
                form.resetFields();
                setOkDisable(true);
                setBtnConfigStatus('new');
                setNoProject(false);
            } else if (props.status === 'edit') {
                if (projectId) {
                    setNoProject(false);
                    setInfo(null);
                    form.setFieldsValue({ 
                        projectName: projectData.projectName,
                        description: projectData.description
                    });
                    setOkDisable(false);
                    setBtnConfigStatus('edit');
                } else {
                    setNoProject(true);
                    setInfo('No project is loaded');
                }
            }
        }
          
    }, [props.open])

    useEffect(() => {
        if (props.setOpen && !btnConfigStatus) {
            props.setOpen(false);
        }
    }, [btnConfigStatus])
    

    async function okClickHandler() {
        const {projectName, description} = form.getFieldsValue();
        const projectObj = {
            projectId: projectId,
            projectName: projectName,
            description: description,
        }
        let res;
        if (props.status === 'new') {
            res = await postProject(projectObj);
        } else if (props.status === 'edit') {
            res = await editProject(projectObj);
        }
        if (res['error']) {
            if (props.status === 'new') {
                setInfo('Adding new project to database failed!');
                form.resetFields();
            } else if (props.status === 'edit') {
                setInfo('Editing project in database failed!');
                form.setFieldValue({
                    projectName: projectData.projectName,
                    description: projectData.description
                })
            }
        } else {
            setInfo(null);
            setProjectData(projectObj);
            setConfirmConfig(true);
        }
        
       
        if (props.onSubmit) {
            const e = {
                data: {...projectObj}
            }
            props.onSubmit(e);
        }
    }


    function cancelClickHandler() {
        setBtnConfigStatus(null);
        if (props.status === 'new') {
            setProjectId(null);
        }   
    }

    function onProjectNameChange(e) {
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
                {props.status === 'edit' && noProject ? null 
                    : 
                    <div>
                        <Form form={form} className='mt-5' size='small'>
                            <Form.Item 
                                name='projectName' 
                                label="Project Name" 
                                rules={[
                                    {
                                    required: true,
                                    message: 'The name is required.',
                                    },
                                ]}
                                validateFirst={true}
                                >
                                <Input 
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
                                    onChange={onDescriptionChange}
                                    allowClear/>
                            
                            </Form.Item>
                        </Form>
                        <BtnConfiguration 
                            status={btnConfigStatus} 
                            setStatus = {setBtnConfigStatus}
                            hideCreateBtn
                            defaultGroupType={props.defaultGroupType}
                            groupType={props.groupType}
                            defaultBtnType={props.defualtBtnType}
                            btnType={props.btnType}
                            defaultBtnNum={props.defaultBtnNum}
                            btnNum={props.btnNum}
                            disableGroupTypeSelect={props.disableGroupTypeSelect}
                            disableBtnTypeSelect={props.disableBtnTypeSelect}
                            disableBtnNumInput={props.disableBtnNumInput}
                            hidePlusBtn={props.hidePlusBtn}
                            />
                    </div>
                }
                <p>{info}</p>
            </Modal>
        </>
    )
}