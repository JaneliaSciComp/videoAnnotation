import { ChangeEvent, useState, useEffect, SetStateAction, Dispatch } from 'react';
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
 *      defaultGroupType: ??
        defaultBtnType: set defaultGroupType for each child btnGroupController
        btnType: set btnType for each child btnGroupController
        defaultBtnNum: set defaultBtnNum for each child btnGroupController
        btnNum: set btnNum for each child btnGroupController
        disableGroupTypeSelect: disable child btnGroupController's groupTypeSelect
        disableBtnTypeSelect: disable child btnGroupController's btnTypeSelect
        disableBtnNumInput: disable child btnGroupController's btnNumInput
        hidePlusBtn: whether to hide the + btn of adding btn group
 *
 */

type projectManagerProps = {
    open: boolean,
    setOpen: Dispatch<SetStateAction<boolean>>,
    status: "new" | "edit",
    onSubmit?: (e: {data: any}) => void,  
    onProjectNameChange?: (e: {value: string}) => void,
    onDescriptChange?: (e: {value: string}) => void,
    // Props passed to BtnConfiguration
    groupType?: string,
    defaultGroupType?: string,
    disableGroupTypeSelect?: boolean,
    btnType?: string,
    defaultBtnType?: string,
    btnNum?: number,
    defaultBtnNum?: string,
    disableBtnTypeSelect?: boolean,
    disableBtnNumInput?: boolean,
    hidePlusBtn?: boolean,    
}


export default function ProjectManager({open, setOpen, status, onSubmit, onProjectNameChange, onDescriptChange, groupType, defaultGroupType, 
    disableGroupTypeSelect, btnType, defaultBtnType, btnNum, defaultBtnNum, disableBtnTypeSelect, disableBtnNumInput, hidePlusBtn}: projectManagerProps) {

    const [okDisable, setOkDisable] = useState<boolean>(true);
    const [btnConfigStatus, setBtnConfigStatus] = useState<string | null>(null);
    const [info, setInfo] = useState<string | null>();
    const [noProject, setNoProject] = useState<boolean>(true);

    const setConfirmConfig = useStateSetters().setConfirmConfig;
    const projectId = useStates().projectId;
    const setProjectId = useStateSetters().setProjectId;
    const projectData = useStates().projectData;
    const setProjectData = useStateSetters().setProjectData;
    const setVideoData = useStateSetters().setVideoData;
    const setVideoId = useStateSetters().setVideoId;

    const [form] = Form.useForm();

    useEffect(() => {
        if (open) {
            if (status === 'new') {
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
            } else if (status === 'edit') {
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

    }, [open])

    useEffect(() => {
        if (setOpen && !btnConfigStatus) {
            setOpen(false);
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
        if (status === 'new') {
            res = await postProject(projectObj);
        } else if (status === 'edit') {
            res = await editProject(projectObj);
        }
        if (res['error']) {
            if (status === 'new') {
                setInfo('Adding new project to database failed!');
                form.resetFields();
            } else if (status === 'edit') {
                setInfo('Editing project in database failed!');
                form.setFieldsValue({
                    projectName: projectData.projectName,
                    description: projectData.description
            })
            }
        } else {
            setInfo(null);
            setProjectData(projectObj);
            setConfirmConfig(true);
        }


        if (onSubmit) {
            const e = {
                data: {...projectObj}
            }
            onSubmit(e);
        }
    }


    function cancelClickHandler() {
        setBtnConfigStatus(null);
        if (status === 'new') {
            setProjectId(null);
        }
    }

    function handleProjectNameChange(e: ChangeEvent<HTMLInputElement>) {
        if (e.target.value?.length > 0) {
            form.setFieldsValue({ projectName: e.target.value });
            setOkDisable(false);
        } else {
            setOkDisable(true);
        }

        const target = {
            value: e.target.value,
        };

        if (onProjectNameChange) {  // This is a callback function and is NOT the function above.  eg, this is NOT recursive!!!!
            onProjectNameChange(target);
        }
    }

    function onDescriptionChange(e: ChangeEvent<HTMLTextAreaElement>) {
        if (e.target.value?.length > 0) {
            form.setFieldsValue({ description: e.target.value });
        }

        const target = {
            value: e.target.value,
        };

        if (onDescriptChange) {
            onDescriptChange(target);
        }
    }

    return (
        <Modal
            title={status?.charAt(0).toUpperCase() + status?.slice(1) + " Project"}
            open={open}
            onOk={okClickHandler}
            onCancel={cancelClickHandler}
            style={{overflowX: 'auto'}}
            footer={[
                <Button key={0} onClick={cancelClickHandler}>Cancel</Button>,
                <Button key={1} type='primary' onClick={okClickHandler} disabled={okDisable}>Ok</Button>
            ]}
            >
            {status === 'edit' && noProject ? null
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
                                onChange={handleProjectNameChange}
                                allowClear/>
                        </Form.Item>
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
                        defaultGroupType={defaultGroupType?defaultGroupType : null}
                        groupType={groupType}
                        defaultBtnType={defaultBtnType}
                        btnType={btnType}
                        defaultBtnNum={defaultBtnNum}
                        btnNum={btnNum}
                        disableGroupTypeSelect={disableGroupTypeSelect}
                        disableBtnTypeSelect={disableBtnTypeSelect}
                        disableBtnNumInput={disableBtnNumInput}
                        hidePlusBtn={hidePlusBtn}
                    />
                </div>
            }
            <p>{info}</p>
        </Modal>
    )
}
