import ShapeBtn from './ShapeBtn';
import Category from './Category';
import { useState, useEffect } from 'react';
import { Space } from 'antd';


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
            [
                {index: 0, 
                 groupType: 'shape',
                 btnType: 'bbox',
                 label: 'fly',
                 color: '#FFFFFF'
                },
                {index: 1, ...},
                ...
            ]}
            frameNum={frameNum}
            addAnnotationObj={addAnnotationObj}
            setActiveIdObj={setActiveIdObj}
            drawType={drawType}
            setDrawType={setDrawType}
    */

    const [btns, setBtns] = useState()

    useEffect(() => {
        if (props.data) {
            const res = renderBtns();
            setBtns(res);
        }
    }, [props.data])

    function renderBtns() {
        console.log('renderBtns called');
        let btns = props.data.map((item, i)=>{
            switch (item.groupType) {
                case 'category':
                    return <Category 
                                key={i}
                                label={item.label}
                                color={item.color}
                                frameNum={props.frameNum}
                                addAnnotationObj={props.addAnnotationObj}
                                setActiveIdObj={props.setActiveIdObj}
                                />
                    break;
                case 'shape':
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
            }
        });

        // switch (props.child) {
        //     case 'category':
        //         for (let i = 0; i < props.numOfBtn; i++) {
        //             btns.push(<Category 
        //                         key={i}
        //                         label={props.labels[i]}
        //                         color={props.colors[i]}
        //                         frameNum={props.frameNum}
        //                         addAnnotationObj={props.addAnnotationObj}
        //                         setActiveIdObj={props.setActiveIdObj}
        //                         />);
        //         }
        //         break;
        //     case 'shapeBtn':
        //         // console.log('shapeBtn');
        //         for (let i = 0; i < props.numOfBtn; i++) {
        //             btns.push(<ShapeBtn
        //                         key={i}
        //                         type={props.type} 
        //                         label={props.labels[i]}
        //                         color={props.colors[i]}
        //                         frameNum={props.frameNum}
        //                         addAnnotationObj={props.addAnnotationObj}
        //                         drawType={props.drawType}
        //                         setDrawType={props.setDrawType}
        //                         />);
        //         }
        //         break;
        // }
        // console.log('btnGroup', btns);
        return btns;
    }

    return (
        // <Fragment>
        <Space className='px-0'>
            {btns? btns:null}
        </Space>
        // </Fragment>
    )
}