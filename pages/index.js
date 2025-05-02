import React, {useEffect, useState} from 'react';
import Head from 'next/head';
import Workspace from '../components/Workspace.js';
import Canvas from '../components/Canvas.js';
import VideoUploader from '../components/VideoUploader.js';
import InfoBar from '../components/InfoBar.js';
import {Container, Row, Col} from 'react-bootstrap'; // Third party components. Refer to the tutorial on https://react-bootstrap.netlify.app/docs/layout/grid
import { Menu, Modal, Form, Input, Button, Table } from 'antd'; // Third party components. Refer to the tutorial on https://ant.design/components/menu, and https://ant.design/components/modal
import AnnotationUploader from '../components/AnnotationUploader.js';
import AnnotationDownloader from '../components/AnnotationDownloader.js';
import NoteTakerBox from '../components/NoteTakerBox.js';
import NotesChart from '../components/NotesChart.js';

// Client side components. They cannot be rendered on the server side, thus need to be explicitly marked as client side comp.
import dynamic from 'next/dynamic';

import ProjectMenu from '../components/ProjectMenu.js';
import VideoMenu from '../components/VideoMenu.js';
import { clearUnfinishedAnnotation, createId, addCategoryAnnoToFrameAnnotation } from '../utils/utils.js';

//DELETE this after videoID is open in the API
import { useStates, useStateSetters } from '../components/AppContext.js';

export default function Home() {
  // The ..open/set..Open states are to allow the child modal components to control the visibility of themselves when some interval UI events happen, such as clicking on cancel button.
  const [info, setInfo] = useState(''); // To display feedback info
  
  const [form] = Form.useForm();
  const [frameNumber, setFrameNumber] = useState('');
  const [notes, setNotes] = useState([]);  // was ({})  // Not pulling from annotations because I only want chart to show notes, not others annotations
  //let annotations = {};  // Still don't completely understand why this version doesn't work
  const [annotationUploadOpen, setAnnotationUploadOpen] = useState(false);
  const [annotationDownloadOpen, setAnnotationDownloadOpen] = useState(false);
  const [fileName, setFileName] = useState('annotations');
  const videoId = 123 || useStates().videoId; // DELETE this after videoID is open in the API safely
  const frameUrl = 123 || useStates().frameUrl; //DELETE this after frameUrl is open in the API safely

  //Keyboard shortcuts
  const handleShiftRight = (event) => {
    if (event.shiftKey && event.key=="ArrowRight"){
      setFrameNumber(frameNumber + 20);
    }
  }

  const MenubarItems = [
    {
      label: <ProjectMenu />,
      key: '0',
    },
    {
      label: <VideoMenu />,
      key: '1',
    }
  ]

  // This needs to be its own thing, along with the necessary states, etc.
  //------ own thing ------
  function createSingleAnnotation(note) {
    console.log('createNoteAnnotation');
    //setInfo(null);
    if (Number.isInteger(frameNumber) || frameUrl) {
        /*if (intervalAnno.on && intervalAnno.label!==props.label) {
            endIntervalAnnotation('differentLabel');
            setIntervalAnno(oldObj => {return {on:false, startFrame: null, videoId:null, label: null, color: null, annotatedFrames: new Set()}});
        }*/ //You may want interval annotation for notes later; for right now, simply do it by frame

        const annoCopy = clearUnfinishedAnnotation({}); //supposed to pass in ...frameAnnotation, but can't bc that's not open in the API
        console.log('annoCopy', annoCopy);

        const id = createId();
        const annoObj = {
            id: id,
            videoId: videoId, //Still need this
            frameNum: frameNumber,
            label: 'note',
            type: 'note',
            data: note,        
        };
        //addCategoryAnnoToFrameAnnotation(annoObj, annoCopy,  mutualExclusiveCategory)
        annoCopy[annoObj.id] = annoObj; // this line replaces the previous line
        console.log('createSingleAnnotation', annoCopy);
        //setFrameAnnotation(oldObj => annoCopy);
        //setActiveAnnoObj(annoObj);
        //annotationRef.current[frameNumber] = annoCopy;
    }
  }

  // ----- AnnotationDownloader (onDownloadBtnClick and ModalAnnotationDownloader) -----
  /*
  function onDownloadBtnClick() { //What if there's no project or video loaded?  
    setAnnotationDownloadOpen(true);
  } 


/* 
  const ModalAnnotationDownloader = 
    <Modal 
      title={'Download notes'}
      footer={() => null}
      open={annotationDownloadOpen}
      setOpen={setAnnotationDownloadOpen}
      onCancel={() => setAnnotationDownloadOpen(false)}
      >
      <div className='my-4 d-flex justify-content-center'>
      <div style={{width: '100%'}}>
        Please name your file:
        <Input defaultValue='videoname' onChange={(e)=>setFileName(e.target.value)} value={fileName} addonAfter='.json' onPressEnter={onSaveBtnClick} />
        <Button onClick={onSaveBtnClick}>Save</Button>
      </div>
      </div>
    </Modal>


  // ----- This is its own thing... don't think it can be a part of another component -----
  // Changes to make:
  // 1. Save onEnter --> Done
  // 2a. Name: User-designated name for document --> Done
  // 2b. Name: Defaults to anything (precurser to 2c) --> Done
  // 2c. Name: Defaults to video name --> NOT DONE.  Need open API for fetching video data.
  // 3. Save only when a video is loaded --> NOT DONE.  Need open API for fetching video data
  // 4. Save annotations to the database --> not started
  function onSaveBtnClick(){
    const finalFileName = fileName;
    console.log('filename: ', fileName)
    setAnnotationDownloadOpen(false);
    const jsonAnno = JSON.stringify(notes);  
    const blobAnno = new Blob([jsonAnno], {type: 'text/plain'});  
    const a = document.createElement("a");  
    a.href = URL.createObjectURL(blobAnno);  
    console.log("AnnotationName:", fileName);
    a.download = finalFileName + '.json';
    a.click();
    URL.revokeObjectURL(a.href);
  }
    */
  
  // Input is also used in ModalAnnoutationDownloader (line 220)
  // Would it be better to say "const { downloadInput } = Input;" so these 2 are not confused?
  // --> apparently not necessary.  See antDesign's example "with clear icon".
  const { TextArea } = Input;


  /*function onEnter() {
    console.log("Data source format is: ", dataSource);
    const note = form.getFieldValue("notes");
    setNotes(prevNotes => ({...prevNotes, [frameNumber]:note})); 
    createSingleAnnotation(note);
    console.log("Notes: ", notes);
    // TODO: add a line that also modifies the NotesTable --> seems to do this on its own
  }
    */

  //frameChangeHandler
  // on frame change, this will update the text box with the correct annotation
  function frameChangeHandler(props) {
    //frameNum is broken; get frameNum directly from
    const frameNumber = props.frameNum; // This is a safe way to give the developer the frameNum value. --> But how does it know where to get frameNum?
    console.log("Frame number is: ", frameNumber);
    setFrameNumber(frameNumber);
    //const note = notes[frameNumber]; // --> TODO: add annotations as a dictionary
    form.setFieldsValue({
      notes: notes[frameNumber]? notes[frameNumber]:"", //Enter notes here
  });
  }

  // ----- AnnotationUploader (onUploadBtnClick and ModalAnnotationUploader) -----
  function onUploadBtnClick(){
    setAnnotationUploadOpen(true);
  }

  function onDownloadBtnClick(){
    setAnnotationDownloadOpen(true);
    console.log("onDownloadBtnClick");
  }

  const ModalAnnotationUploader =
    <Modal 
      title={'Upload notes'}
      footer={() => null}
      open={annotationUploadOpen}
      setOpen={setAnnotationUploadOpen}
      onCancel={() => setAnnotationUploadOpen(false)}
      >
      <div className='my-4 d-flex justify-content-center'>
      <div style={{width: '100%'}}>
      <AnnotationUploader 
        setModalOpen={setAnnotationUploadOpen}
        setNotes={setNotes}/>
      </div>
      </div>
    </Modal>


// ----- dataSource and columns should be in their own NotesTable.js file -----

  // Notes table
  const dataSource = Object.entries(notes).map(([key, note]) => ({
    key: parseInt(key), 
    frameNumber: parseInt(key, 10)+1,
    note
  }));

  // TODO: <a> is a hyperlink which should allow me to call a function for jumping to that particular frame
  // TODO: "note" needs to be an abbreviated form of note... like, first 10 characters + "..."
  // TODO: frameNum column takes up too much space.  Make its column smaller
  const columns = [
    {
      title: "Frame",
      dataIndex: "frameNumber",
      key: "frameNumber",
      render: (text) => <a>{text}</a> // need to link this to the given frame
    },
    {
      title: "Note",
      dataIndex: "note",
      key: "note",
      render: (text) => <a>{text}</a>
    }
  ]  
  

  return (
    <div className="container min-vh-100 min-vw-100 d-flex flex-column justify-content-between">
      <Head>
        <title>Annotator</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Workspace > 
        <Menu items={MenubarItems} mode="horizontal"/>
        <div className='py-2'>
          <InfoBar info={info} /> 
        </div>
        

        <Row style={{minHeight:'150px'}}>
          <Canvas height={450} width={1500}/>
          {/*<Canvas/>*/}
        </Row>
        <Row>
          <VideoUploader 
            width={500}
            hideSubmit 
            onFrameChange={frameChangeHandler}
            />
        </Row>


        <Row style={{height: '20%'}}>
          <Col style={{width: '80%'}}>
          <Form className='my-2 mx-3' form={form} size='small'>
              <Form.Item name="notes" >
                  {/*<TextArea placeholder="Enter notes here:" onPressEnter={onAddBtnClick} rows={10} style={{width: '100%'}} />*/}
                  <NoteTakerBox notes={notes} setNotes={setNotes} placeholder="Enter notes here:" rows={10} style={{width: '100%'}} />
              </Form.Item>
              <Form.Item>
                  {/*<Button className='my-2 mx-2' onClick={onAddBtnClick}>Save Note</Button>*/}
                  <Button className='my-2 mx-2' onClick={()=> setAnnotationDownloadOpen(true)}>Download Notes</Button>
                  {<AnnotationDownloader annotationDownloadOpen={annotationDownloadOpen} setAnnotationDownloadOpen={setAnnotationDownloadOpen}/>}
                  <Button className='my-2 mx-2' onClick={onUploadBtnClick}>Upload Notes</Button>
                  {ModalAnnotationUploader}
              </Form.Item>
            </Form>
            </Col>
            <Col style={{width: '20%'}}>
              {/*<Table dataSource={dataSource} columns={columns}>Notes Table</Table>*/}
              <NotesChart notes={notes}/>
            </Col>
        </Row>

      </Workspace>
    </div>
  )
}

