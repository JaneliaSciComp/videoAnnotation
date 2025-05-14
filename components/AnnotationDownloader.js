import React, { useState, useEffect } from 'react';
import { Modal, Input, Button } from 'antd';

export default function AnnotationDownloader({notes, annotationDownloadOpen, setAnnotationDownloadOpen}){
  const [fileName, setFileName] = useState('annotations');

  function onDownloadBtnClick() { //What if there's no project or video loaded?  
      setAnnotationDownloadOpen(true);
    } 
  
  useEffect(()=>{
    if (annotationDownloadOpen) {  
      setFileName("videoname");
      console.log("setting videoname");
    }
  }, [annotationDownloadOpen]);
      
  function onSaveBtnClick(){
    console.log("onSaveBtnClick");
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
     
  return( 
    <Modal 
      title={'Download notes'}
      footer={() => null}
      open={annotationDownloadOpen}
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
  )
}