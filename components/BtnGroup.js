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
    }, [props])

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