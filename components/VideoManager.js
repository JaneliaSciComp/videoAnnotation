import React, {useState, useEffect, useRef} from 'react';
import { useStateSetters, useStates } from './AppContext'; 
import { Modal, List, Button, Form, Input, Space } from 'antd';
import { PlayCircleOutlined, DeleteOutlined } from '@ant-design/icons';


/**
 *  props:
 *      open: boolean. Whether to open the modal window
 *      setOpen: setter of open. In order to give controll to VideoManager's internal buttons.
 *      // serverType: 'local' / 'remote'
 *      additionalFields: designed to allow linking additional files such as trajectory data to the video, and showing in the chart component
 *        [
 *          {
 *            name: str, // required, used as var name, no white space
 *            label: str, // required, label shown to the user, with white space
 *            required: boolean, // whether required for user, false by default
 *            showInChart: boolean, // whether to show the data in this file in the chart, false by default. If true, should provide parseFunc to parse the data
 *            parseFunc: (data)=>{}, //if shownInChart is true, should provide this func to process the data in that file. This func should take the object from the json file as parameter and output the data format the chart component needs
 *          },
 *          ...
 *        ]
 *      
 *       
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
 *                          path: str,
 *                          additionalFileds: []
 *                      },
 *                      ...
 *                  } 
 *              ***
 *          }
 */
export default function VideoManager(props) {
    
    const [videoNames, setVideoNames] = useState([]); //data source for list: ['video1', 'video2']
    const [videoIds, setVideoIds] = useState([]); // videoIds are the ids of entries in videoNames in the same order
    // const [detailsVideoName, setDetailsVideoName] = useState();
    // const [detailsVideoPath, setDetailsVideoPath] = useState();
    const [detailsVideoId, setDetailsVideoId] = useState(); 
    const [btnDisable, setBtnDisable] = useState(true);
    const [info, setInfo] = useState();
    const [additionalFieldsObj, setAdditionalFieldsObj] = useState();

    const projectConfigDataRef = useStates().projectConfigDataRef;
    const videoData = useStates().videoData;
    const setVideoData = useStateSetters().setVideoData;
    const videoId = useStates().videoId;
    // const setVideoId = useStateSetters().setVideoId;
    const setNewVideoPath = useStateSetters().setNewVideoPath;
    // const setVideoPathToGet = useStateSetters().setVideoPathToGet;
    const setResetVideoPlay = useStateSetters().setResetVideoPlay;
    const resetVideoDetails = useStates().resetVideoDetails;
    const setResetVideoDetails = useStateSetters().setResetVideoDetails;


    const [form] = Form.useForm();

    console.log('VideoManager render', videoId, videoIds);

    // useEffect(() => {
    //     if (props.open) {
            
    //     }
          
    // }, [props.open])

    useEffect(()=> {
        if (resetVideoDetails) {
            form.resetFields();
            setBtnDisable(true);
            setInfo(null);
            setDetailsVideoId(null);

            setResetVideoDetails(false);
        }
    }, [resetVideoDetails])

    useEffect(() => {
        const names = [];
        const ids = [];
        for (let id in videoData) {
            ids.push(id);
            names.push(videoData[id].name);
        }
        setVideoNames(names);
        setVideoIds(ids);
    }, [videoData])

    useEffect(() => {
        if (props.additionalFields?.length > 0) {
            const fields = {};
            for (let field of props.additionalFields) {
                console.log(field);
                fields[field.name] = {required: field.required};
            }
            console.log(fields);
            setAdditionalFieldsObj(fields);
        } else {
            setAdditionalFieldsObj(null);
        }
    }, [props.additionalFields])
    

    // function okClickHandler() {
    //     // console.log('ok', projectName, description);
        

    //     props.setOpen(false);
    // }


    // function cancelClickHandler() {
    //     props.setOpen(false);
    // }


    function onVideoNameClick(i) {
        // console.log(e.target);
        const videoId = videoIds[i];
        const videoObj = videoData[videoId];
        form.setFieldsValue({
            videoName: videoObj.name,
            videoPath: videoObj.path
        })
        setDetailsVideoId(videoId);
        setBtnDisable(false);

        
        if (props.onVideoNameClick) {
            props.onVideoNameClick(i);
        }
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
        // if (e.target.value?.length > 0) {
        //     form.setFieldsValue({ videoPath: e.target.value });
        //     setBtnDisable(false);
        // } else {
        //     setBtnDisable(true);
        // }
        onRequiredFieldChange(e.target.value, 'videoPath');

        const target = {
            value: e.target.value,
        };

        if (props.onVideoPathChange) {
            props.onVideoPathChange(target);
        }
    }

    function onAdditionalFieldChange(e, fieldName) { 
        console.log('additionalFieldChange', e.target.value, fieldName);
        onRequiredFieldChange(e.target.value, fieldName);
        console.log(form.getFieldsValue());
    }

    function onRequiredFieldChange(value, fieldName) { 
        form.setFieldsValue({ [fieldName]: value });
        console.log('checkRequiredField ', checkRequiredFields());
        if (checkRequiredFields()) {
            setBtnDisable(false);
        } else {
            setBtnDisable(true);
        }
    }

    function checkRequiredFields() {
        const fields = form.getFieldsValue();
        console.log(fields);
        if (fields.videoPath.length == 0) {
            return false;
        }
        
        for (let f in fields) {
            console.log(f, additionalFieldsObj[f]?.required, fields[f]?.length);
            if (additionalFieldsObj 
                && additionalFieldsObj[f]?.required 
                && (!fields[f]?.length > 0)) {
                    return false;
                }
        }
        
        return true;
    }

    function onAddBtnClick() {
        // console.log(e);
        const id = new Date().getTime();
        modifyVideoData(id);
    }

    function onAddLoadBtnClick() {
        // console.log(e);
        const id = new Date().getTime();
        const videoDataCopy =  modifyVideoData(id);
        // console.log(videoDataCopy)

        //trigger posting video to backend in VideoUploader
        if (videoDataCopy) {
            setNewVideoPath(videoDataCopy);
        }
    }

    function onEditBtnClick() {
        // console.log(e);
        modifyVideoData(detailsVideoId);
    }

    function modifyVideoData(id) {
        let {videoName, videoPath} = form.getFieldsValue();
        if (!videoName?.length>0) {
            videoName = videoPath;
        }
        if (projectConfigDataRef.current?.projectName?.length>0) {
            const videoDataCopy = {...videoData};
            videoDataCopy[id] = {
                name: videoName,
                path: videoPath
            };
            setVideoData(videoDataCopy);
            // projectConfigDataRef.current.videos = {...videoDataCopy};

            form.resetFields();
            setBtnDisable(true);
            setInfo(null);
            setDetailsVideoId(null);

            return {[id]: {
                        name: videoName,
                        path: videoPath}};
        } else {
            setInfo('Please initialize or load a project first.')
        }
    }


    function onLoadBtnClick(i) {
        const id = videoIds[i];
        const videoObj = videoData[id];
        const videoPath = {[id]: {...videoObj}};

        setNewVideoPath(videoPath);
    }

    function onDelBtnClick(i) {
        const videoIdToDel = videoIds[i];
        if (videoIdToDel === detailsVideoId) {
            form.resetFields();
            setBtnDisable(true);
            setInfo(null);
            setDetailsVideoId(null);
        }
        const videoDataCopy = {...videoData};
        delete(videoDataCopy[videoIdToDel]);
        setVideoData(videoDataCopy);
        // projectConfigDataRef.current.videos = {...videoDataCopy};

        // console.log(i, videoIdToDel, videoId, videoIdToDel == videoId, videoIdToDel === videoId);
        if (videoIdToDel == videoId) { // videoIdToDel is str, videoId is int, so use == instead of ===
            setResetVideoPlay(true);
        }
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
                    renderItem={(name, i) => 
                        <List.Item style={videoIds[i]==videoId ? {backgroundColor: '#EEEEEE'} : null}>

                            <Button type="link" onClick={()=>{onVideoNameClick(i)}}>{name}</Button>
                            <div >
                                <Button onClick={()=>{onLoadBtnClick(i)}} icon={<PlayCircleOutlined />} />
                                <Button onClick={()=>{onDelBtnClick(i)}} icon={<DeleteOutlined />} />
                            </div>
                            
                        </List.Item>
                    }
                    />
                <div className='my-2 px-3 py-2' style={{border: '1px solid rgb(222, 226, 230)', borderRadius: '0.5em'}}>
                    <p className='my-2'>Video Details</p>
                    <Form className='my-4 mx-3' form={form} size='small'>
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

                        {props.additionalFields.length>0 ? 
                            props.additionalFields.map(
                                ((params, i) => <Form.Item
                                    key = {i}
                                    name={params.name}
                                    label={params.label}
                                    rules={params.required ? [{required: true, message: `${params.label} is required.`}] : null}
                                    >
                                    <Input 
                                        onChange={(e) => {onAdditionalFieldChange(e, params.name)}}
                                        allowClear />
                                </Form.Item>))
                            : null}
                        
                        <div className='d-flex justify-content-center'>
                            <Space size="small">
                                <Button onClick={onAddBtnClick} disabled={btnDisable}>Add</Button>
                                <Button onClick={onAddLoadBtnClick} disabled={btnDisable}>Add and Load</Button>
                                <Button onClick={onEditBtnClick} disabled={btnDisable}>Edit</Button>
                            </Space>
                        </div>
                        <p>{info}</p>
                    </Form>
                </div>
            {/* </Modal> */}
        </>
    )
}