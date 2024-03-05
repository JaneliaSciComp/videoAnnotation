import React, {useState, useEffect, useRef} from 'react';
import { useStateSetters, useStates } from './AppContext'; 
import { Modal, List, Button } from 'antd';
import { PlayCircleOutlined, DeleteOutlined } from '@ant-design/icons';


/**
 *  props:
 *      open: boolean. Whether to open the modal window
 *      setOpen: setter of open. In order to give controll to VideoManager's internal buttons.
 *      // serverType: 'local' / 'remote'
 *      
 *      VideoManager will generate videos data for project.
 *      For reference, projectConfigDataRef: 
 *          {
 *              projectName: str,
 *              // projectDirectory: (no need. user still has to upload/save files mannually) Only for local server. '/user/project1', a str pointing to a local folder where all annotation and config data are stored.
 *              description: str, optional
 *              *** videos: {videoId: 'dir', ...} ***
 *          }
 */
export default function VideoManager(props) {
    
    const [data, setData] = useState(['video1', 'video2']); //data source for list. [str...]

    
    const projectConfigDataRef = useStates().projectConfigDataRef;
    
    // const [form] = Form.useForm();

    useEffect(() => {
        if (props.open) {
            
        }
          
    }, [props.open])
    

    function okClickHandler() {
        // console.log('ok', projectName, description);
        projectConfigDataRef.current =  {
            projectName: projectName,
            description: description,
            // btnConfigData: {...btnConfigData}
        }

        props.setOpen(false);
    }


    function cancelClickHandler() {
        props.setOpen(false);
    }

    function onChange(e) {
        // console.log('projectName', e, projectName);
       
    }

    function onChange(e) {
        // console.log('description', e.target.value);
       
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
                    dataSource={data}
                    renderItem={(item) => 
                        <List.Item>
                            <span style={{width:'70%'}}>{item}</span>
                            <div >
                                <Button icon={<PlayCircleOutlined />} />
                                <Button icon={<DeleteOutlined />} />
                            </div>
                            
                        </List.Item>
                    }
                    />
                
            {/* </Modal> */}
        </>
    )
}