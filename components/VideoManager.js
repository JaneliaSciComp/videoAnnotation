import React, {useState, useEffect, useRef} from 'react';
import { useStateSetters, useStates } from './AppContext'; 
import { Modal, List, Button, Form, Input, Space } from 'antd';
import { PlayCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import { postVideo, editVideo, deleteVideo } from '../utils/requests';

/**
 *  props:
//  *      setModalOpen: When this comp is put in a modal, the modal could pass the setter of its open state to this comp, so that this comp can close the parent modal, e.g. when the user clicks the 'load' or 'add and load' button.
 *          
        // serverType: 'local' / 'remote'
//  *      includeTrackDataInput: boolean. False by default. If true, show track data input element to allow user upload track data json files. The developer should also specify trackDataParseFunc to parse the data.
//  *      trackDataParseFunc: [(data)=>{}, ...], // array of func, order of entries should match. if includeTrackDataInput is true, should provide funcs to process the data in those files. The func should take the object from the json file as parameter and output the data format the chart component needs
 *      
 *      additionalFields: //for developer to configure additionalFields, not saved in db. Annotator should fill in path of the file and is saved in db.
 *        [
 *          {
 *            name: str, // required and unique, used as var name, no white space allowed.
 *            label: str, // required, label shown to the user, allow white space
 *            required: boolean, // whether required for user, false by default
 *            loadIn: 'canvas'/'chart'/null, default to null, // whether to draw the data on canvas/chart with each frame. If yes, will fetch the data from backend and ask canvas/chart to draw it
 *            onLoad: func to draw shape on canvas and do other things. required when loadin='canvas' 
 *                  Passed a parameter e: 
 *                  {
 *                      target: {
 *                          canvas: fabricjs canvas obj,
 *                          img: fabricjs img obj,
 *                      },
 *                      data: {
 *                          range: [startIndex, endIndex], 
 *                          data: [additional data]
 *                      }
 *                  }
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
 *                          additionalFields: [{name: str, path: str/null}, ...] // can be null/undefined/empty arr, and this field always exist in video data; value field can be absent if it's not required
 *                      },
 *                      ...
 *                  } 
 *              ***
 *          }
 */
export default function VideoManager(props) {
    
    const [videoNames, setVideoNames] = useState([]);
    const [videoIds, setVideoIds] = useState([]);
    const [detailsVideoId, setDetailsVideoId] = useState(); 
    const [btnDisable, setBtnDisable] = useState(true);
    const [info, setInfo] = useState();

    const videoData = useStates().videoData;
    const setVideoData = useStateSetters().setVideoData;
    const videoId = useStates().videoId;
    const setVideoId = useStateSetters().setVideoId;
    const setLoadVideo = useStateSetters().setLoadVideo;
    const setResetVideoPlay = useStateSetters().setResetVideoPlay;
    const resetVideoDetails = useStates().resetVideoDetails;
    const setResetVideoDetails = useStateSetters().setResetVideoDetails;
    const setResetChart = useStateSetters().setResetChart;
    const videoAdditionalFieldsConfig = useStates().videoAdditionalFieldsConfig;
    const setVideoAdditionalFieldsConfig = useStateSetters().setVideoAdditionalFieldsConfig;
    const projectId = useStates().projectId;
    const setAdditionalDataNameToRetrieve = useStateSetters().setAdditionalDataNameToRetrieve;
    const additionalDataRange = useStates().additionalDataRange;
    const setAdditionalDataRange = useStateSetters().setAdditionalDataRange;

    const [form] = Form.useForm();


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
                names.add(field.name)
                fields[field.name] = {
                    required: field.required, 
                    loadIn: field.loadIn,
                };

                if (field.loadIn === 'canvas') {
                    if (!field.onLoad) { 
                        throw new Error("If loadin is 'canvas', then attribute onLoad is required");
                    } 
                    fields[field.name].onLoad = field.onLoad;
                } 
            }
            if (names.size < props.additionalFields?.length) {
                setVideoAdditionalFieldsConfig({});
                throw new Error("Every field name should be unique.");
            } else {
                setVideoAdditionalFieldsConfig(fields);
            }
        } else {
            setVideoAdditionalFieldsConfig({});
            setAdditionalDataRange(oldObj => {});
        }
    }, [props.additionalFields])
    

    function onVideoNameClick(i) {
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
                        [f.name]: videoObj.additionalFields[i].path
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
        form.setFieldsValue({ videoName: e.target.value });

        const target = {
            value: e.target.value,
        };
        if (props.onVideoNameChange) {
            props.onVideoNameChange(target);
        }
    }

    function onVideoPathChange(e) {
        onRequiredFieldChange(e.target.value, 'videoPath');

        const target = {
            value: e.target.value,
        };

        if (props.onVideoPathChange) {
            props.onVideoPathChange(target);
        }
    }

    function onAdditionalFieldChange(e, fieldName) { 
        onRequiredFieldChange(e.target.value, fieldName);
    }

    function onRequiredFieldChange(value, fieldName) { 
        form.setFieldsValue({ [fieldName]: value });
        if (checkRequiredFields()) {
            setBtnDisable(false);
        } else {
            setBtnDisable(true);
        }
    }

    function checkRequiredFields() {
        const fields = form.getFieldsValue();
        if (fields.videoPath.length == 0) {
            return false;
        }
        
        for (let f in fields) {
            if (videoAdditionalFieldsConfig 
                && videoAdditionalFieldsConfig[f]?.required 
                && (!fields[f]?.length > 0)) {
                    return false;
                }
        }
        
        return true;
    }

    async function onAddBtnClick() {
        const id = new Date().getTime().toString();
        const videoInfoObj = modifyVideoData(id);
        
        const res = await postVideo(videoInfoObj);
        if (res['error']) {
            setInfo(res['error']);
        } else {
            setInfo(null);
        }
    }

    async function onAddLoadBtnClick() {
        const id = new Date().getTime().toString();
        const videoDataCopy =  modifyVideoData(id);

        const res = await postVideo(videoDataCopy);
        if (res['error']) {
            setInfo(res['error']);
            return;
        } else {
            setInfo(null);
        }

        if (videoDataCopy) {
            setLoadVideo(videoDataCopy);
            if (props.setModalOpen) {
                props.setModalOpen(false);
            }
        }
    }

    async function onEditBtnClick() {
        if (detailsVideoId) {
            const videoInfoObj = modifyVideoData(detailsVideoId);
            
            const res = await editVideo(videoInfoObj);
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
        let videoName = formFields.videoName;
        const videoPath = formFields.videoPath;
        if (!videoName?.length>0) {
            videoName = videoPath;
        }
        let additionalFieldsData;
        if (props.additionalFields?.length > 0) {
            additionalFieldsData = props.additionalFields.map(f => {
                return {name: f.name, path: formFields[f.name]}
            });
        }

        if (projectId) {
            const videoDataCopy = {...videoData};
            videoDataCopy[id] = {
                projectId: projectId,
                name: videoName,
                path: videoPath,
                additionalFields: additionalFieldsData
            };
            setVideoData(videoDataCopy);

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
        setInfo(null);
        const id = videoIds[i];
        if (id === videoId) {
            setInfo('This video is already loaded.');
            return
        }
        const videoObj = {...videoData[id]};
        videoObj.videoId = id;

        setLoadVideo(videoObj);
        if (props.setModalOpen) {
            props.setModalOpen(false);
        }
    }


    function onDelBtnClick(i) {
        const videoIdToDel = videoIds[i];

        Modal.confirm({
            title: 'Alert',
            content: 'The current video data including configuration and annotations will be removed!',
            onOk: async ()=>{await deleteThisVideo(videoIdToDel)},
        });
    }

    async function deleteThisVideo(videoIdToDel) {
        setInfo(null);
        const res = await deleteVideo(videoIdToDel);
        if (res['error']) {
            setInfo('Deleting video data in database failed!');
            return
        } 
        setInfo(res.info);
        
        if (videoIdToDel === detailsVideoId) {
            form.resetFields();
            setBtnDisable(true);
            setDetailsVideoId(null);
        }
        const videoDataCopy = {...videoData};
        delete(videoDataCopy[videoIdToDel]);
        setVideoData(videoDataCopy);


        if (videoIdToDel == videoId) {
            setVideoId(null);
            setResetVideoPlay(true);
            setResetChart(true);
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
                {projectId ? 
                    <div>
                        {videoNames.length>0 ? 
                            <List
                                size="small"
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
                            : null}
                        <div className='my-2 px-3 py-2' style={{border: '1px solid rgb(222, 226, 230)', borderRadius: '0.5em'}}>
                            <p className='my-2' style={{fontWeight: 'bold'}}>Video Details</p>
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
                                    >
                                    <Input 
                                        onChange={onVideoPathChange}
                                        allowClear/>
                                </Form.Item>

                                <Form.Item 
                                    name='videoName' 
                                    label="Video Name" 
                                    rules={[
                                        {
                                        message: 'If name is empty, will directly use path as name',
                                        },
                                    ]}
                                    >
                                    <Input 
                                        onChange={onVideoNameChange}
                                        allowClear/>
                                </Form.Item>

                                {props?.additionalFields?.length>0 ? 
                                    <p className='mt-2 mb-4'  style={{fontWeight: 'bold'}}>Additional Data</p>
                                    : null}

                                {props?.additionalFields?.length>0 ? 
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
                            </Form>
                        </div>
                    </div>
                :<p>Please initialize/upload a project first.</p>}
            <p>{info}</p>
        </>
    )
}