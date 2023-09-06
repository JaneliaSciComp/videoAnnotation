import BtnPrototype from './BtnPrototype';

export default function KeyPoint(props) {

    return (
        <BtnPrototype
         label={props.label}
         color={props.color}
         type='keyPoint' 
         drawType={props.drawType}
         setDrawType={props.setDrawType}
         frameNum={props.frameNum}
         addAnnotationObj={props.addAnnotationObj}
        //  addId={props.addKeyPointId}
         >
        </BtnPrototype>
    )
}