import BtnPrototype from './BtnPrototype';

export default function Polygon(props) {

    return (
        <BtnPrototype
         label={props.label}
         color={props.color}
         type='polygon' 
         drawType={props.drawType}
         setDrawType={props.setDrawType}
        //  addId={props.addPolygonId}
         frameNum={props.frameNum}
         addAnnotationObj={props.addAnnotationObj}
         >
        </BtnPrototype>
    )
}