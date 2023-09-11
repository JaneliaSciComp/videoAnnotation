import ShapeBtn from './ShapeBtn';
import Category from './Category';
import { Fragment } from 'react';


export default function BtnGroup(props) {
    /*
        To bundle a group of annotating btns of the same type.
        Props: 
            child='shapeBtn'
            type='bbox'. Omit for 'category' btns
            numOfBtn={2}
            labels={['fly','mouse']}. The label for each child btn
            colors={['red', 'blue']}. The color for each child btn
            frameNum={frameNum}
            addAnnotationObj={addAnnotationObj}
            setActiveIdObj={setActiveIdObj}
            drawType={drawType}
            setDrawType={setDrawType}
    */

    function renderBtns() {
        let btns = [];
        switch (props.child) {
            case 'category':
                for (let i = 0; i < props.numOfBtn; i++) {
                    btns.push(<Category 
                                key={i}
                                label={props.labels[i]}
                                color={props.colors[i]}
                                frameNum={props.frameNum}
                                addAnnotationObj={props.addAnnotationObj}
                                setActiveIdObj={props.setActiveIdObj}
                                />);
                }
                break;
            case 'shapeBtn':
                // console.log('shapeBtn');
                for (let i = 0; i < props.numOfBtn; i++) {
                    btns.push(<ShapeBtn
                                key={i}
                                type={props.type} 
                                label={props.labels[i]}
                                color={props.colors[i]}
                                frameNum={props.frameNum}
                                addAnnotationObj={props.addAnnotationObj}
                                drawType={props.drawType}
                                setDrawType={props.setDrawType}
                                />);
                }
                break;
        }
        // console.log('btnGroup', btns);
        return btns;
    }

    return (
        // <Fragment>
        <div className='px-0'>
            {renderBtns()}
        </div>
        // </Fragment>
    )
}