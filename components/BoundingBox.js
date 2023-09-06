import BtnPrototype from './BtnPrototype';

export default function BoundingBox(props) {

    return (
        <BtnPrototype
         label={props.label}
         color={props.color}
         type='bbox' 
         drawType={props.drawType}
         setDrawType={props.setDrawType}
        //  addId={props.addRectId}
         frameNum={props.frameNum}
         addAnnotationObj={props.addAnnotationObj}
         >
        </BtnPrototype>
    )
}