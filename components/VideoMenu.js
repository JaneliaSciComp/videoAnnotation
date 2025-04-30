import { Modal } from "antd";
import VideoManager from "./VideoManager";
import CanvasAdditionalDataController from "./CanvasAdditionalDataController";
import { useState } from "react";
import DropdownMenu from "./DropdownMenu";

export default function VideoMenu() {
    const [videoManagerOpen, setVideoManagerOpen] = useState(false);
    const [canvasAdditionalDataControllerOpen, setCanvasAdditionalDataControllerOpen] = useState(false);
    
    const videoDropdownItems = [
        {
            label: 'Video Manager',
            compName: 'VideoManager',
            component: <Modal  // Modal = popup box, imported from AntDesign
                        key='0'  
                        title='Video Manager'
                        open={videoManagerOpen}
                        setOpen={setVideoManagerOpen}
                        onCancel={() => setVideoManagerOpen(false)}
                        style={{overflowX: 'auto'}}
                        footer={null}
                    >
                        <VideoManager 
                        setModalOpen={setVideoManagerOpen} // To allow the child to contorl the visibility of the modal window, e.g. when the user clicks the 'load' or 'add and load' button.
                        />
                    </Modal>,
        },
        {
            label: 'Additional Data For Canvas',
            compName: 'CanvasAdditionalDataController',
            component: <Modal
                        key='1'
                        title='Canvas Additional Data Controller'
                        open={canvasAdditionalDataControllerOpen}
                        setOpen={setCanvasAdditionalDataControllerOpen}
                        onCancel={() => setCanvasAdditionalDataControllerOpen(false)}
                        style={{overflowX: 'auto'}}
                        footer={null}
                    >
                        <CanvasAdditionalDataController 
                            // hideRange  //Hide the range input.
                            // halfRange={2} //Allow developer to set half range value when hideRange is true. Required and only useful when hideRange is true.
                            defaultHalfRange={1} // Default value for half range input. Should only be used when hideRange is false.
                        />
                    </Modal>,
        },
    ];  
        
    function videoDropdownClickHandler(e) {
    // TODO: customize click handler
    }
        
    return (
        <DropdownMenu name='Video' menu={videoDropdownItems} onClick={videoDropdownClickHandler}/>
    ) 
}
          