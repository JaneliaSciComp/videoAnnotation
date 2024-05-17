import React, {useState, useEffect, useRef} from 'react';
import { useStateSetters, useStates } from './AppContext'; 
import { Modal, List, Button, Form, Input, Space } from 'antd';
import { PlayCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import { getAllProjects, getProject, getProjectBtn, getProjectVideo, deleteProject } from '../utils/requests';

/**
 *  To list all existing projects in the db.
 *  props:
 *      open: boolean. Whether to open the modal window
 *      setOpen: setter of open. In order to give controll to this component's internal buttons.
 */

export default function ProjectList(props) {
    const [allProjects, setAllProjects] = useState([]); // Data of all existing projects in the db
    const [projectNames, setProjectNames] = useState([]); //data source for list: ['project1', 'project2']
    const [projectIds, setProjectIds] = useState([]); // The ids of entries in projectNames in the same order
    const [info, setInfo] = useState();
    
    //context
    const projectId = useStates().projectId;
    const setProjectId = useStateSetters().setProjectId;
    // const projectConfigDataRef = useStates().projectConfigDataRef;
    const setProjectData = useStateSetters().setProjectData;
    const setBtnConfigData = useStateSetters().setBtnConfigData;
    const setVideoData = useStateSetters().setVideoData;


    useEffect(()=>{
        if (props.open) {
            getAllProjects().then(
                res => {
                    if (res['error']) {
                        setInfo(res['error']);
                    } else {
                        setInfo(null);
                        setAllProjects(res['projects']); //res could be []
                    }
                }
            ); 
        }
    }, [props.open])

    useEffect(() => {
        const names = [];
        const ids = [];
        for (let p of allProjects) {
            ids.push(p['projectId']);
            names.push(p['projectName']);
        }
        // console.log(names, ids);
        setProjectNames(names);
        setProjectIds(ids);
    }, [allProjects])

    function cancelClickHandler() {
        // console.log('cancel');
        props.setOpen(false);
    }

    function okClickHandler() {
        console.log('I am called');
        props.setOpen(false);
    }

    async function onLoadBtnClick(i) {
        const id = projectIds[i];
        if (projectId) {
            loadProjectConfirm(id);
        } else {
            await loadProject(id);
        }
    }

    function loadProjectConfirm(id) {
        Modal.confirm({
            title: 'Alert',
            content: 'The current project configuration data including annotation buttons will be removed!',
            onOk: async ()=>{
                await loadProject(id);

            },
            // onCancel: cancelClickHandler,
        });
    }

    async function loadProject(projectId) {
        let projectRes, btnRes, videoRes;
        await Promise.all(['project', 'btn', 'video'].map(async (type) => {
            if (type === 'project') {
                projectRes = await getProject(projectId);
            
                // if (projectRes['error']) {
                //     setInfo(projectRes['error']);
                // } else {
                //     setInfo(null);
                //     setProjectData(projectRes); //backend checked if res is empty
                //     setProjectId(projectRes['projectId']);
                // }
            } else if (type === 'btn') {
                btnRes = await getProjectBtn(projectId);
                // if (btnRes['error']) {
                //     setInfo(btnRes['error']);
                // } else {
                //     setInfo(null);
                //     setBtnConfigData(btnRes); //backend checked if res is empty
                // }
            } else if (type === 'video') {
                videoRes = await getProjectVideo(projectId);
            }
          }));
          
        if (projectRes['error'] || btnRes['error'] || videoRes['error']) {
            setInfo(`Load project failed: \n Project: ${projectRes?.error} \n Btn: ${btnRes?.error} \n Video: ${videoRes?.error}`);
        } else {
            setInfo(null);
            setProjectData(projectRes); 
            setProjectId(projectRes['projectId']);

            const btnData = {};
            btnRes.btnGroups.forEach(group => { //btnRes.btnGroups could be []
                const groupId = group.btnGroupId;
                delete(group['btnGroupId']);
                btnData[groupId] = group;
            });
            // console.log(btnData);
            setBtnConfigData(btnData); 

            const videos = {};
            videoRes.videos.forEach(v => { //videoRes.videos could be []
                const videoId = v.videoId;
                delete(v['videoId']);
                videos[videoId] = v;
            });
            // console.log(btnData);
            setVideoData(videos);
            // props.setManagerStatus('edit');
        }
        
        props.setOpen(false);
    }

    async function onDelBtnClick(i) {
        const projectIdToDel = projectIds[i];
        deleteProjectConfirm(projectIdToDel);
    }

    function deleteProjectConfirm(id) {
        Modal.confirm({
            title: 'Alert',
            content: 'The current project data including configuration and all annotations will be removed!',
            onOk: async ()=>{await deleteWholeProject(id)},
            // onCancel: cancelClickHandler,
        });
    }

    async function deleteWholeProject(id) {
        // delete projectConfig/btnConfig/video/annotation from db
        // if the project is current project, reset projectId, videoId, projectData, videoData, btnConfigData, videoPlayer and annotation table and chart.

        // const videoDataCopy = {...videoData};
        // delete(videoDataCopy[videoIdToDel]);
        // setVideoData(videoDataCopy);
        // projectConfigDataRef.current.videos = {...videoDataCopy};

        // console.log(i, videoIdToDel, videoId, videoIdToDel == videoId, videoIdToDel === videoId);
        // if (videoIdToDel == videoId) { // videoIdToDel is str, videoId is int, so use == instead of ===
        //     setResetVideoPlay(true);
        // }
    }

    return (
        <>
            <Modal 
                title='Exisiting Projects'
                open={props.open} 
                onOk={okClickHandler} 
                onCancel={cancelClickHandler}
                style={{overflowX: 'auto'}}
                footer={[ 
                    // <Button key={0} onClick={cancelClickHandler}>Cancel</Button>,
                    <Button key={1} type='primary' onClick={okClickHandler} >Ok</Button>
                ]}
                >
                <List
                    size="small"
                    // header={<h3></h3>}
                    // footer={<div>Footer</div>}
                    bordered
                    dataSource={projectNames}
                    renderItem={(name, i) => 
                        <List.Item style={projectIds[i]===projectId ? {backgroundColor: '#EEEEEE'} : null}>

                            <div>{name}</div>
                            <div >
                                <Button type='text' onClick={()=>{onLoadBtnClick(i)}} icon={<PlayCircleOutlined />} />
                                <Button type='text' onClick={()=>{onDelBtnClick(i)}} icon={<DeleteOutlined />} />
                            </div>
                            
                        </List.Item>
                    }
                    />
                <p>{info}</p>
            </Modal>
        </>
    )
}