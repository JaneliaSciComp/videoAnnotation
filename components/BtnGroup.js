import ShapeBtn from './ShapeBtn';
import Category from './Category';
import SkeletonBtn from './SkeletonBtn';
import { useState, useEffect } from 'react';
import {Row} from 'react-bootstrap';

export default function BtnGroup(props) {
    /*
        To bundle a group of annotating btns of the same type.
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
                ]
            }
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
                btns = childData.map((item, i) =>
                            // <Category 
                            //     key={i}
                            //     label={item.label}
                            //     color={item.color}
                            //     frameNum={props.frameNum}
                            //     frameUrl={props.frameUrl}
                            //     addAnnotationObj={props.addAnnotationObj}
                            //     setActiveIdObj={props.setActiveIdObj}
                            //     />
                            <Category 
                                key={i}
                                label={item.label}
                                color={item.color}
                                />
                        );
                break;
            case 'shape':
                btns = childData.map((item, i) => 
                            // <ShapeBtn
                            //     key={i}
                            //     type={item.btnType} 
                            //     label={item.label}
                            //     color={item.color}
                            //     frameNum={props.frameNum}
                            //     frameUrl={props.frameUrl}
                            //     addAnnotationObj={props.addAnnotationObj}
                            //     drawType={props.drawType}
                            //     setDrawType={props.setDrawType}
                            //     />
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
                        // <SkeletonBtn
                        //     key={0}
                        //     groupIndex={props.data.groupIndex}
                        //     data={childData}
                        //     frameNum={props.frameNum}
                        //     frameUrl={props.frameUrl}
                        //     addAnnotationObj={props.addAnnotationObj}
                        //     drawType={props.drawType}
                        //     setDrawType={props.setDrawType}
                        //     skeletonLandmark={props.skeletonLandmark}
                        //     setSkeletonLandmark={props.setSkeletonLandmark}
                        //     frameAnnotation={props.frameAnnotation}
                        //     />
                        <SkeletonBtn
                            key={0}
                            groupIndex={props.data.groupIndex}
                            data={childData}
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