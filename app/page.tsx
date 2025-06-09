"use client";

import React, { useState } from 'react';
import Head from 'next/head';
import Canvas from '../components/Canvas.js';
import VideoUploader from '../components/VideoUploader.js';
import InfoBar from '../components/InfoBar.js';
import { Row, Col } from 'react-bootstrap'; 
import { Menu, Modal, Form, Button } from 'antd';
import AnnotationUploader from '../components/AnnotationUploader.js';
import AnnotationDownloader from '../components/AnnotationDownloader.js';
import NoteTakerBox from '../components/NoteTakerBox.js';
import NotesChart from '../components/NotesChart.js';
import ProjectMenu from '../components/ProjectMenu.js';
import VideoMenu from '../components/VideoMenu.js';
import renderBtnGroup from '../components/Workspace.js';  // was { renderBtnGroup }


export default function Home() {
  const [info, setInfo] = useState(''); // To display feedback info
  const [form] = Form.useForm();
  const [notes, setNotes] = useState([]);  
  const [annotationUploadOpen, setAnnotationUploadOpen] = useState(false);
  const [annotationDownloadOpen, setAnnotationDownloadOpen] = useState(false);


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

  function myFunction(){
    stuff = renderBtnGroup();
  }

  // ----- AnnotationUploader (onUploadBtnClick and ModalAnnotationUploader) -----
  // This should allow local annotations to be uploaded/downloaded to/from a project
  function onUploadBtnClick(){
    setAnnotationUploadOpen(true);
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

  

  return (
    <div className="container min-vh-100 min-vw-100 d-flex flex-column justify-content-between">
      <Head>
        <title>Annotator</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Menu items={MenubarItems} mode="horizontal"/>
      <div className='py-2'>
        <InfoBar info={info} /> 
      </div>
      

      <Row style={{minHeight:'150px'}}>
        <Canvas height={450} width={1500}/>
      </Row>
      <Row>
        <VideoUploader 
          width={500}
          hideSubmit 
          />
      </Row>


      <Row style={{height: '20%'}}>
        <Col style={{width: '80%'}}>
          <NoteTakerBox notes={notes} setNotes={setNotes} />
          <Form className='my-2 mx-3' form={form} size='small'>
            <Form.Item>
                <Button className='my-2 mx-2' onClick={()=> setAnnotationDownloadOpen(true)}>Download Notes</Button>
                {<AnnotationDownloader notes={notes} annotationDownloadOpen={annotationDownloadOpen} setAnnotationDownloadOpen={setAnnotationDownloadOpen}/>}
                <Button className='my-2 mx-2' onClick={onUploadBtnClick}>Upload Notes</Button>
                {ModalAnnotationUploader}
            </Form.Item>
          </Form>
          </Col>
          <Col style={{width: '20%'}}>
            <NotesChart notes={notes}/>
          </Col>
        </Row>
    </div>
  )
}

