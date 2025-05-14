import React, {useState, useEffect} from 'react';
import { useStateSetters, useStates } from './AppContext'; 
import { Form, Input } from 'antd';
import { createId } from '../utils/utils.js';


export default function NoteTakerBox({notes, setNotes}){

    const [form] = Form.useForm();
    const { TextArea } = Input;
    const frameNum = useStates().frameNum;
    const frameUrl = useStates().frameUrl;
    const setFrameAnnotation = useStateSetters().setFrameAnnotation;
    const setActiveAnnoObj = useStateSetters().setActiveAnnoObj;
    const videoId = useStates().videoId;
    const annotationRef = useStates().annotationRef;
    

    // When the frameNum changes, the Notes for the new frame are displayed
    useEffect(() => {
        if (frameNum=== undefined || !notes) return;
            console.log(frameNum);
            form.setFieldsValue({
                notes: notes[frameNum]? notes[frameNum]:"", // Enter notes here
            });
    }, [frameNum, form, notes])


    async function onEnter() { 
        const id = createId();  // each item in the database has to have a unique ID
        const note = form.getFieldValue("notes");
        setNotes(prevNotes => ({...prevNotes, [frameNum]:note})) // Makes shallow copy of notes, appends current note
        setActiveAnnoObj(note);
    }

    return (
        <>
            <Form className='my-2 mx-3' form={form} size='small'>
                <Form.Item name="notes">
                    <TextArea placeholder="Enter notes here:" onPressEnter={onEnter} rows={10} style={{width: '100%'}} />   
                </Form.Item> 
            </Form>                     
        </>
    )
}

// TODO: enable Interval Annotations