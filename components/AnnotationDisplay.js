import React, {useState, useEffect} from 'react';
import { Descriptions, Empty } from 'antd';

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

    useEffect(() => {
        // console.log(props.idObj);
        if (props.idObj) {
            const tempInfo = [];
            let i = 0;
            Object.keys(props.idObj).forEach((key) => {
                const item = {};
                switch (key) {
                    case 'label' :
                        item.children = props.idObj[key];
                        break;
                    case 'type':
                        item.children = props.idObj[key];
                        break;
                    case 'data':
                        item.children = JSON.stringify(props.idObj[key]);
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
        
    }, [props])
    

    return (
        <Descriptions 
            className='my-2 px-2 py-2 border rounded'
            style={{height: '200px', overflow: 'scroll', padding: '1em 0'}} 
            title="Annotation" 
            items={info} 
            />
    )
}