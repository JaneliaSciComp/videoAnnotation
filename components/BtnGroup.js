import ShapeBtn from './ShapeBtn';
import Category from './Category';
import { Fragment } from 'react';


export default function BtnGroup(props) {

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
                console.log('shapeBtn');
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
        console.log('btnGroup', btns);
        return btns;
    }

    return (
        <Fragment>
            {renderBtns()}
        </Fragment>
    )
}