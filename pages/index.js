import React, { useState } from "react";
import Head from "next/head";
import Workspace from "../components/Workspace.js";
import Canvas from "../components/Canvas.js";
import VideoUploader from "../components/VideoUploader.js";
import BtnContainer from "../components/BtnContainer.js";
import AnnotationTable from "../components/AnnotationTable.js";
import DownloadBtn from "../components/DownloadBtn.js";
import ProjectManager from "../components/ProjectManager.js";
import ModalJsonUploader from "../components/ModalJsonUploader.js";
import VideoManager from "../components/VideoManager.js";
import CanvasAdditionalDataController from "../components/CanvasAdditionalDataController.js";
import DropdownMenu from "../components/DropdownMenu.js";
import ProjectList from "../components/ProjectList.js";
import SaveAnnotationBtn from "../components/SaveAnnotationBtn.js";
import InfoBar from "../components/InfoBar.js";
import { Row, Col } from "react-bootstrap"; // Third party components. Refer to the tutorial on https://react-bootstrap.netlify.app/docs/layout/grid
import { Menu, Modal } from "antd"; // Third party components. Refer to the tutorial on https://ant.design/components/menu, and https://ant.design/components/modal
import { drawCircle, drawLine } from "../utils/canvasUtils.js"; // canvasUtils.js is a wrapper of fabric.js. It provides functions to operate on canvas easily. Currently, only these two functions are provided.

// Client side components. They cannot be rendered on the server side, thus need to be explicitly marked as client side comp.
import dynamic from "next/dynamic";

const AdditionalDataChart = dynamic(
  () => import("../components/AdditionalDataChart.js"),
  { ssr: false },
);
const AnnotationChart = dynamic(
  () => import("../components/AnnotationChart.js"),
  { ssr: false },
);

export default function Home() {
  // The ..open/set..Open states are to allow the child modal components to control the visibility of themselves when some interval UI events happen, such as clicking on cancel button.
  const [newProjectManagerOpen, setNewProjectManagerOpen] = useState(false);
  const [editProjectManagerOpen, setEditProjectManagerOpen] = useState(false);
  const [configUploaderOpen, setConfigUploaderOpen] = useState(false);
  const [projectListOpen, setProjectListOpen] = useState(false);
  const [videoManagerOpen, setVideoManagerOpen] = useState(false);
  const [annotationUploaderOpen, setAnnotationUploaderOpen] = useState(false);
  const [
    canvasAdditionalDataControllerOpen,
    setCanvasAdditionalDataControllerOpen,
  ] = useState(false);
  const [info] = useState(null); // To display feedback info
  const [newFrameNum, setNewFrameNum] = useState();

  const projectDropdownItems = [
    {
      label: "Exisiting Projects",
      compName: "ProjectList", // When pass a component, it is required to have a compName prop whose value should be equivalent to the name of the component, e.g. <ProjectList>'s compName is 'ProjectList'.
      component: (
        <ProjectList
          key="0" // When pass a component to a child, it is required to have a unique key prop.
          open={projectListOpen}
          setOpen={setProjectListOpen}
          // onProjectLoad={(e) => {console.log('onProjectLoad', e)}}
        />
      ),
      // preventDefault: true, // when use some built-in components as the children of DropdownMenu, there may be some pre-defined behaviors, such as opening a modal window. To prevent the default behavior, set this to true.
    },
    {
      label: "New Project",
      compName: "ProjectManager",
      component: (
        <ProjectManager
          key="1"
          status="new" // ProjectManager has two status: 'new' and 'edit'. 'new' mode is for creating a new project, and 'edit' mode is for editing an existing project.
          open={newProjectManagerOpen}
          setOpen={setNewProjectManagerOpen}
          // defaultGroupType='category'
          // defaultBtnType='category'
          // disableGroupTypeSelect
          // disableBtnTypeSelect
          // hidePlusBtn
          // onSubmit= {(e) => {console.log('onSubmit', e.data)}}
          // onProjectNameChange={(e) => {console.log('onProjectNameChange', e)}}
          // onDescriptionChange={(e) => {console.log('onDescriptionChange', e)}}
        />
      ),
    },
    {
      label: "Upload Project",
      compName: "ModalJsonUploader",
      component: (
        <ModalJsonUploader
          key="2"
          type="configuration" // ModalJsonUploader has two types: 'configuration' and 'annotation'. 'configuration' is for uploading a configuration file, and 'annotation' is for uploading an annotation file.
          open={configUploaderOpen}
          setOpen={setConfigUploaderOpen}
        />
      ),
    },
    {
      label: "Edit Project",
      compName: "ProjectManager",
      component: (
        <ProjectManager
          key="3"
          status="edit"
          open={editProjectManagerOpen}
          setOpen={setEditProjectManagerOpen}
          // defaultGroupType='category'
          // defaultBtnType='category'
          // disableGroupTypeSelect
          // disableBtnTypeSelect
          // hidePlusBtn
        />
      ),
    },
    {
      label: "Download Configuration",
      compName: "DownloadBtn",
      component: (
        <DownloadBtn
          key="4"
          type="configuration" // DownloadBtn has two types: 'configuration' and 'annotation'. 'configuration' is for saving the configuration data, and 'annotation' is for saving the annotation data.
          mode="inMenu" // DownloadBtn has two modes: 'inMenu' and 'solely'. 'inMenu' is used when the DownloadBtn is used in a dropdown menu, and 'solely' is used when the DownloadBtn is used as a standalone button. This prop affects the UI of the DownloadBtn.
        />
      ),
    },
  ];

  function projectDropdownClickHandler(e) {
    /**
     * Click event handler for DropdownMenu. Will be called after the default behavior of each child.
     * e is the event object which has a key property corresponding to the index(integer) of each child in the 'menu' prop. This may be different with the 'key' prop of the component passed to each child.
     * */
    // console.log(e);
    // TODO: customize click handler
    // const label = projectDropdownItems[e.key].label;
    // switch (label) {
    //   case 'Exisiting Projects':
    //       setInfo('Exisiting Projects');
    //       break;
    //   case 'New Project':
    //       setInfo('New Project');
    //       break;
    //   case 'Upload Project':
    //       setInfo('Upload Project');
    //       break;
    //   case 'Save Annotation':
    //       setInfo('Save Annotation');
    //       break;
    //   case 'Edit Project':
    //       setInfo('Edit Project');
    //       break;
    //   case 'Download Configuration':
    //       setInfo('Download Configuration');
    //       break;
    // }
  }

  const projectDropdown = (
    <DropdownMenu
      name="Project"
      menu={projectDropdownItems}
      onClick={projectDropdownClickHandler}
    />
  );

  const videoDropdownItems = [
    {
      label: "Video Manager",
      compName: "VideoManager",
      component: (
        <Modal
          key="0"
          title="Video Manager"
          open={videoManagerOpen}
          setOpen={setVideoManagerOpen}
          onCancel={() => setVideoManagerOpen(false)}
          style={{ overflowX: "auto" }}
          footer={null}
        >
          <VideoManager
            setModalOpen={setVideoManagerOpen} // To allow the child to contorl the visibility of the modal window, e.g. when the user clicks the 'load' or 'add and load' button.
            /**
             * name: str, // required and unique, used as var name, no white space allowed.
             * label: str, // required, label shown to the user, allow white space
             * required: boolean, // false by default
             * loadIn: 'canvas'/'chart'/null, // whether to draw the data on canvas/chart with each frame. If yes, will fetch the data from backend and ask canvas/chart to draw it
             * onLoad: event handler. Can be used to draw shapes on canvas and so on. required when loadin='canvas'
             */
            // additionalFields={[
            //   {name: 'canvas1', label: 'canvas1', required: true, loadIn: 'canvas', onLoad: drawDataAsCircle},
            //   {name: 'canvas2', label: 'canvas2', required: true, loadIn: 'canvas', onLoad: drawDataAsLine},
            //   {name: 'chart1', label: 'chart1', required: true, loadIn: 'chart'},
            //   {name: 'chart2', label: 'chart2', required: true, loadIn: 'chart'}
            // ]}
          />
        </Modal>
      ),
    },
    {
      label: "Additional Data For Canvas",
      compName: "CanvasAdditionalDataController",
      component: (
        <Modal
          key="1"
          title="Canvas Additional Data Controller"
          open={canvasAdditionalDataControllerOpen}
          setOpen={setCanvasAdditionalDataControllerOpen}
          onCancel={() => setCanvasAdditionalDataControllerOpen(false)}
          style={{ overflowX: "auto" }}
          footer={null}
        >
          <CanvasAdditionalDataController
            // hideRange  //Hide the range input.
            // halfRange={2} //Allow developer to set half range value when hideRange is true. Required and only useful when hideRange is true.
            defaultHalfRange={1} // Default value for half range input. Should only be used when hideRange is false.
          />
        </Modal>
      ),
    },
  ];

  function drawDataAsCircle(params) {
    /**
     * OnLoad event handler for the additional data for canvas.
     *
     * params: {
     *      target: fabric obj needed for the drawing. Just pass it to the imported func from canvasUtils.js
     *      data: [additional data in needed range]
     * }
     */
    for (let c of params.data) {
      c.push(3); // add radius
      drawCircle(params.target, c, "red");
    }
  }

  function videoDropdownClickHandler() {
    // TODO: customize click handler
  }

  const videoDropdown = (
    <DropdownMenu
      name="Video"
      menu={videoDropdownItems}
      onClick={videoDropdownClickHandler}
    />
  );

  const annotationDropdownItems = [
    {
      label: "Save Annotation",
      compName: "SaveAnnotationBtn",
      component: <SaveAnnotationBtn key="0" mode="inMenu" />,
    },
    {
      label: "Download Annotation",
      compName: "DownloadBtn",
      component: <DownloadBtn key="1" type="annotation" mode="inMenu" />,
    },
    {
      label: "Upload Annotation",
      compName: "ModalJsonUploader",
      component: (
        <ModalJsonUploader
          key="2"
          type="annotation"
          open={annotationUploaderOpen}
          setOpen={setAnnotationUploaderOpen}
        />
      ),
    },
  ];

  function annotationDropdownClickHandler() {
    // TODO: customize click handler
  }

  const annotationDropdown = (
    <DropdownMenu
      name="Annotation"
      menu={annotationDropdownItems}
      onClick={annotationDropdownClickHandler}
    />
  );

  const menubarItems = [
    {
      label: projectDropdown,
      key: "0",
    },
    {
      label: videoDropdown,
      key: "1",
    },
    {
      label: annotationDropdown,
      key: "2",
    },
  ];

  return (
    <div>
      <Head>
        <title>Annotator</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

        <Menu items={menubarItems} mode="horizontal" />
        <div className="py-2">
          {/* If state info is null, InfoBar will only display predefined information for events. Otherwise, will display both predefined and contents of the info state */}
          <InfoBar customInfo={info} />
        </div>

        <Row>
          <Col lg="auto">
            {/* <canvas width={350} height={250} style={{border: 'solid'}}/> */}
            <AnnotationTable width={350} height={250} scrollY={230} ellipsis />
            <BtnContainer />
          </Col>
          <Col>
            <button
              onClick={() =>
                setNewFrameNum(newFrameNum ? newFrameNum + 10 : 10)
              }
            >
              FrameNum+10
            </button>
            <Canvas width={550} height={350} />
            <VideoUploader
              hideSubmit
              // frameBufferSeconds={0.1}
              // onFrameChange={(e)=>console.log('onFrameChange', e.frameNum)}
              setFrameNum={newFrameNum}
            />
            <div
              className="py-2"
              style={{
                height: "150px",
                width: "670px",
                border: "solid 1px black",
              }}
            >
              {/* <div style={{height: '50%', width: '650px'}}> */}
              {<AnnotationChart labels={["chase", "no-chase"]} />}
              {/* </div> */}
              {/* <div className='my-1' style={{height: '50%', width: '650px'}}>
                <AnnotationChart 
                  labels = {['grooming']} //TODO: should be replaced by another ChartController component
                  // omitXLabels
                />
                </div> */}
            </div>
          </Col>
        </Row>
    </div>
  );
}
