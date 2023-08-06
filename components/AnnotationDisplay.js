import React, {useState, useEffect} from 'react';
import { Descriptions } from 'antd';

export default function AnnotationDisplay(props) {
    const [info, setInfo] = useState([]);

    useEffect(() => {
        if (props.idObj) {
            const tempInfo = [
                // {key: }
            ];
            let i = 0;
            Object.keys(props.idObj).forEach((key) => {
                const item = {
                    // key: ''
                };
                
                switch (key) {
                    case 'label' :
                        item.children = props.idObj[key];
                    case 'type':
                        item.children = props.idObj[key];
                    case 'data':
                        item.children = JSON.stringify(props.idObj[key]);
                }
                if (Object.keys(item).length>0) {
                    item.key = i.toString();
                    item.label = key;
                    tempInfo.push(item);
                    i++;
                }
                
            })
            setInfo(tempInfo)
        }
        
    }, [props])
    

    return (
        <Descriptions 
            className='my-2 px-2 border rounded' 
            title="Annotation" 
            items={info} 
            />
    )
}