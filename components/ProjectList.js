import React, {useState, useEffect, useRef} from 'react';
import { useStateSetters, useStates } from './AppContext'; 
import { Modal, List, Button, Form, Input, Space } from 'antd';
import { PlayCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import { getAllProjects, getProject, getProjectBtn, getProjectVideo, deleteProject, deleteProjectBtn, deleteProjectVideo } from '../utils/requests';

/**
 *  To list all existing projects in the db.
 *  props:
 *      open: boolean. Whether to open the modal window
 *      setOpen: setter of open. In order to give controll to this component's internal buttons.
 */

export default function ProjectList(props) {
    const [allProjects, setAllProjects] = useState([]);
    const [projectNames, setProjectNames] = useState([]);
    const [projectIds, setProjectIds] = useState([]);
    const [info, setInfo] = useState();
    
    const projectId = useStates().projectId;
    const setProjectId = useStateSetters().setProjectId;
    const setProjectData = useStateSetters().setProjectData;
    const setBtnConfigData = useStateSetters().setBtnConfigData;
    const setVideoData = useStateSetters().setVideoData;
    const setResetVideoDetails = useStateSetters().setResetVideoDetails;
    const setVideoId = useStateSetters().setVideoId;



    useEffect(()=>{
        if (props.open) {
            getAllProjects().then(
                res => {
                    if (res['error']) {
                        setInfo(res['error']);
                    } else {
                        setInfo(null);
                        setAllProjects(res['projects']);
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
        setProjectNames(names);
        setProjectIds(ids);
    }, [allProjects])

    function cancelClickHandler() {
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
        });
    }

    async function loadProject(id) {
        let projectRes, btnRes, videoRes;
        await Promise.all(['project', 'btn', 'video'].map(async (type) => {
            if (type === 'project') {
                projectRes = await getProject(id);
            } else if (type === 'btn') {
                btnRes = await getProjectBtn(id);
            } else if (type === 'video') {
                videoRes = await getProjectVideo(id);
            }
          }));
          
        if (projectRes['error'] || btnRes['error'] || videoRes['error']) {
            setInfo(`Load project failed: \n Project: ${projectRes?.error} \n Btn: ${btnRes?.error} \n Video: ${videoRes?.error}`);
        } else {
            setInfo(null);
            setProjectData(projectRes); 
            setProjectId(projectRes['projectId']);

            const btnData = {};
            btnRes.btnGroups.forEach(group => {
                const groupId = group.btnGroupId;
                delete(group['btnGroupId']);
                btnData[groupId] = group;
            });
            setBtnConfigData(btnData); 

            const videos = {};
            videoRes.videos.forEach(v => {
                const videoId = v.videoId;
                delete(v['videoId']);
                videos[videoId] = v;
            });
            setVideoData(videos);
            setVideoId(null);
            
        }
        
        props.setOpen(false);
    }

    async function onDelBtnClick(i) {
        const projectIdToDel = projectIds[i];
        const projectNameToDel = projectNames[i];
        deleteProjectConfirm(projectIdToDel, projectNameToDel);
    }

    function deleteProjectConfirm(id, name) {
        Modal.confirm({
            title: 'Alert',
            content: 'The project data including configuration and all annotations will be removed!',
            onOk: async ()=>{await deleteWholeProject(id, name)},
        });
    }

    async function deleteWholeProject(id, name) {
        let projectRes, btnRes, videoRes;
        await Promise.all(['project', 'btn', 'video'].map(async (type) => {
            if (type === 'project') {
                projectRes = await deleteProject(id);
            } else if (type === 'btn') {
                btnRes = await deleteProjectBtn(id);
            } else if (type === 'video') {
                videoRes = await deleteProjectVideo(id);
            }
          }));
        
        if (projectRes['error']) {
            setInfo(`Delete project configuration failed: ${projectRes?.error}`)
        } else {
            setInfo(`Deleted project ${name}: \n Btn: ${btnRes?.info} \n Video: ${videoRes?.info}`);
            
            const newAllProjects = allProjects.filter( p => p.projectId !== id);
            setAllProjects(newAllProjects);

            if (id === projectId) {
                setProjectData({}); 
                setProjectId(null);
                setBtnConfigData({});
                setVideoData({});
                setVideoId(null);
                setResetVideoDetails(true);

            }
            
        }
        
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
                    <Button key={1} type='primary' onClick={okClickHandler} >Ok</Button>
                ]}
                >
                <List
                    size="small"
                    bordered
                    dataSource={projectNames}
                    renderItem={(name, i) => 
                        <List.Item key={i} style={projectIds[i]===projectId ? {backgroundColor: '#EEEEEE'} : null}>

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