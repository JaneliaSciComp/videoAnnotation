import React, {useState, useEffect, useRef} from 'react';
import { useStateSetters, useStates } from './AppContext'; 
import { Modal, List, Button, Form, Input, Space } from 'antd';
import { PlayCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import { postVideo, editVideo, deleteVideo } from '../utils/requests';


/**
 *  props:
 *      open: boolean. Whether to open the modal window
 *      setOpen: setter of open. In order to give controll to VideoManager's internal buttons.
 *      // serverType: 'local' / 'remote'
//  *      includeTrackDataInput: boolean. False by default. If true, show track data input element to allow user upload track data json files. The developer should also specify trackDataParseFunc to parse the data.
//  *      trackDataParseFunc: [(data)=>{}, ...], // array of func, order of entries should match. if includeTrackDataInput is true, should provide funcs to process the data in those files. The func should take the object from the json file as parameter and output the data format the chart component needs
 *      
 *      additionalFields: 
 *        [
 *          {
 *            name: str, // required and unique, used as var name, no white space.
 *            label: str, // required, label shown to the user, with white space
 *            required: boolean, // whether required for user, false by default
 *            loadWithVideo: boolean, // whether to draw the data on canvas with each frame. If yes, will fetch the data from backend and ask canvas to draw it, thus the 'shape' field should be defined too.
 *            shape: str, 'circle'/'rectangle'/... // required when loadWithVideo is true 
 *          },
 *          ...
 *        ]
 *      
 *       
 *      
 *      VideoManager will generate meta data of videos for project.
 *      For reference, projectConfigDataRef: 
 *          {
 *              projectName: str,
 *              // projectDirectory: (no need. user still has to upload/save files mannually) Only for local server. '/user/project1', a str pointing to a local folder where all annotation and config data are stored.
 *              description: str, optional
 *              *** 
 *                  videos: {
 *                      videoId: {
 *                          projectId: str,
 *                          name: str,
 *                          path: str,
 *                          additionalFields: [{name: str, value: str}, ...] // can be null/undefined/empty arr, and this field always exist in video data; value field can be absent if it's not required
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
    // const [videoAdditionalFieldsObj, setVideoAdditionalFieldsObj] = useState();

    // const projectConfigDataRef = useStates().projectConfigDataRef;
    const videoData = useStates().videoData;
    const setVideoData = useStateSetters().setVideoData;
    const videoId = useStates().videoId;
    const setVideoId = useStateSetters().setVideoId;
    const setLoadVideo = useStateSetters().setLoadVideo;
    // const setVideoPathToGet = useStateSetters().setVideoPathToGet;
    const setResetVideoPlay = useStateSetters().setResetVideoPlay;
    const resetVideoDetails = useStates().resetVideoDetails;
    const setResetVideoDetails = useStateSetters().setResetVideoDetails;
    const videoAdditionalFieldsObj = useStates().videoAdditionalFieldsObj;
    const setVideoAdditionalFieldsObj = useStateSetters().setVideoAdditionalFieldsObj;
    const projectId = useStates().projectId;


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
            const names = new Set();
            const fields = {};
            for (let field of props.additionalFields) {
                // console.log(field);
                names.add(field.name);
                fields[field.name] = {
                    required: field.required, 
                    uploadWithVideo: field.uploadWithVideo,
                    shape: field.shape,
                };
            }
            console.log(fields, names);
            if (names.size < props.additionalFields?.length) {
                setVideoAdditionalFieldsObj(null);
                throw new Error("Every field name should be unique.");
            } else {
                setVideoAdditionalFieldsObj(fields);
            }
        } else {
            setVideoAdditionalFieldsObj(null);
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
        if (props.additionalFields?.length > 0) {
            props.additionalFields.forEach((f, i) => {
                if (videoObj.additionalFields[i]) {
                    form.setFieldsValue({
                        [f.name]: videoObj.additionalFields[i].value // props.additionalFields and additionalFields field in videoData have the same order of entries
                    })
                }
            })
        }
        setDetailsVideoId(videoId);
        if (checkRequiredFields()) {
            setBtnDisable(false);
        }

        
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
        // console.log('additionalFieldChange', e.target.value, fieldName);
        onRequiredFieldChange(e.target.value, fieldName);
        // console.log(form.getFieldsValue());
    }

    function onRequiredFieldChange(value, fieldName) { 
        form.setFieldsValue({ [fieldName]: value });
        // console.log('checkRequiredField ', checkRequiredFields());
        if (checkRequiredFields()) {
            setBtnDisable(false);
        } else {
            setBtnDisable(true);
        }
    }

    function checkRequiredFields() {
        const fields = form.getFieldsValue();
        // console.log(fields);
        if (fields.videoPath.length == 0) {
            return false;
        }
        
        for (let f in fields) {
            // console.log(f, additionalFieldsObj[f]?.required, fields[f]?.length);
            if (videoAdditionalFieldsObj 
                && videoAdditionalFieldsObj[f]?.required 
                && (!fields[f]?.length > 0)) {
                    return false;
                }
        }
        
        return true;
    }

    async function onAddBtnClick() {
        // console.log(e);
        const id = new Date().getTime().toString();
        const videoInfoObj = modifyVideoData(id);
        console.log(videoInfoObj);
        
        // send post request to db
        const res = await postVideo(videoInfoObj);
        // console.log(res);
        if (res['error']) {
            setInfo(res['error']);
        } else {
            setInfo(null);
        }
    }

    async function onAddLoadBtnClick() {
        // console.log(e);
        const id = new Date().getTime().toString();
        const videoDataCopy =  modifyVideoData(id);
        console.log(videoDataCopy)

        // send post request to db
        const res = await postVideo(videoDataCopy);
        // console.log(res);
        if (res['error']) {
            setInfo(res['error']);
        } else {
            setInfo(null);
        }

        //trigger loading video in VideoUploader
        if (videoDataCopy) {
            setLoadVideo(videoDataCopy);
        }
    }

    async function onEditBtnClick() {
        // console.log(e);
        if (detailsVideoId) {
            const videoInfoObj = modifyVideoData(detailsVideoId);
            
            // send put request to db
            const res = await editVideo(videoInfoObj);
            // console.log(res);
            if (res['error']) {
                setInfo('Editing video data in database failed!');
            } else {
                setInfo(null);
            }
        } else {
            setInfo('Can only edit an existing video!')
        }
        
    }

    function modifyVideoData(id) {
        let formFields = form.getFieldsValue();
        console.log(formFields);
        let videoName = formFields.videoName;
        const videoPath = formFields.videoPath;
        if (!videoName?.length>0) {
            videoName = videoPath;
        }
        let additionalFieldsData;
        if (props.additionalFields?.length > 0) {
            additionalFieldsData = props.additionalFields.map(f => {
                return {name: f.name, value: formFields[f.name]}
            });
        }
        // console.log(additionalFieldsData);

        if (projectId) {
            const videoDataCopy = {...videoData};
            videoDataCopy[id] = {
                projectId: projectId,
                name: videoName,
                path: videoPath,
                additionalFields: additionalFieldsData
            };
            setVideoData(videoDataCopy);
            // projectConfigDataRef.current.videos = {...videoDataCopy};

            form.resetFields();
            setBtnDisable(true);
            setInfo(null);
            setDetailsVideoId(null);

            return {    
                        videoId: id,
                        projectId: projectId,
                        name: videoName,
                        path: videoPath,
                        additionalFields: additionalFieldsData
                    };
        } else {
            setInfo('Please initialize or load a project first.')
        }
    }


    function onLoadBtnClick(i) {
        const id = videoIds[i];
        const videoObj = {...videoData[id]};
        videoObj.videoId = id;
        console.log(videoObj);

        setLoadVideo(videoObj);
    }

    /**
     * invoke provided parseFunc to generate the data format that chart needs 
     * */
    // function parseAdditionalFieldsData(i) {
    //     // const fileInput = document.createElement('input');
    //     // fileInput.value = '/Users/pengx/Downloads/configuration (3).json';
    //     // fileInput.type = 'file';
    //     // fileInput.click();
    //     console.log('here');
    //     // fetch('/Users/pengx/Downloads/configuration.json').then(response => console.log(response.json()));
    // }

    function onDelBtnClick(i) {
        const videoIdToDel = videoIds[i];

        //TODO: add confirm
        Modal.confirm({
            title: 'Alert',
            content: 'The current video data including configuration and annotations will be removed!',
            onOk: async ()=>{await deleteThisVideo(videoIdToDel)},
            // onCancel: cancelClickHandler,
        });
    }

    async function deleteThisVideo(videoIdToDel) {
        //delete video data from db
        const res = await deleteVideo(videoIdToDel);
        // console.log(res);
        if (res['error']) {
            setInfo('Deleting video data in database failed!');
            return
        } 

        //TODO: delete annotation related to this video from db

        setInfo(null);
        if (videoIdToDel === detailsVideoId) {
            form.resetFields();
            setBtnDisable(true);
            setDetailsVideoId(null);
        }
        const videoDataCopy = {...videoData};
        delete(videoDataCopy[videoIdToDel]);
        setVideoData(videoDataCopy);
        // projectConfigDataRef.current.videos = {...videoDataCopy};

        // console.log(i, videoIdToDel, videoId, videoIdToDel == videoId, videoIdToDel === videoId);
        if (videoIdToDel == videoId) { // videoIdToDel is str, videoId is int, so use == instead of ===
            // setResetVideoPlay(true); //TODO: if setVideoId to be null, still need this?
            setVideoId(null);
            //TODO: reset annotationTable and chart
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
                                <Button type='text' onClick={()=>{onLoadBtnClick(i)}} icon={<PlayCircleOutlined />} />
                                <Button type='text' onClick={()=>{onDelBtnClick(i)}} icon={<DeleteOutlined />} />
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