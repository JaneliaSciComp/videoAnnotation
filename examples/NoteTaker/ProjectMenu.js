import ProjectList from "./ProjectList";  
import ProjectManager from "./ProjectManager";
import ModalJsonUploader from "./ModalJsonUploader";
import DownloadBtn from "./DownloadBtn";
import DropdownMenu from "./DropdownMenu";
import { useState } from "react";

export default function ProjectMenu() {
    const [projectListOpen, setProjectListOpen] = useState(false);
    const [newProjectManagerOpen, setNewProjectManagerOpen] = useState(false);
    const [editProjectManagerOpen, setEditProjectManagerOpen] = useState(false);
    const [configUploaderOpen, setConfigUploaderOpen] = useState(false);

    const projectDropdownItems = [
        {
          label: 'Exisiting Projects',
          compName: 'ProjectList', // When pass a component, it is required to have a compName prop whose value should be equivalent to the name of the component, e.g. <ProjectList>'s compName is 'ProjectList'.
          component: <ProjectList 
                      key='0' // When pass a component to a child, it is required to have a unique key prop.
                      open={projectListOpen}
                      setOpen={setProjectListOpen}
                    />,
          // preventDefault: true, // when use some built-in components as the children of DropdownMenu, there may be some pre-defined behaviors, such as opening a modal window. To prevent the default behavior, set this to true.
        },
        {
          label: 'New Project',
          compName: 'ProjectManager',
          component: <ProjectManager 
                      key='1'
                      status='new' // ProjectManager has two status: 'new' and 'edit'. 'new' mode is for creating a new project, and 'edit' mode is for editing an existing project.
                      open={newProjectManagerOpen} 
                      setOpen={setNewProjectManagerOpen}
                      defaultGroupType='skeleton'
                      defaultBtnType='skeleton'
                      disableGroupTypeSelect
                      disableBtnTypeSelect
                      hidePlusBtn
                      // Need a way to make there be no buttons whatsoever associated with the project
                    />,
        },
        {
          label: 'Upload Project',
          compName: 'ModalJsonUploader',
          component: <ModalJsonUploader 
                      key='2'
                      type='configuration' // ModalJsonUploader has two types: 'configuration' and 'annotation'. 'configuration' is for uploading a configuration file, and 'annotation' is for uploading an annotation file.
                      open={configUploaderOpen} 
                      setOpen={setConfigUploaderOpen}
                    />, 
        },
        {
          label: 'Edit Project',
          compName: 'ProjectManager',
          component: <ProjectManager
                      key='3' 
                      status='edit' 
                      open={editProjectManagerOpen} 
                      setOpen={setEditProjectManagerOpen}
                      // defaultGroupType='category'
                      // defaultBtnType='category'
                      // disableGroupTypeSelect
                      // disableBtnTypeSelect
                      // hidePlusBtn
                    />, 
        },
        {
          label: 'Download Configuration',
          compName: 'DownloadBtn',
          component: <DownloadBtn 
                      key='4'
                      type='configuration'  // DownloadBtn has two types: 'configuration' and 'annotation'. 'configuration' is for saving the configuration data, and 'annotation' is for saving the annotation data.
                      mode='inMenu' // DownloadBtn has two modes: 'inMenu' and 'solely'. 'inMenu' is used when the DownloadBtn is used in a dropdown menu, and 'solely' is used when the DownloadBtn is used as a standalone button. This prop affects the UI of the DownloadBtn.
                    />,
        },
      ];
      
      function projectDropdownClickHandler(e) {
      }
    
    return(
      <DropdownMenu name='Project' menu={projectDropdownItems} onClick={projectDropdownClickHandler}/>
    )
}