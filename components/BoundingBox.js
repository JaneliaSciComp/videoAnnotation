import BtnPrototype from './BtnPrototype';

export default function BoundingBox(props) {

    return (
        <BtnPrototype
         label={props.label}
         color={props.color}
         type='bbox' 
         drawObj={props.drawRect}
         setDraw={props.setDrawRect}
         addId={props.addRectId}
         >
        </BtnPrototype>
    )
}