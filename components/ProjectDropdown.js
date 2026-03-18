import React, { useState } from "react";
import { useStateSetters, useStates } from "./AppContext";
import { Dropdown, Modal } from "antd";
import ProjectManager from "./ProjectManager.js";
import ModalJsonUploader from "./ModalJsonUploader.js";
import ProjectList from "./ProjectList.js";

/**
 *  This component is deprecated. Use DropdownMenu instead.
 *  props:
 *      //serverType: 'local' / 'remote'
 *      //uploaderOkClickHandler: will be called after natural behavior of uploading and updating projectConfigData.
 *      //uploaderCancelClickHandler: will be called after natural behavior of closing the uploader modal window
 *      onProjectNameChange: called after inherent behavior in ProjectManager
 *      onDescriptionChange: called after inherent behavior in ProjectManager

        // These props are passed to child ProjectManager, then further passed to BtnCofniguration
 *      groupType: set groupType for each child btnGroupController
        defaultBtnType: set defaultGroupType for each child btnGroupController
        btnType: set btnType for each child btnGroupController
        defaultBtnNum: set defaultBtnNum for each child btnGroupController
        btnNum: set btnNum for each child btnGroupController
        disableGroupTypeSelect: disable child btnGroupController's groupTypeSelect
        disableBtnTypeSelect: disable child btnGroupController's btnTypeSelect
        disableBtnNumInput: disable child btnGroupController's btnNumInput
        hidePlusBtn: whether to hide the + btn of adding btn group
*/
export default function ProjectDropdown(props) {
  const [managerOpen, setManagerOpen] = useState(false);
  const [managerStatus, setManagerStatus] = useState();
  const [uploaderOpen, setUploaderOpen] = useState(false);
  const [projectListOpen, setProjectListOpen] = useState(false);

  const setSaveConfig = useStateSetters().setSaveConfig;
  const projectId = useStates().projectId;

  const items = [
    {
      label: "New Project",
      key: "0",
    },
    {
      label: "Upload Project",
      key: "1",
    },
    {
      label: "Edit Project",
      key: "2",
    },
    {
      label: "Save Config",
      key: "3",
    },
    {
      label: "Exisiting Projects",
      key: "4",
    },
  ];

  function onClick(e) {
    const label = items[e.key].label;
    switch (label) {
      case "New Project":
        if (projectId) {
          confirm();
        } else {
          setManagerStatus("new");
          setManagerOpen(true);
        }
        break;
      case "Exisiting Projects":
        setProjectListOpen(true);
        break;
      case "Upload Project":
        setUploaderOpen(true);
        break;
      case "Edit Project":
        setManagerStatus("edit");
        setManagerOpen(true);
        break;
      case "Save Config":
        setSaveConfig(true);
        break;
    }
  }

  function confirmOkClickHandler() {
    setManagerStatus("new");
    setManagerOpen(true);
  }

  function cancelClickHandler() {
    setManagerOpen(false);
    setUploaderOpen(false);
  }

  function confirm() {
    Modal.confirm({
      title: "Alert",
      content:
        "The current project data including annotation buttons and unsaved annotations will be removed!",
      onOk: confirmOkClickHandler,
      onCancel: cancelClickHandler,
    });
  }

  return (
    <>
      <Dropdown
        menu={{
          items,
          onClick,
        }}
        trigger={["click"]}
      >
        <a
          style={{ width: "6em", textDecoration: "none", cursor: "pointer" }}
          onClick={(e) => e.preventDefault()}
        >
          Project
        </a>
      </Dropdown>

      <ProjectManager
        status={managerStatus}
        open={managerOpen}
        setOpen={setManagerOpen}
        defaultGroupType={props.defaultGroupType}
        groupType={props.groupType}
        defaultBtnType={props.defualtBtnType}
        btnType={props.btnType}
        defaultBtnNum={props.defaultBtnNum}
        btnNum={props.btnNum}
        disableGroupTypeSelect={props.disableGroupTypeSelect}
        disableBtnTypeSelect={props.disableBtnTypeSelect}
        disableBtnNumInput={props.disableBtnNumInput}
        hidePlusBtn={props.hidePlusBtn}
      />

      <ProjectList open={projectListOpen} setOpen={setProjectListOpen} />

      <ModalJsonUploader
        type="configuration"
        open={uploaderOpen}
        setOpen={setUploaderOpen}
      />
    </>
  );
}
