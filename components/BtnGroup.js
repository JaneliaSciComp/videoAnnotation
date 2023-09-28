import ShapeBtn from './ShapeBtn';
import Category from './Category';
import SkeletonBtn from './SkeletonBtn';
import { useState, useEffect } from 'react';
import {Row} from 'react-bootstrap';

export default function BtnGroup(props) {
    /*
        To bundle a group of annotating btns of the same type.
        Props: 
            // groupType='shapeBtn'
            // btnType='bbox'. Omit for 'category' btns
            // numOfBtn={2}
            // labels={['fly','mouse']}. The label for each child btn
            // colors={['red', 'blue']}. The color for each child btn
            data: 
            {
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
                ]
            }
            frameNum={frameNum}
            addAnnotationObj={addAnnotationObj}
            setActiveIdObj={setActiveIdObj}
            drawType={drawType}
            setDrawType={setDrawType}
    */

    const [btns, setBtns] = useState()

    useEffect(() => {
        if (props.data) {
            // console.log('btnGroup', props.data);
            const res = renderBtns();
            setBtns(res);
        }
    }, [props])

    function renderBtns() {
        // console.log('renderBtns called');
        const childData = props.data.childData;
        // console.log(props.data);
        // console.log(props.data.childData);
        let btns;
        switch (props.data.groupType) {
            case 'category':
                btns = childData.map((item, i)=>{
                            return <Category 
                                key={i}
                                label={item.label}
                                color={item.color}
                                frameNum={props.frameNum}
                                addAnnotationObj={props.addAnnotationObj}
                                setActiveIdObj={props.setActiveIdObj}
                                />
                        });
                break;
            case 'shape':
                btns = childData.map((item, i)=>{
                            return <ShapeBtn
                                key={i}
                                type={item.btnType} 
                                label={item.label}
                                color={item.color}
                                frameNum={props.frameNum}
                                addAnnotationObj={props.addAnnotationObj}
                                drawType={props.drawType}
                                setDrawType={props.setDrawType}
                                />
                        });
                break;
            case 'skeleton':
                btns = [<SkeletonBtn
                            key={0}
                            type='skeleton' 
                            data={childData}
                            frameNum={props.frameNum}
                            addAnnotationObj={props.addAnnotationObj}
                            drawType={props.drawType}
                            setDrawType={props.setDrawType}
                            />
                        ]
                break;
        }
        
        return btns;
    }

    return (
        // <Fragment>
        <div className='my-1'>
            {btns? btns:null}
        </div>
        // </Fragment>
    )
}