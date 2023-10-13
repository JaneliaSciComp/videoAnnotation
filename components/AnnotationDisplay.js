import React, {useState, useEffect} from 'react';
import styles from '../styles/Workspace.module.css';
import { Descriptions } from 'antd';
import { useStates } from './AppContext';

export default function AnnotationDisplay(props) {
    const emtpyInfo = [
        {
            key: '1',
            label: 'label',
            children: ''
        },
        {
            key: '2',
            label: 'type',
            children: ''
        },
        {
            key: '3',
            label: 'data',
            children: ''
        },
    ];
    const [info, setInfo] = useState(emtpyInfo);

    const annoObj = useStates().activeAnnoObj;

    useEffect(() => {
        // console.log(props.idObj);
        if (annoObj) {
            const tempInfo = [];
            let i = 0;
            Object.keys(annoObj).forEach((key) => {
                const item = {};
                switch (key) {
                    case 'label' :
                        item.children = annoObj[key];
                        break;
                    case 'type':
                        item.children = annoObj[key];
                        break;
                    case 'data':
                        item.children = JSON.stringify(annoObj[key]);
                        break;
                }
                if (Object.keys(item).length>0) {
                    item.key = i.toString();
                    item.label = key;
                    tempInfo.push(item);
                    i++;
                }
            })
            setInfo(tempInfo)
        } else {
            setInfo(emtpyInfo);
        }
        
    }, [annoObj])
    

    return (
        <Descriptions 
            className='my-2 px-2 py-2 border rounded'
            style={{width: '25em', height: '200px', overflow: 'scroll', padding: '1em 0'}} 
            title="Annotation" 
            items={info} 
            />
    )
}