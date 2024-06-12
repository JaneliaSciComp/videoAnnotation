import ShapeBtn from './ShapeBtn';
import Category from './Category';
import SkeletonBtn from './SkeletonBtn';
import BrushBtn from './BrushBtn';
import BrushTool from './BrushTool';
import { useState, useEffect } from 'react';
import {Row} from 'react-bootstrap';

export default function BtnGroup(props) {
    /*
        To bundle a group of annotation btns of the same type.
        Props: 
            data: 
                {   
                    groupIndex: '...',
                    groupType: 'shape',
                    btnType: 'bbox',
                    btnNum: 2,
                    childData: [
                        {index: 0, 
                        btnType: 'bbox',
                        label: 'fly',
                        color: '#FFFFFF'
                        },
                        {index: 1, ...},
                        ...
                    ],
                    edgeData: { // only for skeleton
                        color: '#1677FF',
                        edges: [ [], [], ...]
                    },
                    skeletonName: 'mouse' //only for skeleton
                },
            enableBrushTool: boolean. True when specified. Whether to add BrushTool comp when the children are BrushBtns.
    */

    const [btns, setBtns] = useState()


    useEffect(() => {
        if (props.data) {
            const res = renderBtns();
            setBtns(res);
        }
    }, [props])

    function renderBtns() {
        const childData = props.data.childData;
        let btns;
        if (childData && props.data.groupType) {
            switch (props.data.groupType) {
                case 'category':
                    btns = childData.map((item, i) =>
                                <Category 
                                    key={i}
                                    label={item.label}
                                    color={item.color}
                                    />
                            );
                    break;
                case 'shape':
                    btns = childData.map((item, i) => 
                                <ShapeBtn
                                    key={i}
                                    type={item.btnType} 
                                    label={item.label}
                                    color={item.color}
                                    />
                            );
                    break;
                case 'skeleton':
                    btns = [
                            <SkeletonBtn
                                key={0}
                                groupIndex={props.data.groupIndex}
                                data={childData}
                                skeletonName={props.data.skeletonName}
                                />
                            ]
                    break;
                case 'brush':
                    btns = [];
                    let k = 0;
                    if (props.enableBrushTool) {
                        btns.push(<BrushTool key={k++}/>);
                    }
                    const brushBtns = childData.map((item, i) => 
                                        <BrushBtn
                                            key={i}
                                            label={item.label}
                                            color={item.color}
                                            omitCrowdRadio={item.omitCrowdRadio}
                                            />
                                    )
                    btns.push(
                        <div key={k} style={{display: 'flex', flexWrap: 'wrap'}}>
                            {brushBtns}
                        </div>
                    )
                    break;                    
            }
        }
        
        return btns;
    }

    return (
        <div className='my-1' >
            {btns? btns:null}
        </div>
    )
}