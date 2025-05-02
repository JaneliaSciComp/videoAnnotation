import React, {useState, useEffect, useRef} from 'react';
import { useStateSetters, useStates } from './AppContext'; 
import { List, Button, Form, Input, Space } from 'antd';
import { clearUnfinishedAnnotation, createId, addCategoryAnnoToFrameAnnotation } from '../utils/utils.js';
//import TextArea from 'antd/es/input/TextArea';


export default function NoteTakerBox({notes, setNotes}){

    const [info, setInfo] = useState(null);

    const [form] = Form.useForm();
    const { TextArea } = Input;
    const frameNum = useStates().frameNum; // put here, or inside function?  This needs to be recalled when it changes
    const frameUrl = useStates().frameUrl;
    const frameAnnotation = useStates().frameAnnotation; //The "Add" button will need to grab the state 'FrameAnnotation'?  
    // Or is this button meant to grab pre-existing annotations on this frame so that the current annotation will be added to them?
    const setFrameAnnotation = useStateSetters().setFrameAnnotation;
    const setActiveAnnoObj = useStateSetters().setActiveAnnoObj;
    const videoId = useStates().videoId;
    const annotationRef = useStates().annotationRef;
    //const notes = useStates().notes;
    //const setNotes = useStateSetters().setNotes; // only works if setNotes is defined in Workspace or AppContext (and passed thru Workspace)


    // When the frameNum changes, the Notes for the new frame are displayed
    //useEffect(() =>{modifyNotesData}, [frameNum])
    useEffect(() => {
        console.log("Type of setNotes:", typeof setNotes);
        if (frameNum=== undefined || !notes) return;
            console.log(frameNum);
            //console.log("This is undefined", notes[frameNum]);
            form.setFieldsValue({
                notes: notes[frameNum]? notes[frameNum]:"", // "Enter notes here"
            });
    }, [frameNum, form, notes])


    async function onEnter() {
        const id = new Date().getTime().toString();  // each item in the database has to have a unique ID
        
        const note = form.getFieldValue("notes");
        setNotes(prevNotes => ({...prevNotes, [frameNum]:note})) // Makes shallow copy of notes, appends current note
        setActiveAnnoObj(note);
        console.log("Current ntoes are: ", notes);
        console.log("Current NOTE is ", note);
        //notes[frameNum]= note;
        //console.log(note);
        //console.log(notes);


        //console.log(frameNum);
        //notes[frameNum] = TextArea.value;
        //notes[frameNum] = form.getFieldValue("notes");
        //console.log(notes[frameNum]);

        //const NotesInfoObj = modifyNotesData(id);  //TODO: Make this
        
        // call createSingleAnnotation()

        /*
        const res = await postNotes(NotesInfoObj); //TODO: Make this
        if (res['error']) {
            setInfo(res['error']);
        } else {
            setInfo(null);
        }
            */
    }


    // From Category.js, line 74
    function createNoteAnnotation() {
            console.log('createNoteAnnotation');
            setInfo(null);
            if ((Number.isInteger(frameNum) || frameUrl) /*&& !(intervalAnno.on && intervalAnno.label===props.label)*/) {
                /*if (intervalAnno.on && intervalAnno.label!==props.label) {
                    endIntervalAnnotation('differentLabel');
                    setIntervalAnno(oldObj => {return {on:false, startFrame: null, videoId:null, label: null, color: null, annotatedFrames: new Set()}});
                }*/ //You may want interval annotation for notes later; for right now, simply do it by frame
    
                //const annoCopy = clearUnfinishedAnnotation({...frameAnnotation}); // Purpose?
    
                const id = createId();
                const annoObj = {
                    id: id,
                    videoId: videoId,
                    frameNum: frameNum,
                    label: props.label,
                    color: color,
                    type: 'category',        
                };
                
                //addCategoryAnnoToFrameAnnotation(annoObj, annoCopy,  mutualExclusiveCategory) // checks if frame already labeled with a category, since categories are mutually-exclusive
                //console.log('createSingleAnnotation', annoCopy);
                setFrameAnnotation(oldObj => annoCopy);
                //setActiveAnnoObj(annoObj);
                //setDrawType(null);
                //setSkeletonLandmark(null);
                //setUndo(0);
                //setUseEraser(null);
                annotationRef.current[frameNum] = annoCopy;
                setUpdateAnnotationChart(true);
            }
    }

    // Copied from VideoManager or VideoUploader... needed in order to modify existing notes??
    function modifyNotesData(id) {
        let formFields = form.getFieldsValue();
 
        const notes = formFields.notes;
        console.log(notes); //Be sure the thing above actually grabs the notes

        // This part needs to be copied from an annotation thing
        /* We need:
            - project id    (Lingqi might have multiple videos in 1 project, so important for organization)
            - video id      (see note above)
            - annotation id (created with date time in onSaveFrameBtnClick)
            - notes         (from form)
        */

        if (projectId) {  // why is this not formatted:  "project id? do stuff : initialize a project first"
            const notesDataCopy = {...videoData};
            notesDataCopy[id] = {
                projectId: projectId,
                name: notesName,
            };
            setVideoData(notesDataCopy);

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

    return (
        <>
            <TextArea placeholder="Enter notes here:" onPressEnter={onEnter} rows={10} style={{width: '100%'}} />                        
        </>
    )
}

// TODO: enable Interval Annotations