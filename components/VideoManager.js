import React, {useState, useEffect, useRef} from 'react';
import { useStateSetters, useStates } from './AppContext'; 
import { Modal, List, Button, Form, Input, Space } from 'antd';
import { PlayCircleOutlined, DeleteOutlined } from '@ant-design/icons';


/**
 *  props:
 *      open: boolean. Whether to open the modal window
 *      setOpen: setter of open. In order to give controll to VideoManager's internal buttons.
 *      // serverType: 'local' / 'remote'
 *      onVideoNameChange: 
 *      
 *      VideoManager will generate videos data for project.
 *      For reference, projectConfigDataRef: 
 *          {
 *              projectName: str,
 *              // projectDirectory: (no need. user still has to upload/save files mannually) Only for local server. '/user/project1', a str pointing to a local folder where all annotation and config data are stored.
 *              description: str, optional
 *              *** 
 *                  videos: {
 *                      videoId: {
 *                          name: str,
 *                          path: str
 *                      },
 *                      ...
 *                  } 
 *              ***
 *          }
 */
export default function VideoManager(props) {

    //TODO: load initial project videos data
    //TODO: add and load btn, load video
    
    const [videoNames, setVideoNames] = useState([]); //data source for list: ['video1', 'video2']
    const [detailsVideoName, setDetailsVideoName] = useState();
    const [detailsVideoPath, setDetailsVideoPath] = useState();
    const [detailsVideoId, setDetailsVideoId] = useState(); 
    const [btnDisable, setBtnDisable] = useState(true);

    const projectConfigDataRef = useStates().projectConfigDataRef;
    
    const [form] = Form.useForm();

    useEffect(() => {
        if (props.open) {
            
        }
          
    }, [props.open])

    // useEffect(()=>{
    //     if (projectConfigDataRef.current?.videos?.length > 0) {
    //         const videos = Object.entries(projectConfigDataRef.current.videos).map(
    //             (_, value) => {
    //                 return value.name;
    //             }
    //         )
    //         console.log('videos', videos);
    //         setVideoData(videos);
    //     } else {
    //         setVideoData([]);
    //     }
    // }, [])
    

    function okClickHandler() {
        // console.log('ok', projectName, description);
        

        props.setOpen(false);
    }


    function cancelClickHandler() {
        props.setOpen(false);
    }

    function onVideoNameClick(e) {
        // console.log(e.target);
        const videos = projectConfigDataRef.current.videos;
        const videoId = Object.keys(videos).filter(
            (id) => videos[id].name === e.target.innerHTML
        )[0];
        const videoObj = videos[videoId];
        form.setFieldsValue({
            videoName: videoObj.name,
            videoPath: videoObj.path
        })
        setDetailsVideoId(videoId);
        setBtnDisable(false);
    }

    function onVideoNameChange(e) {
        // console.log('videoName', e);
        form.setFieldsValue({ videoName: e.target.value });

        const target = {
            value: e.target.value,
        };

        if (props.onVideoNameChange) {
            props.onVideoNameChange(target);
        }
    }

    function onVideoPathChange(e) {
        // console.log('videoPath', e);
        if (e.target.value?.length > 0) {
            form.setFieldsValue({ videoPath: e.target.value });
            setBtnDisable(false);
        }else {
            setBtnDisable(true);
        }

        const target = {
            value: e.target.value,
        };

        if (props.onVideoPathChange) {
            props.onVideoPathChange(target);
        }
    }

    function onAddBtnClick() {
        // console.log(e);
        const id = new Date().getTime();
        addVideo(id);
    }

    function onAddLoadBtnClick() {
        // console.log(e);
        const id = new Date().getTime();
        addVideo(id);

        //TODO: submit video to backend
    }

    function onEditBtnClick() {
        // console.log(e);
        let {videoName, videoPath} = form.getFieldsValue();
        if (!videoName?.length>0) {
            videoName = videoPath;
        }
        if (projectConfigDataRef.current?.projectName?.length>0) {
            const videosCopy = {...projectConfigDataRef.current.videos};
            videosCopy[detailsVideoId].name = videoName;
            const newVideoNames = Object.entries(videosCopy).map(([_, value])=>value.name);
            setVideoNames(newVideoNames);

            projectConfigDataRef.current.videos[detailsVideoId] = {
                name: videoName,
                path: videoPath
            };
        }
        setDetailsVideoId(null);
        form.resetFields();
        setBtnDisable(true);
    }

    function addVideo(id) {
        let {videoName, videoPath} = form.getFieldsValue();
        if (!videoName?.length>0) {
            videoName = videoPath;
        }
        if (projectConfigDataRef.current?.projectName?.length>0) {
            const videosCopy = {...projectConfigDataRef.current.videos};
            videosCopy[id] = {name: videoName};
            const newVideoNames = Object.entries(videosCopy).map(([_, value])=>value.name);
            // console.log(videosCopy, newVideoNames);
            setVideoNames(newVideoNames);

            projectConfigDataRef.current.videos[id] = {
                name: videoName,
                path: videoPath
            };
        }
        // setDetailsVideoId(id);
        form.resetFields();
        setBtnDisable(true);
    }

    return (
        <>
            {/* <Modal 
                title='Video Manager'
                open={props.open} 
                onOk={okClickHandler} 
                onCancel={cancelClickHandler}
                // style={{overflowX: 'auto'}}
        
                > */}
                <List
                    size="small"
                    // header={<div>Header</div>}
                    // footer={<div>Footer</div>}
                    bordered
                    dataSource={videoNames}
                    renderItem={(item) => 
                        <List.Item>
                            <Button type="link" onClick={onVideoNameClick}>{item}</Button>
                            <div >
                                <Button icon={<PlayCircleOutlined />} />
                                <Button icon={<DeleteOutlined />} />
                            </div>
                            
                        </List.Item>
                    }
                    />
                <div className='my-2 px-3 py-2' style={{border: '1px solid rgb(222, 226, 230)', borderRadius: '0.5em'}}>
                    <p className='my-2'>Video Details</p>
                    <Form className='my-4 mx-3' form={form} size='small'>
                        <Form.Item 
                            name='videoName' 
                            label="Video Name" 
                            rules={[
                                {
                                //   required: true,
                                message: 'If name is empty, will directly use path as name',
                                },
                            ]}
                            >
                            <Input 
                                // value={detailsVideoName} 
                                onChange={onVideoNameChange}
                                allowClear/>
                        </Form.Item>

                        <Form.Item 
                            name='videoPath' 
                            label="Video Path" 
                            rules={[
                                {
                                required: true,
                                message: 'Video path is required',
                                },
                            ]}
                            // validateFirst={true}
                            // labelAlign="left"
                            >
                            <Input 
                                // value={detailsVideoPath} 
                                onChange={onVideoPathChange}
                                allowClear/>
                        </Form.Item>
                        
                        <div className='d-flex justify-content-center'>
                            <Space size="small">
                                <Button onClick={onAddBtnClick} disabled={btnDisable}>Add</Button>
                                <Button onClick={onAddLoadBtnClick} disabled={btnDisable}>Add and Load</Button>
                                <Button onClick={onEditBtnClick} disabled={btnDisable}>Edit</Button>
                            </Space>
                        </div>
                    </Form>
                </div>
            {/* </Modal> */}
        </>
    )
}